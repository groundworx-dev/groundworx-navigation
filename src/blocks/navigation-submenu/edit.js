/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { TextControl, TextareaControl, ToolbarButton, ToolbarGroup, __experimentalToolsPanel as ToolsPanel, __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';
import { BlockControls, InnerBlocks, useInnerBlocksProps, InspectorControls, RichText, useBlockProps, store as blockEditorStore } from '@wordpress/block-editor';
import { speak } from '@wordpress/a11y';
import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { displayShortcut, isKeyboardEvent } from '@wordpress/keycodes';
import { isURL, prependHTTP } from '@wordpress/url';
import { useState, useEffect, useRef } from '@wordpress/element';
import { link as linkIcon, removeSubmenu } from '@wordpress/icons';
import { useMergeRefs, usePrevious } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { ItemSubmenuIcon } from './icons';
import { LinkUI } from '../navigation-link/link-ui';
import { updateAttributes } from '../navigation-link/update-attributes';
import { getColors, getNavigationChildBlockProps } from './../navigation-menu/edit/utils';
import { DEFAULT_BLOCK, ALLOWED_BLOCKS } from './../navigation-menu/constants';

import './index.scss';

/**
 * A React hook to determine if it's dragging within the target element.
 *
 * @typedef {import('@wordpress/element').RefObject} RefObject
 *
 * @param {RefObject<HTMLElement>} elementRef The target elementRef object.
 *
 * @return {boolean} Is dragging within the target element.
 */
const useIsDraggingWithin = ( elementRef ) => {
	const [ isDraggingWithin, setIsDraggingWithin ] = useState( false );

	useEffect( () => {
		const { ownerDocument } = elementRef.current;

		function handleDragStart( event ) {
			// Check the first time when the dragging starts.
			handleDragEnter( event );
		}

		// Set to false whenever the user cancel the drag event by either releasing the mouse or press Escape.
		function handleDragEnd() {
			setIsDraggingWithin( false );
		}

		function handleDragEnter( event ) {
			// Check if the current target is inside the item element.
			if ( elementRef.current.contains( event.target ) ) {
				setIsDraggingWithin( true );
			} else {
				setIsDraggingWithin( false );
			}
		}

		// Bind these events to the document to catch all drag events.
		// Ideally, we can also use `event.relatedTarget`, but sadly that
		// doesn't work in Safari.
		ownerDocument.addEventListener( 'dragstart', handleDragStart );
		ownerDocument.addEventListener( 'dragend', handleDragEnd );
		ownerDocument.addEventListener( 'dragenter', handleDragEnter );

		return () => {
			ownerDocument.removeEventListener( 'dragstart', handleDragStart );
			ownerDocument.removeEventListener( 'dragend', handleDragEnd );
			ownerDocument.removeEventListener( 'dragenter', handleDragEnter );
		};
	}, [] );

	return isDraggingWithin;
};

/**
 * @typedef {'post-type'|'custom'|'taxonomy'|'post-type-archive'} WPNavigationLinkKind
 */

/**
 * Navigation Link Block Attributes
 *
 * @typedef {Object} WPNavigationLinkBlockAttributes
 *
 * @property {string}               [label]         Link text.
 * @property {WPNavigationLinkKind} [kind]          Kind is used to differentiate between term and post ids to check post draft status.
 * @property {string}               [type]          The type such as post, page, tag, category and other custom types.
 * @property {string}               [rel]           The relationship of the linked URL.
 * @property {number}               [id]            A post or term id.
 * @property {boolean}              [opensInNewTab] Sets link target to _blank when true.
 * @property {string}               [url]           Link href.
 */

export default function NavigationSubmenuEdit( {
	attributes,
	isSelected,
	setAttributes,
	mergeBlocks,
	onReplace,
	context,
	clientId,
} ) {
	const { label, url, description, rel } = attributes;

	const { showSubmenuIcon, maxNestingLevel } = context;

	const {
		__unstableMarkNextChangeAsNotPersistent,
		replaceBlock,
		selectBlock,
	} = useDispatch( blockEditorStore );
	const [ isLinkOpen, setIsLinkOpen ] = useState( false );
	// Store what element opened the popover, so we know where to return focus to (toolbar button vs navigation link text)
	const [ openedBy, setOpenedBy ] = useState( null );
	// Use internal state instead of a ref to make sure that the component
	// re-renders when the popover's anchor updates.
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const listItemRef = useRef( null );
	const isDraggingWithin = useIsDraggingWithin( listItemRef );
	const itemLabelPlaceholder = __( 'Add text…', 'groundworx-navigation' );
	const ref = useRef();

	const {
		parentCount,
		isParentOfSelectedBlock,
		isImmediateParentOfSelectedBlock,
		hasChildren,
		selectedBlockHasChildren,
		onlyDescendantIsEmptyLink,
	} = useSelect(
		( select ) => {
			const {
				hasSelectedInnerBlock,
				getSelectedBlockClientId,
				getBlockParentsByBlockName,
				getBlock,
				getBlockCount,
				getBlockOrder,
			} = select( blockEditorStore );

			let _onlyDescendantIsEmptyLink;

			const selectedBlockId = getSelectedBlockClientId();

			const selectedBlockChildren = getBlockOrder( selectedBlockId );

			// Check for a single descendant in the submenu. If that block
			// is a link block in a "placeholder" state with no label then
			// we can consider as an "empty" link.
			if ( selectedBlockChildren?.length === 1 ) {
				const singleBlock = getBlock( selectedBlockChildren[ 0 ] );

				_onlyDescendantIsEmptyLink =
					singleBlock?.name === 'groundworx/navigation-link' &&
					! singleBlock?.attributes?.label;
			}

			return {
				parentCount: getBlockParentsByBlockName(
					clientId,
					'groundworx/navigation-submenu'
				).length,
				isParentOfSelectedBlock: hasSelectedInnerBlock(
					clientId,
					true
				),
				isImmediateParentOfSelectedBlock: hasSelectedInnerBlock(
					clientId,
					false
				),
				hasChildren: !! getBlockCount( clientId ),
				selectedBlockHasChildren: !! selectedBlockChildren?.length,
				onlyDescendantIsEmptyLink: _onlyDescendantIsEmptyLink,
			};
		},
		[ clientId ]
	);

	const prevHasChildren = usePrevious( hasChildren );

	// Show the LinkControl on mount if the URL is empty
	// ( When adding a new menu item)
	// This can't be done in the useState call because it conflicts
	// with the autofocus behavior of the BlockListBlock component.
	useEffect( () => {
		if ( ! url ) {
			setIsLinkOpen( true );
		}
	}, [] );

	/**
	 * The hook shouldn't be necessary but due to a focus loss happening
	 * when selecting a suggestion in the link popover, we force close on block unselection.
	 */
	useEffect( () => {
		if ( ! isSelected ) {
			setIsLinkOpen( false );
		}
	}, [ isSelected ] );

	// If the LinkControl popover is open and the URL has changed, close the LinkControl and focus the label text.
	useEffect( () => {
		if ( isLinkOpen && url ) {
			// Does this look like a URL and have something TLD-ish?
			if (
				isURL( prependHTTP( label ) ) &&
				/^.+\.[a-z]+/.test( label )
			) {
				// Focus and select the label text.
				selectLabelText();
			}
		}
	}, [ url ] );

	/**
	 * Focus the Link label text and select it.
	 */
	function selectLabelText() {
		ref.current.focus();
		const { ownerDocument } = ref.current;
		const { defaultView } = ownerDocument;
		const selection = defaultView.getSelection();
		const range = ownerDocument.createRange();
		// Get the range of the current ref contents so we can add this range to the selection.
		range.selectNodeContents( ref.current );
		selection.removeAllRanges();
		selection.addRange( range );
	}

	function onKeyDown( event ) {
		if ( isKeyboardEvent.primary( event, 'k' ) ) {
			// Required to prevent the command center from opening,
			// as it shares the CMD+K shortcut.
			// See https://github.com/WordPress/gutenberg/pull/59845.
			event.preventDefault();
			// If we don't stop propagation, this event bubbles up to the parent submenu item
			event.stopPropagation();
			setIsLinkOpen( true );
			setOpenedBy( ref.current );
		}
	}

	const blockProps = useBlockProps( {
		ref: useMergeRefs( [ setPopoverAnchor, listItemRef ] ),
		className: clsx( 'gwx-menu-item', 'open-on-click', {
			'is-editing': isSelected || isParentOfSelectedBlock,
			'is-dragging-within': isDraggingWithin,
			'has-link': !! url,
			'has-child': hasChildren
		} ),
		onKeyDown,
	} );

	// Always use overlay colors for submenus.
	const innerBlocksColors = getColors( context, true );

	const allowedBlocks =
		parentCount >= maxNestingLevel
			? ALLOWED_BLOCKS.filter(
					( blockName ) => blockName !== 'groundworx/navigation-submenu'
			  )
			: ALLOWED_BLOCKS;
			
	const navigationChildBlockProps = getNavigationChildBlockProps( innerBlocksColors );
	
	const innerBlocksProps = useInnerBlocksProps( navigationChildBlockProps, {
		allowedBlocks,
		defaultBlock: DEFAULT_BLOCK,
		directInsert: true,

		// Ensure block toolbar is not too far removed from item
		// being edited.
		// see: https://github.com/WordPress/gutenberg/pull/34615.
		__experimentalCaptureToolbars: true,

		renderAppender:
			isSelected ||
			( isImmediateParentOfSelectedBlock &&
				! selectedBlockHasChildren )
				? InnerBlocks.ButtonBlockAppender
				: false,
	} );

	const ParentElement = 'div';

	function transformToLink() {
		const newLinkBlock = createBlock( 'groundworx/navigation-link', attributes );
		replaceBlock( clientId, newLinkBlock );
	}

	useEffect( () => {
		// If block becomes empty, transform to Navigation Link.
		if ( ! hasChildren && prevHasChildren ) {
			// This side-effect should not create an undo level as those should
			// only be created via user interactions.
			__unstableMarkNextChangeAsNotPersistent();
			transformToLink();
		}
	}, [ hasChildren, prevHasChildren ] );

	const canConvertToLink =
		! selectedBlockHasChildren || onlyDescendantIsEmptyLink;

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
				
					<ToolbarButton
						name="link"
						icon={ linkIcon }
						title={ __( 'Link', 'groundworx-navigation' ) }
						shortcut={ displayShortcut.primary( 'k' ) }
						onClick={ ( event ) => {
							setIsLinkOpen( true );
							setOpenedBy( event.currentTarget );
						} }
					/>
				
					<ToolbarButton
						name="revert"
						icon={ removeSubmenu }
						title={ __( 'Convert to Link', 'groundworx-navigation' ) }
						onClick={ transformToLink }
						className="gwx-menu__submenu__revert"
						disabled={ ! canConvertToLink }
					/>
				</ToolbarGroup>
			</BlockControls>
			{ /* Warning, this duplicated in packages/block-library/src/menu-link/edit.js */ }
			<InspectorControls>
				<ToolsPanel
					label={ __( 'Settings', 'groundworx-navigation' ) }
					resetAll={ () => {
						setAttributes( {
							label: '',
							url: '',
							description: '',
							rel: '',
						} );
					} }
				>
					<ToolsPanelItem
						label={ __( 'Text', 'groundworx-navigation' ) }
						isShownByDefault
						hasValue={ () => !! label }
						onDeselect={ () => setAttributes( { label: '' } ) }
					>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							value={ label || '' }
							onChange={ ( labelValue ) => {
								setAttributes( { label: labelValue } );
							} }
							label={ __( 'Text', 'groundworx-navigation' ) }
							autoComplete="off"
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Link', 'groundworx-navigation' ) }
						isShownByDefault
						hasValue={ () => !! url }
						onDeselect={ () => setAttributes( { url: '' } ) }
					>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							value={ url || '' }
							onChange={ ( urlValue ) => {
								setAttributes( { url: urlValue } );
							} }
							label={ __( 'Link', 'groundworx-navigation' ) }
							autoComplete="off"
							type="url"
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Description', 'groundworx-navigation' ) }
						isShownByDefault
						hasValue={ () => !! description }
						onDeselect={ () =>
							setAttributes( { description: '' } )
						}
					>
						<TextareaControl
							__nextHasNoMarginBottom
							value={ description || '' }
							onChange={ ( descriptionValue ) => {
								setAttributes( {
									description: descriptionValue,
								} );
							} }
							label={ __( 'Description', 'groundworx-navigation' ) }
							help={ __(
								'The description will be displayed in the menu if the current theme supports it.', 'groundworx-navigation'
							) }
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Rel attribute', 'groundworx-navigation' ) }
						isShownByDefault
						hasValue={ () => !! rel }
						onDeselect={ () => setAttributes( { rel: '' } ) }
					>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							value={ rel || '' }
							onChange={ ( relValue ) => {
								setAttributes( { rel: relValue } );
							} }
							label={ __( 'Rel attribute', 'groundworx-navigation' ) }
							autoComplete="off"
							help={ __(
								'The relationship of the linked URL as space-separated link types.', 'groundworx-navigation'
							) }
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>
			<div { ...blockProps }>
				{ /* eslint-disable jsx-a11y/anchor-is-valid */ }
				<ParentElement className="gwx-menu-item__content">
					{ /* eslint-enable */ }
					<RichText
						ref={ ref }
						tagName='a'
						identifier="label"
						className="gwx-menu-item__label"
						value={ label }
						onChange={ ( labelValue ) =>
							setAttributes( { label: labelValue } )
						}
						onMerge={ mergeBlocks }
						onReplace={ onReplace }
						aria-label={ __( 'Navigation link text', 'groundworx-navigation' ) }
						placeholder={ itemLabelPlaceholder }
						withoutInteractiveFormatting
						onClick={ () => {
							if ( ! url ) {
								setIsLinkOpen( true );
								setOpenedBy( ref.current );
							}
						} }
					/>
					{ ( showSubmenuIcon ) && (
						<span className="gwx-menu-item__icon">
							<ItemSubmenuIcon />
						</span>
					) }
					{ description && (
						<span className="gwx-menu-item__description">
							{ description }
						</span>
					) }
					{ isLinkOpen && (
						<LinkUI
							clientId={ clientId }
							link={ attributes }
							onClose={ () => {
								setIsLinkOpen( false );
								if ( openedBy ) {
									openedBy.focus();
									setOpenedBy( null );
								} else {
									selectBlock( clientId );
								}
							} }
							anchor={ popoverAnchor }
							onRemove={ () => {
								setAttributes( { url: '' } );
								speak( __( 'Link removed.' ), 'assertive' );
							} }
							onChange={ ( updatedValue ) => {
								updateAttributes(
									updatedValue,
									setAttributes,
									attributes
								);
							} }
						/>
					) }
					
				</ParentElement>
				
				<div className="gwx-menu-item__subcontent">
					<div { ...innerBlocksProps } />
				</div>
			</div>
		</>
	);
}

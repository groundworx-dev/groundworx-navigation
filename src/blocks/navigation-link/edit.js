/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */

import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	TextControl,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { displayShortcut, isKeyboardEvent } from '@wordpress/keycodes';
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	RichText,
	useBlockProps,
	store as blockEditorStore,
	getColorClassName,
	useInnerBlocksProps,
	useBlockEditingMode,
	useBlockEditContext
} from '@wordpress/block-editor';
import { isURL, prependHTTP, safeDecodeURI } from '@wordpress/url';
import { useState, useEffect, useRef } from '@wordpress/element';
import { __unstableStripHTML as stripHTML } from '@wordpress/dom';
import { decodeEntities } from '@wordpress/html-entities';
import { link as linkIcon, addSubmenu } from '@wordpress/icons';
import { store as coreStore } from '@wordpress/core-data';
import { useMergeRefs, usePrevious } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { LinkUI } from './link-ui';
import { updateAttributes } from './update-attributes';

import { DEFAULT_BLOCK } from './../navigation-menu/constants';

const NESTING_BLOCK_NAMES = [
	'groundworx/navigation-link',
	'groundworx/navigation-submenu',
];

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
	}, [ elementRef ] );

	return isDraggingWithin;
};

const useIsInvalidLink = ( kind, type, id, enabled ) => {
	const isPostType =
		kind === 'post-type' || type === 'post' || type === 'page';
	const hasId = Number.isInteger( id );
	const blockEditingMode = useBlockEditingMode();

	const postStatus = useSelect(
		( select ) => {
			if ( ! isPostType ) {
				return null;
			}

			// Fetching the posts status is an "expensive" operation. Especially for sites with large navigations.
			// When the block is rendered in a template or other disabled contexts we can skip this check in order
			// to avoid all these additional requests that don't really add any value in that mode.
			if ( blockEditingMode === 'disabled' || ! enabled ) {
				return null;
			}

			const { getEntityRecord } = select( coreStore );
			return getEntityRecord( 'postType', type, id )?.status;
		},
		[ isPostType, blockEditingMode, enabled, type, id ]
	);

	// Check Navigation Link validity if:
	// 1. Link is 'post-type'.
	// 2. It has an id.
	// 3. It's neither null, nor undefined, as valid items might be either of those while loading.
	// If those conditions are met, check if
	// 1. The post status is published.
	// 2. The Navigation Link item has no label.
	// If either of those is true, invalidate.
	const isInvalid =
		isPostType && hasId && postStatus && 'trash' === postStatus;
	const isDraft = 'draft' === postStatus;

	return [ isInvalid, isDraft ];
};

function getMissingText( type ) {
	let missingText = '';

	switch ( type ) {
		case 'post':
			/* translators: label for missing post in navigation link block */
			missingText = __( 'Select post', 'groundworx-navigation' );
			break;
		case 'page':
			/* translators: label for missing page in navigation link block */
			missingText = __( 'Select page', 'groundworx-navigation' );
			break;
		case 'category':
			/* translators: label for missing category in navigation link block */
			missingText = __( 'Select category', 'groundworx-navigation' );
			break;
		case 'tag':
			/* translators: label for missing tag in navigation link block */
			missingText = __( 'Select tag', 'groundworx-navigation' );
			break;
		default:
			/* translators: label for missing values in navigation link block */
			missingText = __( 'Add link', 'groundworx-navigation' );
	}

	return missingText;
}

/*
 * Warning, this duplicated in
 * packages/block-library/src/navigation-submenu/edit.js
 * Consider reusing this components for both blocks.
 */
function Controls( { attributes, setAttributes, setIsLabelFieldFocused } ) {
	const { label, url, description, rel } = attributes;
	return (
		<ToolsPanel label={ __( 'Settings', 'groundworx-navigation' ) }>
			<ToolsPanelItem
				hasValue={ () => !! label }
				label={ __( 'Text', 'groundworx-navigation' ) }
				onDeselect={ () => setAttributes( { label: '' } ) }
				isShownByDefault
			>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Text', 'groundworx-navigation' ) }
					value={ label ? stripHTML( label ) : '' }
					onChange={ ( labelValue ) => {
						setAttributes( { label: labelValue } );
					} }
					autoComplete="off"
					onFocus={ () => setIsLabelFieldFocused( true ) }
					onBlur={ () => setIsLabelFieldFocused( false ) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => !! url }
				label={ __( 'Link', 'groundworx-navigation' ) }
				onDeselect={ () => setAttributes( { url: '' } ) }
				isShownByDefault
			>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Link', 'groundworx-navigation' ) }
					value={ url ? safeDecodeURI( url ) : '' }
					onChange={ ( urlValue ) => {
						updateAttributes(
							{ url: urlValue },
							setAttributes,
							attributes
						);
					} }
					autoComplete="off"
					type="url"
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => !! description }
				label={ __( 'Description', 'groundworx-navigation' ) }
				onDeselect={ () => setAttributes( { description: '' } ) }
				isShownByDefault
			>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Description', 'groundworx-navigation' ) }
					value={ description || '' }
					onChange={ ( descriptionValue ) => {
						setAttributes( { description: descriptionValue } );
					} }
					help={ __(
						'The description will be displayed in the menu if the current theme supports it.', 'groundworx-navigation'
					) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => !! rel }
				label={ __( 'Rel attribute', 'groundworx-navigation' ) }
				onDeselect={ () => setAttributes( { rel: '' } ) }
				isShownByDefault
			>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Rel attribute', 'groundworx-navigation' ) }
					value={ rel || '' }
					onChange={ ( relValue ) => {
						setAttributes( { rel: relValue } );
					} }
					autoComplete="off"
					help={ __(
						'The relationship of the linked URL as space-separated link types.', 'groundworx-navigation'
					) }
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}

export default function NavigationLinkEdit( props ) {
	const {
		attributes,
		isSelected,
		setAttributes,
		insertBlocksAfter,
		mergeBlocks,
		onReplace,
		context,
		clientId,
	} = props;
	const { id, label, type, url, description, kind } = attributes;
	const { maxNestingLevel } = context;

	const {
		replaceBlock,
		__unstableMarkNextChangeAsNotPersistent,
		selectBlock,
		selectPreviousBlock,
	} = useDispatch( blockEditorStore );
	// Have the link editing ui open on mount when lacking a url and selected.
	const [ isLinkOpen, setIsLinkOpen ] = useState( isSelected && ! url );
	// Store what element opened the popover, so we know where to return focus to (toolbar button vs navigation link text)
	const [ openedBy, setOpenedBy ] = useState( null );
	// Use internal state instead of a ref to make sure that the component
	// re-renders when the popover's anchor updates.
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const listItemRef = useRef( null );
	const isDraggingWithin = useIsDraggingWithin( listItemRef );
	const itemLabelPlaceholder = __( 'Add label…', 'groundworx-navigation' );
	const ref = useRef();
	const linkUIref = useRef();
	const prevUrl = usePrevious( url );

	// Change the label using inspector causes rich text to change focus on firefox.
	// This is a workaround to keep the focus on the label field when label filed is focused we don't render the rich text.
	const [ isLabelFieldFocused, setIsLabelFieldFocused ] = useState( false );

	const {
		isAtMaxNesting,
		isTopLevelLink,
		isParentOfSelectedBlock,
		hasChildren,
		validateLinkStatus,
	} = useSelect(
		( select ) => {
			const {
				getBlockCount,
				getBlockName,
				getBlockRootClientId,
				hasSelectedInnerBlock,
				getBlockParentsByBlockName,
				getSelectedBlockClientId,
			} = select( blockEditorStore );
			const rootClientId = getBlockRootClientId( clientId );
			const isTopLevel =
				getBlockName( rootClientId ) === 'groundworx/menu';
			const selectedBlockClientId = getSelectedBlockClientId();
			const rootNavigationClientId = isTopLevel
				? rootClientId
				: getBlockParentsByBlockName(
						clientId,
						'groundworx/menu'
				  )[ 0 ];

			// Enable when the root Navigation block is selected or any of its inner blocks.
			const enableLinkStatusValidation =
				selectedBlockClientId === rootNavigationClientId ||
				hasSelectedInnerBlock( rootNavigationClientId, true );

			return {
				isAtMaxNesting:
					getBlockParentsByBlockName( clientId, NESTING_BLOCK_NAMES )
						.length >= maxNestingLevel,
				isTopLevelLink: isTopLevel,
				isParentOfSelectedBlock: hasSelectedInnerBlock(
					clientId,
					true
				),
				hasChildren: !! getBlockCount( clientId ),
				validateLinkStatus: enableLinkStatusValidation,
			};
		},
		[ clientId, maxNestingLevel ]
	);
	const { getBlocks } = useSelect( blockEditorStore );

	const [ isInvalid, isDraft ] = useIsInvalidLink(
		kind,
		type,
		id,
		validateLinkStatus
	);

	/**
	 * Transform to submenu block.
	 */
	const transformToSubmenu = () => {
		let innerBlocks = getBlocks( clientId );
		if ( innerBlocks.length === 0 ) {
			innerBlocks = [ createBlock( 'groundworx/navigation-link' ) ];
			selectBlock( innerBlocks[ 0 ].clientId );
		}
		const newSubmenu = createBlock(
			'groundworx/navigation-submenu',
			attributes,
			innerBlocks
		);
		replaceBlock( clientId, newSubmenu );
	};

	useEffect( () => {
		// If block has inner blocks, transform to Submenu.
		if ( hasChildren ) {
			// This side-effect should not create an undo level as those should
			// only be created via user interactions.
			__unstableMarkNextChangeAsNotPersistent();
			transformToSubmenu();
		}
	}, [ hasChildren ] );

	// If the LinkControl popover is open and the URL has changed, close the LinkControl and focus the label text.
	useEffect( () => {
		// We only want to do this when the URL has gone from nothing to a new URL AND the label looks like a URL
		if (
			! prevUrl &&
			url &&
			isLinkOpen &&
			isURL( prependHTTP( label ) ) &&
			/^.+\.[a-z]+/.test( label )
		) {
			// Focus and select the label text.
			selectLabelText();
		}
	}, [ prevUrl, url, isLinkOpen, label ] );

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

	/**
	 * Removes the current link if set.
	 */
	function removeLink() {
		// Reset all attributes that comprise the link.
		// It is critical that all attributes are reset
		// to their default values otherwise this may
		// in advertently trigger side effects because
		// the values will have "changed".
		setAttributes( {
			url: undefined,
			label: undefined,
			id: undefined,
			kind: undefined,
			type: undefined,
			opensInNewTab: false,
		} );

		// Close the link editing UI.
		setIsLinkOpen( false );
	}

	function onKeyDown( event ) {
		if ( isKeyboardEvent.primary( event, 'k' ) ) {
			// Required to prevent the command center from opening,
			// as it shares the CMD+K shortcut.
			// See https://github.com/WordPress/gutenberg/pull/59845.
			event.preventDefault();
			// If this link is a child of a parent submenu item, the parent submenu item event will also open, closing this popover
			event.stopPropagation();
			setIsLinkOpen( true );
			setOpenedBy( ref.current );
		}
	}

	const blockProps = useBlockProps( {
		ref: useMergeRefs( [ setPopoverAnchor, listItemRef ] ),
		className: clsx( 'gwx-menu-item', {
			'is-editing': isSelected || isParentOfSelectedBlock,
			'is-dragging-within': isDraggingWithin,
			'has-link': !! url,
			'has-child': hasChildren,
		} ),
		style: {
		},
		onKeyDown,
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			...blockProps,
			className: 'remove-outline', // Remove the outline from the inner blocks container.
		},
		{
			defaultBlock: DEFAULT_BLOCK,
			directInsert: true,
			renderAppender: false,
		}
	);

	if ( ! url || isInvalid || isDraft ) {
		blockProps.onClick = () => {
			setIsLinkOpen( true );
			setOpenedBy( ref.current );
		};
	}

	const classes = clsx( 'gwx-menu-item__content', {
		'gwx-menu-link__placeholder': ! url || isInvalid || isDraft,
	} );

	const missingText = getMissingText( type );
	/* translators: Whether the navigation link is Invalid or a Draft. */
	const placeholderText = `(${
		isInvalid ? __( 'Invalid', 'groundworx-navigation' ) : __( 'Draft', 'groundworx-navigation' )
	})`;


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
					{ ! isAtMaxNesting && (
						<ToolbarButton
							name="submenu"
							icon={ addSubmenu }
							title={ __( 'Add submenu', 'groundworx-navigation' ) }
							onClick={ transformToSubmenu }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>
			{ /* Warning, this duplicated in packages/block-library/src/navigation-submenu/edit.js */ }
			<InspectorControls>
				<Controls
					attributes={ attributes }
					setAttributes={ setAttributes }
					setIsLabelFieldFocused={ setIsLabelFieldFocused }
				/>
			</InspectorControls>
			<div { ...blockProps }>
				{ /* eslint-disable jsx-a11y/anchor-is-valid */ }
				<div className={ classes }>
					{ /* eslint-enable */ }
					{ ! url ? (
						<div className="gwx-menu-link__placeholder-text">
							<span>{ missingText }</span>
						</div>
					) : (
						<>
							{ ! isInvalid &&
								! isDraft &&
								! isLabelFieldFocused && (
									<>
										<RichText
											ref={ ref }
											tagName='a'
											identifier="label"
											className="gwx-menu-item__label"
											value={ label }
											onChange={ ( labelValue ) =>
												setAttributes( {
													label: labelValue,
												} )
											}
											onMerge={ mergeBlocks }
											onReplace={ onReplace }
											__unstableOnSplitAtEnd={ () =>
												insertBlocksAfter(
													createBlock(
														'groundworx/navigation-link'
													)
												)
											}
											aria-label={ __(
												'Navigation link text', 'groundworx-navigation'
											) }
											placeholder={ itemLabelPlaceholder }
											withoutInteractiveFormatting
										/>
										{ description && (
											<span className="gwx-menu-item__description">
												{ description }
											</span>
										) }
									</>
								) }
							{ ( isInvalid ||
								isDraft ||
								isLabelFieldFocused ) && (
								<div
									className={ clsx(
										'gwx-menu-link__placeholder-text',
										'gwx-menu-link__label',
										{
											'is-invalid': isInvalid,
											'is-draft': isDraft,
										}
									) }
								>
									<span>
										{
											// Some attributes are stored in an escaped form. It's a legacy issue.
											// Ideally they would be stored in a raw, unescaped form.
											// Unescape is used here to "recover" the escaped characters
											// so they display without encoding.
											// See `updateAttributes` for more details.
											`${ decodeEntities( label ) } ${
												isInvalid || isDraft
													? placeholderText
													: ''
											}`.trim()
										}
									</span>
								</div>
							) }
						</>
					) }
					{ isLinkOpen && (
						<LinkUI
							ref={ linkUIref }
							clientId={ clientId }
							link={ attributes }
							onClose={ () => {
								// If there is no link then remove the auto-inserted block.
								// This avoids empty blocks which can provided a poor UX.
								if ( ! url ) {
									// Fixes https://github.com/WordPress/gutenberg/issues/61361
									// There's a chance we're closing due to the user selecting the browse all button.
									// Only move focus if the focus is still within the popover ui. If it's not within
									// the popover, it's because something has taken the focus from the popover, and
									// we don't want to steal it back.
									if (
										linkUIref.current.contains(
											window.document.activeElement
										)
									) {
										// Select the previous block to keep focus nearby
										selectPreviousBlock( clientId, true );
									}

									// Remove the link.
									onReplace( [] );
									return;
								}

								setIsLinkOpen( false );
								if ( openedBy ) {
									openedBy.focus();
									setOpenedBy( null );
								} else if ( ref.current ) {
									// select the ref when adding a new link
									ref.current.focus();
								} else {
									// Fallback
									selectPreviousBlock( clientId, true );
								}
							} }
							anchor={ popoverAnchor }
							onRemove={ removeLink }
							onChange={ ( updatedValue ) => {
								updateAttributes(
									updatedValue,
									setAttributes,
									attributes
								);
							} }
						/>
					) }
				</div>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}

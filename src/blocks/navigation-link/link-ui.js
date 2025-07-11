/**
 * WordPress dependencies
 */
import { __unstableStripHTML as stripHTML } from '@wordpress/dom';
import { Popover, Button, VisuallyHidden, __experimentalVStack as VStack, __experimentalGrid as Grid } from '@wordpress/components';
import { __, sprintf, isRTL } from '@wordpress/i18n';
import { LinkControl, store as blockEditorStore, InserterListItem } from '@wordpress/block-editor';
import { getBlockTypes, createBlock } from '@wordpress/blocks';

import { createInterpolateElement, useMemo, useState, useRef, useEffect, forwardRef } from '@wordpress/element';
import { store as coreStore, useResourcePermissions } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import { useSelect, useDispatch } from '@wordpress/data';
import { chevronLeftSmall, chevronRightSmall, plus, Icon } from '@wordpress/icons';
import { useInstanceId, useFocusOnMount } from '@wordpress/compose';

import CustomQuickInserter from './custom-quick-inserter';

/**
 * Given the Link block's type attribute, return the query params to give to
 * /wp/v2/search.
 */
export function getSuggestionsQuery( type, kind ) {
	switch ( type ) {
		case 'post':
		case 'page':
			return { type: 'post', subtype: type };
		case 'category':
			return { type: 'term', subtype: 'category' };
		case 'tag':
			return { type: 'term', subtype: 'post_tag' };
		case 'post_format':
			return { type: 'post-format' };
		default:
			if ( kind === 'taxonomy' ) {
				return { type: 'term', subtype: type };
			}
			if ( kind === 'post-type' ) {
				return { type: 'post', subtype: type };
			}
			return {
				initialSuggestionsSearchOptions: {
					type: 'post',
					subtype: 'page',
					perPage: 20,
				},
			};
	}
}

function LinkUIBlockInserter( { clientId, onBack } ) {
	const { rootBlockClientId } = useSelect(
		( select ) => {
			const { getBlockRootClientId } = select( blockEditorStore );

			return {
				rootBlockClientId: getBlockRootClientId( clientId ),
			};
		},
		[ clientId ]
	);

	const focusOnMountRef = useFocusOnMount( 'firstElement' );

	const dialogTitleId = useInstanceId(
		LinkControl,
		`link-ui-block-inserter__title`
	);
	const dialogDescriptionId = useInstanceId(
		LinkControl,
		`link-ui-block-inserter__description`
	);

	if ( ! clientId ) {
		return null;
	}

	const { insertBlocks } = useDispatch(blockEditorStore);
	

	return (
		<div
			className="link-ui-block-inserter"
			role="dialog"
			aria-labelledby={ dialogTitleId }
			aria-describedby={ dialogDescriptionId }
			ref={ focusOnMountRef }
		>
			<VisuallyHidden>
				<h2 id={ dialogTitleId }>{ __( 'Add block', 'groundworx-navigation' ) }</h2>

				<p id={ dialogDescriptionId }>
					{ __( 'Choose a block to add to your Navigation.', 'groundworx-navigation' ) }
				</p>
			</VisuallyHidden>

			<Button
				className="link-ui-block-inserter__back"
				icon={ isRTL() ? chevronRightSmall : chevronLeftSmall }
				onClick={ ( e ) => {
					e.preventDefault();
					onBack();
				} }
				size="small"
			>
				{ __( 'Back', 'groundworx-navigation' ) }
			</Button>

			<CustomQuickInserter
                clientId={ clientId }
                rootClientId={ rootBlockClientId }
               	onSelect={ ( blockInstance, index ) => {
					insertBlocks( [ blockInstance ], index, rootBlockClientId );
				} }
            />
			
		</div>
	);
}

function UnforwardedLinkUI( props, ref ) {
	const { label, url, opensInNewTab, type, kind } = props.link;
	const postType = type || 'page';

	const [ addingBlock, setAddingBlock ] = useState( false );
	const [ focusAddBlockButton, setFocusAddBlockButton ] = useState( false );
	const { saveEntityRecord } = useDispatch( coreStore );
	const permissions = useResourcePermissions( {
		kind: 'postType',
		name: postType,
	} );

	async function handleCreate( pageTitle ) {
		const page = await saveEntityRecord( 'postType', postType, {
			title: pageTitle,
			status: 'draft',
		} );

		return {
			id: page.id,
			type: postType,
			// Make `title` property consistent with that in `fetchLinkSuggestions` where the `rendered` title (containing HTML entities)
			// is also being decoded. By being consistent in both locations we avoid having to branch in the rendering output code.
			// Ideally in the future we will update both APIs to utilise the "raw" form of the title which is better suited to edit contexts.
			// e.g.
			// - title.raw = "Yes & No"
			// - title.rendered = "Yes &#038; No"
			// - decodeEntities( title.rendered ) = "Yes & No"
			// See:
			// - https://github.com/WordPress/gutenberg/pull/41063
			// - https://github.com/WordPress/gutenberg/blob/a1e1fdc0e6278457e9f4fc0b31ac6d2095f5450b/packages/core-data/src/fetch/__experimental-fetch-link-suggestions.js#L212-L218
			title: decodeEntities( page.title.rendered ),
			url: page.link,
			kind: 'post-type',
		};
	}

	// Memoize link value to avoid overriding the LinkControl's internal state.
	// This is a temporary fix. See https://github.com/WordPress/gutenberg/issues/50976#issuecomment-1568226407.
	const link = useMemo(
		() => ( {
			url,
			opensInNewTab,
			title: label && stripHTML( label ),
		} ),
		[ label, opensInNewTab, url ]
	);

	const dialogTitleId = useInstanceId(
		LinkUI,
		`link-ui-link-control__title`
	);
	const dialogDescriptionId = useInstanceId(
		LinkUI,
		`link-ui-link-control__description`
	);

	return (
		<Popover
			ref={ ref }
			placement="bottom"
			onClose={ props.onClose }
			anchor={ props.anchor }
			shift
		>
			{ ! addingBlock && (
				<div
					role="dialog"
					aria-labelledby={ dialogTitleId }
					aria-describedby={ dialogDescriptionId }
				>
					<VisuallyHidden>
						<h2 id={ dialogTitleId }>{ __( 'Add link', 'groundworx-navigation' ) }</h2>

						<p id={ dialogDescriptionId }>
							{ __(
								'Search for and add a link to your Navigation.', 'groundworx-navigation'
							) }
						</p>
					</VisuallyHidden>
					<LinkControl
						hasTextControl
						hasRichPreviews
						value={ link }
						showInitialSuggestions
						withCreateSuggestion={ permissions.canCreate }
						createSuggestion={ handleCreate }
						createSuggestionButtonText={ ( searchTerm ) => {
							let format;

							if ( type === 'post' ) {
								/* translators: %s: search term. */
								format = __(
									'Create draft post: <mark>%s</mark>', 'groundworx-navigation'
								);
							} else {
								/* translators: %s: search term. */
								format = __(
									'Create draft page: <mark>%s</mark>', 'groundworx-navigation'
								);
							}

							return createInterpolateElement(
								sprintf( format, searchTerm ),
								{
									mark: <mark />,
								}
							);
						} }
						noDirectEntry={ !! type }
						noURLSuggestion={ !! type }
						suggestionsQuery={ getSuggestionsQuery( type, kind ) }
						onChange={ props.onChange }
						onRemove={ props.onRemove }
						onCancel={ props.onCancel }
						renderControlBottom={ () =>
							! link?.url?.length && (
								<LinkUITools
									focusAddBlockButton={ focusAddBlockButton }
									setAddingBlock={ () => {
										setAddingBlock( true );
										setFocusAddBlockButton( false );
									} }
								/>
							)
						}
					/>
				</div>
			) }

			{ addingBlock && (
				<LinkUIBlockInserter
					clientId={ props.clientId }
					onBack={ () => {
						setAddingBlock( false );
						setFocusAddBlockButton( true );
					} }
				/>
			) }
		</Popover>
	);
}

export const LinkUI = forwardRef( UnforwardedLinkUI );

const LinkUITools = ( { setAddingBlock, focusAddBlockButton } ) => {
	const blockInserterAriaRole = 'listbox';
	const addBlockButtonRef = useRef();

	// Focus the add block button when the popover is opened.
	useEffect( () => {
		if ( focusAddBlockButton ) {
			addBlockButtonRef.current?.focus();
		}
	}, [ focusAddBlockButton ] );

	return (
		<VStack className="link-ui-tools">
			<Button
				__next40pxDefaultSize
				ref={ addBlockButtonRef }
				icon={ plus }
				onClick={ ( e ) => {
					e.preventDefault();
					setAddingBlock( true );
				} }
				aria-haspopup={ blockInserterAriaRole }
			>
				{ __( 'Add block', 'groundworx-navigation' ) }
			</Button>
		</VStack>
	);
};

export default LinkUITools;

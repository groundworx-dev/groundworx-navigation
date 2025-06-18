import { useEntityBlockEditor } from '@wordpress/core-data';
import { useInnerBlocksProps, InnerBlocks, store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

import { store as blocksStore } from '@wordpress/blocks';
import { DEFAULT_BLOCK, PRIORITIZED_INSERTER_BLOCKS } from '../constants';

export default function NavigationInnerBlocks({ clientId, templateLock, orientation }) {
	const [blocks, onInput, onChange] = useEntityBlockEditor('postType', 'gwx_menu');

	const {
		isImmediateParentOfSelectedBlock,
		selectedBlockHasChildren,
		isSelected,
	} = useSelect(
		( select ) => {
			const {
				getBlockCount,
				hasSelectedInnerBlock,
				getSelectedBlockClientId,
			} = select( blockEditorStore );
			const selectedBlockId = getSelectedBlockClientId();

			return {
				isImmediateParentOfSelectedBlock: hasSelectedInnerBlock(
					clientId,
					false
				),
				selectedBlockHasChildren: !! getBlockCount( selectedBlockId ),

				// This prop is already available but computing it here ensures it's
				// fresh compared to isImmediateParentOfSelectedBlock.
				isSelected: selectedBlockId === clientId,
			};
		},
		[ clientId ]
	);

	const parentOrChildHasSelection =
	isSelected ||
	( isImmediateParentOfSelectedBlock && ! selectedBlockHasChildren );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'gwx-menu__container',
		},
		{
			value: blocks,
			onInput,
			onChange,
			templateLock,
			directInsert: true,
			prioritizedInserterBlocks: PRIORITIZED_INSERTER_BLOCKS,
			defaultBlock: DEFAULT_BLOCK,
			orientation,
			__unstableDisableLayoutClassNames: true,
			__experimentalCaptureToolbars: true,
			renderAppender:
				isSelected ||
				( isImmediateParentOfSelectedBlock &&
					! selectedBlockHasChildren ) ||
				// Show the appender while dragging to allow inserting element between item and the appender.
				parentOrChildHasSelection
					? InnerBlocks.ButtonBlockAppender
					: false,
					
		}
	);

	return <div {...innerBlocksProps}/>;
}

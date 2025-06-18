/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */

import { Button, Flex, __experimentalTruncate as Truncate, Icon } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { getBlockTypes, getBlockType, createBlock } from '@wordpress/blocks';
import { blockDefault } from '@wordpress/icons';

import { ALLOWED_BLOCKS } from './../navigation-menu/constants';

function BlockIcon( { icon, showColors = false, className, context } ) {
	if ( icon?.src === 'block-default' ) {
		icon = {
			src: blockDefault,
		};
	}

	const renderedIcon = (
		<Icon icon={ icon && icon.src ? icon.src : icon } context={ context } />
	);
	const style = showColors
		? {
				backgroundColor: icon && icon.background,
				color: icon && icon.foreground,
		  }
		: {};

	return (
		<span
			style={ style }
			className={ clsx( 'block-editor-block-icon', className, {
				'has-colors': showColors,
			} ) }
		>
			{ renderedIcon }
		</span>
	);
}


export default function CustomQuickInserter({ rootClientId }) {
	const { insertBlocks } = useDispatch(blockEditorStore);

	const blockTypes = useSelect(() =>
		getBlockTypes().filter((block) => ALLOWED_BLOCKS.includes(block.name)),
		[]
	);

	const insertionIndex = useSelect(
		(select) => select(blockEditorStore).getBlockOrder(rootClientId)?.length || 0,
		[ rootClientId ]
	);

	return (
		<div className='block-editor-inserter__panel-content custom-quick-inserter'>
			<Flex role="listbox" direction="row" gap={0} wrap={true} aria-orientation="horizontal" class="block-editor-block-types-list" aria-label="Blocks">

				{blockTypes.map((block) => (
					<div class="block-editor-block-types-list__list-item" draggable="false">
						<Button
							key={block.name}
							onClick={() => {
								const instance = createBlock(block.name);
								insertBlocks([instance], insertionIndex, rootClientId);
							}}
							className={ clsx(
									'block-editor-block-types-list__item'
							) }
						>
						
							<span
								className="block-editor-block-types-list__item-icon"
							>
								<BlockIcon icon={ block.icon } showColors /> 
							</span>
							<span className="block-editor-block-types-list__item-title">
								<Truncate numberOfLines={ 3 }>
									{ block.title }
								</Truncate>
							</span>
					
						</Button>
					</div>
				))}
			</Flex>
		</div>
	);
}

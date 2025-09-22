import { __ } from '@wordpress/i18n';
import { InnerBlocks, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import clsx from 'clsx';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

export default function Edit({ clientId, isSelected, attributes }) {


	const { templateLock } = attributes;
	const hasSelectedInnerBlock = useSelect(
		(select) => select(blockEditorStore).hasSelectedInnerBlock(clientId, true),
		[clientId]
	);

	const blockProps = useBlockProps({
		className: clsx('gwx-menu__modal-branding'),
	});

	const innerBlockProps = useInnerBlocksProps(blockProps, {
		template: [['core/site-logo']],
		directInsert: true,
		templateInsertUpdatesSelection: true,
		__experimentalCaptureToolbars: true,
		templateLock,
		renderAppender: isSelected || hasSelectedInnerBlock ? InnerBlocks.ButtonBlockAppender : false,
	});
	
	return <div {...innerBlockProps} />;
}


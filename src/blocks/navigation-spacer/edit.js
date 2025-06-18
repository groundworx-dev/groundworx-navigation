import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
	InnerBlocks
} from '@wordpress/block-editor';

import {
	PanelBody,
	TextControl,
	SelectControl
} from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
	const { label, icon, position = 'right' } = attributes;

	const blockProps = useBlockProps();
	
	return (
		<div {...blockProps}/>
	);
}

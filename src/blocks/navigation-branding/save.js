import clsx from 'clsx';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * Save function for the block.
 * This defines the structure that gets saved to the post content.
 */
export default function save({ attributes, name } ) {

    const blockProps = useBlockProps.save({
        className: clsx(
            'gwx-menu__modal-branding'
        )
    });
    
    const innerBlockProps = useInnerBlocksProps.save(blockProps);

    return (
        <div {...innerBlockProps}/>
    );
}

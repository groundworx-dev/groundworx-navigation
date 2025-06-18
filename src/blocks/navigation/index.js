/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

import { Icon } from '@wordpress/icons';

const navigation = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M12,3C7.05,3,3,7.05,3,12s4.05,9,9,9,9-4.05,9-9S16.95,3,12,3ZM12,19.5c-4.15,0-7.5-3.35-7.5-7.5s3.35-7.5,7.5-7.5,7.5,3.35,7.5,7.5-3.35,7.5-7.5,7.5ZM8.62,16.5l5.06-3.38,1.69-5.18-5.06,3.38-1.69,5.18Z"/></svg>
);

import './index.scss';
import './style.scss';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

registerBlockType( metadata.name, {
    icon: <Icon icon={ navigation } />, 
    edit: Edit,
    save
});

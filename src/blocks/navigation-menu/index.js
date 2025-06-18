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

const menu = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18.92,4.5H5.08c-.32,0-.58.26-.58.58v13.85c0,.32.26.58.58.58h13.85c.32,0,.58-.26.58-.58V5.08c0-.32-.26-.58-.58-.58ZM5.25,3h13.5c1.24,0,2.25,1.01,2.25,2.25v13.5c0,1.24-1.01,2.25-2.25,2.25H5.25c-1.24,0-2.25-1.01-2.25-2.25V5.25c0-1.24,1.01-2.25,2.25-2.25ZM7,8h1.5v1.5h-1.5v-1.5ZM8.5,11.5h-1.5v1.5h1.5v-1.5ZM10,8h7v1.5h-7v-1.5ZM17,11.5h-7v1.5h7v-1.5ZM8.5,15h-1.5v1.5h1.5v-1.5ZM17,15h-7v1.5h7v-1.5Z"/></svg>
);

import './index.scss';
import './style.scss';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

registerBlockType( metadata.name, {
	icon: <Icon icon={ menu } />, 

	/**
	 * @see ./edit.js
	 */
	edit: Edit,
	/**
	 * @see ./save.js
	 */
	save
} );
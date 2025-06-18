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

import transforms from './transforms';

import { page, addSubmenu } from '@wordpress/icons';


/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

registerBlockType( metadata.name, {
	icon: ( { context } ) => {
		if ( context === 'list-view' ) {
			return page;
		}
		return addSubmenu;
	},

	__experimentalLabel( attributes, { context } ) {
		const { label } = attributes;

		const customName = attributes?.metadata?.name;

		// In the list view, use the block's menu label as the label.
		// If the menu label is empty, fall back to the default label.
		if ( context === 'list-view' && ( customName || label ) ) {
			return attributes?.metadata?.name || label;
		}

		return label;
	},

	/**
	 * @see ./edit.js
	 */
	edit: Edit,
	//edit: () => <p>Hello Navigation Link!</p>,
	/**
	 * @see ./save.js
	 */
	save,

	transforms,
} );

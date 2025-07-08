/**
 * Internal dependencies
 */
import { enhanceNavigationLinkVariations } from '../hooks';
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

describe( 'hooks', () => {
	describe( 'enhanceNavigationLinkVariations', () => {
		it( 'does not modify settings when settings do not belong to a navigation link', () => {
			const updatedSettings = enhanceNavigationLinkVariations(
				{
					name: 'core/test',
					one: 'one',
					two: 'two',
					three: 'three',
				},
				'core/test'
			);
			expect( updatedSettings ).toEqual( {
				name: 'core/test',
				one: 'one',
				two: 'two',
				three: 'three',
			} );
		} );
		it( 'enhances variations with icon and isActive functions', () => {
			const updatedSettings = enhanceNavigationLinkVariations(
				{
					name: 'groundworx/navigation-link',
					extraProp: 'extraProp',
					variations: [
						{
							name: 'link',
							title: __( 'Custom Link', 'groundworx-navigation' ),
							description: __( 'A link to a custom URL.' ),
							attributes: {},
						},
						{
							name: 'post',
							title: __( 'Post Link', 'groundworx-navigation' ),
							description: __( 'A link to a post.', 'groundworx-navigation' ),
							attributes: { type: 'post' },
						},
						{
							name: 'page',
							title: __( 'Page Link', 'groundworx-navigation' ),
							description: __( 'A link to a page.', 'groundworx-navigation' ),
							attributes: { type: 'page' },
						},
						{
							name: 'category',
							title: __( 'Category Link', 'groundworx-navigation' ),
							description: __( 'A link to a category.', 'groundworx-navigation' ),
							attributes: { type: 'category' },
						},
						{
							name: 'tag',
							title: __( 'Tag Link', 'groundworx-navigation' ),
							description: __( 'A link to a tag.', 'groundworx-navigation' ),
							attributes: { type: 'tag' },
						},
					],
				},
				'groundworx/navigation-link'
			);
			expect( updatedSettings ).toMatchSnapshot();
		} );
	} );
} );

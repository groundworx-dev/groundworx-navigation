/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/site-logo' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/spacer' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/home-link' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/social-links' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/search' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/page-list' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/buttons' ],
			transform: () => {
				return createBlock( 'groundworx/navigation-link' );
			},
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'groundworx/navigation-submenu' ],
			transform: ( attributes, innerBlocks ) =>
				createBlock(
					'groundworx/navigation-submenu',
					attributes,
					innerBlocks
				),
		},
		{
			type: 'block',
			blocks: [ 'core/spacer' ],
			transform: () => {
				return createBlock( 'core/spacer' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/site-logo' ],
			transform: () => {
				return createBlock( 'core/site-logo' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/home-link' ],
			transform: () => {
				return createBlock( 'core/home-link' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/social-links' ],
			transform: () => {
				return createBlock( 'core/social-links' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/search' ],
			transform: () => {
				return createBlock( 'core/search', {
					showLabel: false,
					buttonUseIcon: true,
					buttonPosition: 'button-inside',
				} );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/page-list' ],
			transform: () => {
				return createBlock( 'core/page-list' );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/buttons' ],
			transform: ( { label, url, rel, opensInNewTab } ) => {
				return createBlock( 'core/buttons', {}, [
					createBlock( 'core/button', {
						text: label,
						url,
						rel,
						linkTarget: opensInNewTab ? '_blank' : undefined,
					} ),
				] );
			},
		},
	],
};

export default transforms;

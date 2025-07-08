<?php
defined( 'ABSPATH' ) || exit;

/**
 * Server-side rendering of the `groundworx/navigation-link` block.
 *
 * @package WordPress
 */

/**
 * Registers the `groundworx/navigation-link` block on server.
 */

function gwx_navigation_register_block_menu_link() {
	register_block_type_from_metadata(
		__DIR__,
		array(
			'render_callback' => 'gwx_navigation_render_block_menu_link',
		)
	);
}
add_action( 'init', 'gwx_navigation_register_block_menu_link' );

/**
 * Render callback for `groundworx/navigation-link` block.
 */

function gwx_navigation_render_block_menu_link( $attributes, $content, $block ) {
	if ( empty( $attributes['url'] ) || empty( $attributes['label'] ) ) {
		return '';
	}

	$attrs = array();
	$attrs[] = 'class="gwx-menu-item__label"';
	$attrs[] = 'href="' . esc_url( $attributes['url'] ) . '"';

	if ( ! empty( $attributes['opensInNewTab'] ) ) {
		$attrs[] = 'target="_blank"';
		$attrs[] = 'rel="noopener noreferrer"';
	}

	if ( ! empty( $attributes['rel'] ) ) {
		$attrs[] = 'rel="' . esc_attr( $attributes['rel'] ) . '"';
	}

	// Optional description can go below the label, if needed.
	$description_html = '';
	if ( ! empty( $attributes['description'] ) ) {
		$description_html = '<span class="menu-link-description">' . esc_html( $attributes['description'] ) . '</span>';
	}

	$classes = [ 'gwx-menu-item' ];

	$wrapper_attributes = get_block_wrapper_attributes([
		'class' => implode( ' ', $classes ),
	]);

	$html = '<li ' . $wrapper_attributes . '>';

	return sprintf(
		'<li %1$s><div class="gwx-menu-item__content"><a %2$s>%3$s</a>%4$s</div></li>',
		$wrapper_attributes,
		implode( ' ', $attrs ),
		esc_html( $attributes['label'] ),
		$description_html
	);
}

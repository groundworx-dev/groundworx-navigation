<?php
defined( 'ABSPATH' ) || exit;

function register_block_groundworx_menu_submenu() {
	register_block_type_from_metadata(
		__DIR__,
		array(
			'render_callback' => 'render_block_groundworx_menu_submenu',
		)
	);
}
add_action( 'init', 'register_block_groundworx_menu_submenu' );


function render_block_groundworx_menu_submenu( $attributes, $content, $block ) {
	if ( empty( $attributes['label'] ) ) {
		return '';
	}

	$label = wp_kses_post( $attributes['label'] );
	$aria_label = sprintf( __( '%s submenu' ), wp_strip_all_tags( $label ) );
	$has_submenu = count( $block->inner_blocks ) > 0;

	$show_submenu_indicators = isset( $block->context['showSubmenuIcon'] ) && $block->context['showSubmenuIcon'];
	$open_on_hover_and_click = isset( $block->context['openSubmenusOnHover'] ) && $block->context['openSubmenusOnHover'] && $show_submenu_indicators;

	$classes = [ 'gwx-menu-item' ];
	if ( $has_submenu ) {
		$classes[] = 'has-child';
	}

	$wrapper_attributes = get_block_wrapper_attributes([
		'class' => implode( ' ', $classes ),
	]);

	$html = '<li ' . $wrapper_attributes . '>';

	$html .= '<div class="gwx-menu-item__content">';
	$html .= '<a class="gwx-menu-item__label" href="' . esc_url( $attributes['url'] ) . '"';

	if ( ! empty( $attributes['opensInNewTab'] ) ) {
		$html .= ' target="_blank"';
	}

	if ( ! empty( $attributes['rel'] ) ) {
		$html .= ' rel="' . esc_attr( $attributes['rel'] ) . '"';
	} elseif ( ! empty( $attributes['nofollow'] ) ) {
		$html .= ' rel="nofollow"';
	}

	$html .= '>' . $label . '</a>';
	if ( $has_submenu && $show_submenu_indicators ) {
		$html .= '<button aria-label="' . esc_attr( $aria_label ) . '" class="gwx-menu-item__icon" aria-expanded="false"><span class="gwx-menu-item__glyph" role="presentation"></span></button>';
	}
	if ( ! empty( $attributes['description'] ) ) {
		$html .= '<span class="gwx-menu-item__description">' . wp_kses_post( $attributes['description'] ) . '</span>';
	}

	$html .= '</div>';

	// Submenu children
	if ( $has_submenu ) {
		$colors_supports = '';

		if ( array_key_exists( 'textColor', $block->context ) || array_key_exists( 'customTextColor', $block->context ) ) {
			$colors_supports .= 'has-text-color';
		}
		if ( array_key_exists( 'backgroundColor', $block->context ) || array_key_exists( 'customBackgroundColor', $block->context ) ) {
			$colors_supports .= 'has-background';
		}
		
		$css_classes = 'gwx-menu-item__container';
		if ( ! empty( $colors_supports ) ) {
			$css_classes .= ' ' . $colors_supports;
		}

		$inner_html = '';
		foreach ( $block->inner_blocks as $inner_block ) {
			$inner_html .= $inner_block->render();
		}
		$sub_wrapper = get_block_wrapper_attributes([
			'class' => $css_classes
		]);

		$html .= '<div class="gwx-menu-item__subcontent"><ul ' . $sub_wrapper . '>' . $inner_html . '</ul></div>';
	}

	$html .= '</li>';
	return $html;
}

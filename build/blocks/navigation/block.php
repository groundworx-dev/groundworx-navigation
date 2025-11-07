<?php
defined( 'ABSPATH' ) || exit;

require_once GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/inc/icons.php';
require_once GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/inc/utils.php';

function gwx_navigation_register_block_navigation() {
	register_block_type_from_metadata(
		__DIR__,
		array(
			'render_callback' => array( 'GWXNavigationBlockRenderer', 'render' ),
		)
	);
}
add_action( 'init', 'gwx_navigation_register_block_navigation' );

class GWXNavigationBlockRenderer {

	private static $seen_menu_names = array();

	private static function filter_blocks_by_nesting_level( $blocks, $max_level = 5, $current_level = 0 ) {
		if ( ! is_array( $blocks ) ) {
			return [];
		}
	
		$filtered = [];
	
		foreach ( $blocks as $block ) {
			// Must be a valid block structure
			if ( ! is_array( $block ) || empty( $block['blockName'] ) ) {
				continue;
			}
	
			// If we've reached the limit, strip nested content
			if ( $current_level >= $max_level ) {
				$block['innerBlocks']  = [];
				$block['innerContent'] = [];
				$block['innerHTML']    = '';
			} else {
				// Otherwise recurse safely
				if ( isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
					$block['innerBlocks'] = static::filter_blocks_by_nesting_level(
						$block['innerBlocks'],
						$max_level,
						$current_level + 1
					);
				} else {
					$block['innerBlocks'] = [];
					$block['innerContent'] = [];
					$block['innerHTML']    = '';
				}
			}
			$filtered[] = $block;
		}
	
		return array_values( $filtered );
	}

	public static function get_color_css_vars( $attributes ) {
		$css = '';

		$css .= self::get_css_var_color( $attributes['textColor'] ?? '', 				$attributes['customTextColor'] ?? '', 				'grx--color--menu--text' );
		$css .= self::get_css_var_color( $attributes['backgroundColor'] ?? '', 			$attributes['customBackgroundColor'] ?? '', 		'grx--color--menu--background' );
		$css .= self::get_css_var_color( $attributes['linkColor'] ?? '', 				$attributes['customLinkColor'] ?? '', 				'grx--color--menu--link' );
		$css .= self::get_css_var_color( $attributes['hoverLinkColor'] ?? '', 			$attributes['customHoverLinkColor'] ?? '', 			'grx--color--menu--hover--link' );
		$css .= self::get_css_var_color( $attributes['submenuTextColor'] ?? '', 		$attributes['customSubmenuTextColor'] ?? '', 		'grx--color--submenu--text' );
		$css .= self::get_css_var_color( $attributes['submenuBackgroundColor'] ?? '',	$attributes['customSubmenuBackgroundColor'] ?? '',	'grx--color--submenu--background' );
		$css .= self::get_css_var_color( $attributes['submenuLinkColor'] ?? '', 		$attributes['customSubmenuLinkColor'] ?? '', 		'grx--color--submenu--link' );
		$css .= self::get_css_var_color( $attributes['submenuHoverLinkColor'] ?? '',	$attributes['customSubmenuHoverLinkColor'] ?? '', 	'grx--color--submenu--hover--link' );
	
		return $css;
	}

	private static function get_css_var_color( $preset, $custom, $var_name ) {
		if ( $preset ) {
			return "--{$var_name}: var(--wp--preset--color--{$preset});";
		}
		if ( $custom ) {
			return "--{$var_name}: {$custom};";
		}
		return '';
	}

	private static function get_min_height_styles( $attributes ) {
		$min_height = $attributes['minHeight'] ?? '';
		return $min_height ? '--gwx--min-nav-size: '. $min_height.';' : '';
	}

	private static function build_css_colors( $attributes ) {

		$colors = array(
			'css_classes'           => array(),
			'inline_styles'         => static::get_color_css_vars( $attributes ),
			'submneu_css_classes'   => array(),
			'submenu_inline_styles' => '',
		);

		// Text color.
		$has_named_text_color  = array_key_exists( 'textColor', $attributes );
		$has_custom_text_color = array_key_exists( 'customTextColor', $attributes );

		// If has text color.
		if ( $has_custom_text_color || $has_named_text_color ) {
			// Add has-text-color class.
			$colors['css_classes'][] = 'has-text-color';
		}

		// Background color.
		$has_named_background_color  = array_key_exists( 'backgroundColor', $attributes );
		$has_custom_background_color = array_key_exists( 'customBackgroundColor', $attributes );

		// If has background color.
		if ( $has_custom_background_color || $has_named_background_color ) {
			// Add has-background class.
			$colors['css_classes'][] = 'has-background';
		}

		// Overlay text color.
		$has_custom_submenu_text_color  = array_key_exists( 'submenuTextColor', $attributes );
		$has_named_submenu_text_color = array_key_exists( 'customSubmenuTextColor', $attributes );

		// If has submenu text color.
		if ( $has_custom_submenu_text_color || $has_named_submenu_text_color ) {
			// Add has-text-color class.
			$colors['submenu_css_classes'][] = 'has-text-color';
		}

		// Submenu background color.
		$has_named_submenu_background_color  = array_key_exists( 'backgroundColor', $attributes );
		$has_custom_submenu_background_color = array_key_exists( 'customBackgroundColor', $attributes );

		// If has submenu background color.
		if ( $has_custom_submenu_background_color || $has_named_submenu_background_color ) {
			// Add has-background class.
			$colors['submenu_css_classes'][] = 'has-background';
		}

		return $colors;
	}

	private static function is_interactive( $attributes, $inner_blocks ) {
		$is_responsive_menu = static::is_responsive( $attributes );
		return $is_responsive_menu;
	}

	private static function is_responsive( $attributes ) {
		return ! empty( $attributes['toggleBehavior'] );
	}

	private static function get_inner_blocks_html( $attributes, $inner_blocks ) {
		$inner_blocks_html = '';

		foreach ( $inner_blocks as $inner_block ) {
			$inner_blocks_html .= $inner_block->render();
		}

		return $inner_blocks_html;
	}

	private static function get_wrapper_markup( $attributes, $inner_blocks ) {
		$inner_blocks_html = static::get_inner_blocks_html( $attributes, $inner_blocks );
		if ( static::is_responsive( $attributes ) ) {
			return static::get_responsive_container_markup( $attributes, $inner_blocks, $inner_blocks_html );
		}
		return static::get_container_markup( $attributes, $inner_blocks, $inner_blocks_html );
	}
	
	private static function get_container_markup( $attributes, $inner_blocks, $inner_blocks_html ) {

		return sprintf(
			'<nav class="gwx-navigation__wrapper">
				<div class="gwx-navigation__content">
					<div class="gwx-navigation__modal">
						%1$s
					</div>
				</div>
			</nav>',
			$inner_blocks_html
		);
	}

	private static function get_responsive_container_markup( $attributes, $inner_blocks, $inner_blocks_html ) {
		$modal_unique_id = wp_unique_id( 'modal-' );

		return sprintf(
			'<nav class="gwx-navigation__wrapper">
				<div class="gwx-navigation__content"
				data-wp-class--is-menu-open="state.isMenuOpen"
				data-wp-watch="callbacks.initMenu"
				data-wp-on--keydown="actions.handleMenuKeydown"
				data-wp-on-async--focusout="actions.handleMenuFocusout"
				data-wp-class--is-open="state.isMenuOpen"
				data-wp-bind--aria-label="state.ariaLabel"
				>
					<div id="%1$s-content" class="gwx-navigation__modal"
						data-wp-watch="callbacks.focusFirstElement"
						tabindex="-1">
						%2$s
					</div>
					<div class="gwx-navigation__menutrigger" id="%1$s">
						<div class="gwx-menu-toggle" data-wp-class--is-open="state.isMenuOpen">

							<button class="gwx-toggle gwx-toggle--open" 
								type="button"
								aria-label="%3$s"
								aria-controls="%1$s"
								data-wp-on-async--click="actions.openMenuOnClick" 
								data-wp-on--keydown="actions.handleMenuKeydown"
								>
								%5$s
							</button>

							<button class="gwx-toggle gwx-toggle--close" 
								type="button"
								aria-label="%4$s"
								aria-controls="%1$s"
								data-wp-on-async--click="actions.closeMenuOnClick" 
								tabindex="-1"
								>
								%5$s
							</button>

						</div>
					</div>
				</div>
			</nav>
			',
			esc_attr( $modal_unique_id ),
			$inner_blocks_html,
			__( 'Open menu', 'groundworx-navigation' ),
			__( 'Close menu', 'groundworx-navigation' ),
			'<svg class="gwx-toggle__bread" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<rect class="gwx-toggle__bread-top" x="4" y="7.5" width="16" height="1.5" />
				<rect class="gwx-toggle__bread-middle" x="4" y="11.25" width="16" height="1.5"></rect>
				<rect class="gwx-toggle__bread-bottom" x="4" y="15" width="16" height="1.5" />
			</svg>'
		);
	}

	private static function get_navigation_name( $attributes ) {

		$navigation_name = $attributes['ariaLabel'] ?? '';

		if ( ! empty( $navigation_name ) ) {
			return $navigation_name;
		}

		// Load the navigation post.
		if ( array_key_exists( 'ref', $attributes ) ) {
			$navigation_post = get_post( $attributes['ref'] );
			if ( ! isset( $navigation_post ) ) {
				return $navigation_name;
			}

			// Only published posts are valid. If this is changed then a corresponding change
			// must also be implemented in `use-navigation-menu.js`.
			if ( 'publish' === $navigation_post->post_status ) {
				$navigation_name = $navigation_post->post_title;

				// This is used to count the number of times a navigation name has been seen,
				// so that we can ensure every navigation has a unique id.
				if ( isset( static::$seen_menu_names[ $navigation_name ] ) ) {
					++static::$seen_menu_names[ $navigation_name ];
				} else {
					static::$seen_menu_names[ $navigation_name ] = 1;
				}
			}
		}

		return $navigation_name;
	}

	private static function get_unique_navigation_name( $attributes ) {
		$nav_menu_name = static::get_navigation_name( $attributes );

		// If the menu name has been used previously then append an ID
		// to the name to ensure uniqueness across a given post.
		if ( isset( static::$seen_menu_names[ $nav_menu_name ] ) && static::$seen_menu_names[ $nav_menu_name ] > 1 ) {
			$count         = static::$seen_menu_names[ $nav_menu_name ];
			$nav_menu_name = $nav_menu_name . ' ' . ( $count );
		}

		return $nav_menu_name;
	}

	private static function get_styles( $attributes ) {
		$colors       = static::build_css_colors( $attributes );
		$min_height	  = static::get_min_height_styles( $attributes );
		$font_sizes   = static::build_css_font_sizes( $attributes );
		$block_styles = isset( $attributes['styles'] ) ? $attributes['styles'] : '';
		return $block_styles . $colors['inline_styles']. $min_height . $font_sizes['inline_styles'];
	}

	private static function get_classes( $attributes ) {
		// Restore legacy classnames for submenu positioning.
		$colors             = static::build_css_colors( $attributes );
		$font_sizes         = static::build_css_font_sizes( $attributes );

		// Manually add block support text decoration as CSS class.
		$text_decoration       = $attributes['style']['typography']['textDecoration'] ?? null;
		$text_decoration_class = sprintf( 'has-text-decoration-%s', $text_decoration );
		$position_class = ( ! empty( $attributes['position'] ) ) ? ['is-position-' . sanitize_title( $attributes['position'] )] : [];
		$template = !empty($attributes['template']) ? $attributes['template'] : 'classic';
		$is_template 	= 'is-template-'.$template;

		$classes = array_merge(
			array('gwx-menu', $is_template),
			$colors['css_classes'],
			$font_sizes['css_classes'],
			$position_class,
			$text_decoration ? array( $text_decoration_class ) : array()
		);

		return implode( ' ', $classes );
	}

	private static function get_nav_wrapper_attributes( $attributes, $inner_blocks ) {
		$nav_menu_name      = static::get_unique_navigation_name( $attributes );
		$is_interactive     = static::is_interactive( $attributes, $inner_blocks );
		$responsive   		= static::is_responsive($attributes);

		$style              = static::get_styles( $attributes );
		$class              = static::get_classes( $attributes );
		$extra_attributes   = array(
			'class' => $class,
			'style' => $style,
		);
		if ( ! empty( $nav_menu_name ) ) {
			$extra_attributes['aria-label'] = $nav_menu_name;
		}
		$wrapper_attributes = get_block_wrapper_attributes( $extra_attributes );

		if ( $is_interactive ) {
			$nav_element_directives = static::get_nav_element_directives( $is_interactive, $attributes );
			$wrapper_attributes    .= ' ' . $nav_element_directives;
		}

		return $wrapper_attributes;
	}

	private static function get_nav_element_directives( $is_interactive, $attributes ) {
		if ( ! $is_interactive ) {
			return '';
		}
		$switch_at          = isset( $attributes['switchAt'] )
			? Groundworx_Menu_Breakpoints::resolve( $attributes['switchAt'] )
			: null;
		$is_responsive      = static::is_responsive( $attributes );
		$enable_modal       = $attributes['toggleBehavior'] ?? false;
		$position           = $attributes['position'] ?? 'relative';
		$template = !empty($attributes['template']) ? $attributes['template'] : 'classic';
		$template_map = [
			'modal'           => 'modal',
			'modal-dropdown'  => 'modal-dropdown',
			'slide-in'        => 'slide-in',
		];
		$layout = $template_map[$template] ?? 'menu';

		// Build context
		$context_data = [
			'overlayOpenedBy' => [
				'click' => false,
				'hover' => false,
				'focus' => false,
			],
			'shouldSwitchLayout' => false,
			'type'          => 'overlay',
			'roleAttribute' => '',
			'ariaLabel'     => __( 'Navigation', 'groundworx-navigation' ),
			'ariaLabelOpened'     => __( 'Close Menu', 'groundworx-navigation' ),
			'ariaLabelClosed'     => __( 'Open Menu', 'groundworx-navigation' ),
		];

		if ( $switch_at && $enable_modal === 'responsive' ) {
			$context_data['switchAt'] = $switch_at;
		}

		if ($enable_modal === true) {
			$context_data['forceModal'] = $enable_modal;
		}
		if ( ($position !== 'relative' && $position !== 'sticky') && $layout !== 'menu' && ( $enable_modal === true || $enable_modal === 'responsive' ) ) {
			$context_data['lockBody'] = true;
		}

		// Generate context string first
		$context_string = wp_interactivity_data_wp_context( $context_data );

		// Now define other directives
		$directives = [
			'data-wp-interactive'       => 'groundworx/navigation',
			'data-wp-class--is-initialized' => 'context.isInitialized',
			'data-wp-watch'             => 'callbacks.initMenu',
			'data-wp-context'     => '', // placeholder,
		];

		$directives['data-wp-class--is-initialized'] = 'context.isInitialized';
		$directives['data-wp-watch'] = 'callbacks.initMenu';
		
		if ( $enable_modal && $template !== 'slide-in') {
			$directives["data-wp-class--has-{$layout}"]         = '!context.shouldSwitchLayout';
			$directives["data-wp-class--has-{$layout}-open"]    = 'state.isMenuOpen';
			$directives["data-wp-class--has-{$layout}-close"]   = '!state.isMenuOpen';
		}
		
		if ( $template === 'slide-in' ) {
			$directives["data-wp-class--has-modal-dropdown"] 			= '!context.shouldSwitchLayout';
			$directives["data-wp-class--has-modal-dropdown-open"]    	= 'state.isMenuOpen';
			$directives["data-wp-class--has-modal-dropdown-close"]   	= '!state.isMenuOpen';

			$directives["data-wp-class--has-{$layout}"]         = 'context.shouldSwitchLayout';
			$directives["data-wp-class--has-{$layout}-open"]    = 'state.isMenuOpen';
			$directives["data-wp-class--has-{$layout}-close"]   = '!state.isMenuOpen';
		}
		
		// Compile attributes into a string
		$output = '';
		foreach ( $directives as $key => $value ) {
			if ( $key === 'data-wp-context' ) {
				$output .= ' ' . trim( $context_string );
			} else {
			$output .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $value ) );
			}
		}

		if ( $position === 'scroll-up-reveal' ) { $output .= ' data-wp-init="callbacks.scrollUpReveal" data-wp-on-async-document--scroll="callbacks.scrollUpReveal" '; }
		if ( $position === 'fixed' ) 			{ $output .= ' data-wp-init="callbacks.measureNavBounds" data-wp-on-async-document--scroll="callbacks.measureNavBounds" '; }

		return trim( $output );
	}

	private static function handle_view_script_module_loading( $attributes, $block, $inner_blocks ) {
		if ( static::is_interactive( $attributes, $inner_blocks ) ) {
			wp_enqueue_script_module( 'groundworx-navigation-view' );
		}
	}

	public static function build_css_font_sizes( $attributes ) {
		// CSS classes.
		$font_sizes = array(
			'css_classes'   => array(),
			'inline_styles' => '',
		);

		$has_named_font_size  = array_key_exists( 'fontSize', $attributes );
		$has_custom_font_size = array_key_exists( 'customFontSize', $attributes );

		if ( $has_named_font_size ) {
			// Add the font size class.
			$font_sizes['css_classes'][] = sprintf( 'has-%s-font-size', $attributes['fontSize'] );
		} elseif ( $has_custom_font_size ) {
			// Add the custom font size inline style.
			$font_sizes['inline_styles'] = sprintf( 'font-size: %spx;', $attributes['customFontSize'] );
		}

		return $font_sizes;
	}

	public static function render( $attributes, $content, $block ) {
		
		$inner_blocks = $block->inner_blocks;
		
		static::handle_view_script_module_loading( $attributes, $block, $inner_blocks );

		$position = $attributes['position'] ?? 'relative';
		
		return sprintf(
			'<div %1$s%3$s>%2$s</div>%4$s%5$s',
			static::get_nav_wrapper_attributes( $attributes, $inner_blocks ),
			static::get_wrapper_markup( $attributes, $inner_blocks ),
			!empty( $attributes['minHeight'] ) ? ' style="--gwx--min-nav-size: ' . esc_attr( $attributes['minHeight'] ) . ';"' : '',
			'<div class="gwx-navigation__curtain"></div>',
			($position !== 'relative' && $position !== 'sticky') ? '<div class="gwx-navigation__placeholder"></div>' : ''
		);
	}
}

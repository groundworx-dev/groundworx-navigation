<?php
defined( 'ABSPATH' ) || exit;

require_once GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/inc/utils.php';

function gwx_navigation_register_block_navigation_menu() {
	register_block_type_from_metadata(
		__DIR__,
		array(
			'render_callback' => array( 'GWXNavigationMenuBlockRenderer', 'render' ),
		)
	);
}

add_action( 'init', 'gwx_navigation_register_block_navigation_menu' );

class GWXNavigationMenuBlockRenderer {
	private static $has_submenus = false;

	private static $needs_list_item_wrapper = array(
	);

	private static $seen_menu_names = array();

	private static function does_block_need_a_list_item_wrapper( $block ) {
		$needs_wrapper = apply_filters( 'block_core_navigation_listable_blocks', static::$needs_list_item_wrapper );
		return in_array( $block->name, $needs_wrapper, true );
	}

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

	private static function is_interactive( $attributes, $inner_blocks ) {
		$has_submenus       = static::has_submenus( $inner_blocks );
		$is_responsive_menu = static::is_responsive( $attributes );
		return ( $has_submenus && ( $attributes['showSubmenuIcon'] ) ) || $is_responsive_menu;
	}

	private static function is_responsive( $attributes ) {
		return ! empty( $attributes['toType'] );
	}

	private static function get_markup_for_inner_block( $block ) {
		
		$inner_html = $block->render();
		
		if ( empty( $inner_html ) ) {
			return '';
		}
		if ( static::does_block_need_a_list_item_wrapper( $block ) ) {
			return '<li class="gwx-menu-item">' . $inner_html . '</li>';
		}
		return $inner_html;
	}

	private static function get_inner_blocks_html( $attributes, $inner_blocks ) {
		$has_submenus   = static::has_submenus( $inner_blocks );
		$is_interactive = static::is_interactive( $attributes, $inner_blocks );

		$container_attributes =  " class='gwx-menu__container'";

		$inner_blocks_html = '';
		$is_list_open      = false;

		foreach ( $inner_blocks as $inner_block ) {
			
			$inner_block_markup = static::get_markup_for_inner_block( $inner_block );
			
			$p                  = new WP_HTML_Tag_Processor( $inner_block_markup );			
			$is_list_item       = $p->next_tag( 'LI' );

			if ( $is_list_item  && ! $is_list_open ) {
				$is_list_open       = true;
				$inner_blocks_html .= sprintf(
					'<ul %1$s>',
					$container_attributes
				);
			}

			if ( ! $is_list_item && $is_list_open ) {
				$is_list_open       = false;
				$inner_blocks_html .= '</ul>';
			}

			$inner_blocks_html .= $inner_block_markup;
		}

		if ( $is_list_open ) {
			$inner_blocks_html .= '</ul>';
		}

		// Add directives to the submenu if needed.
		if ( $has_submenus ) {
			$tags              = new WP_HTML_Tag_Processor( $inner_blocks_html );
			$inner_blocks_html = static::add_directives_to_navigation_submenu( $tags, $attributes );
		}

		return $inner_blocks_html;
	}

	private static function has_submenus( $inner_blocks ) {
		if ( true === static::$has_submenus ) {
			return static::$has_submenus;
		}

		foreach ( $inner_blocks as $inner_block ) {
			// If this is a page list then work out if any of the pages have children.
			if ( 'core/page-list' === $inner_block->name ) {
				$all_pages = get_pages(
					array(
						'sort_column' => 'menu_order,post_title',
						'order'       => 'asc',
					)
				);
				foreach ( (array) $all_pages as $page ) {
					if ( $page->post_parent ) {
						static::$has_submenus = true;
						break;
					}
				}
			}
			// If this is a navigation submenu then we know we have submenus.
			if ( 'groundworx/navigation-submenu' === $inner_block->name ) {
				//error_log( print_r( $inner_block, true ) );
				static::$has_submenus = true;
				break;
			}
		}

		return static::$has_submenus;
	}

	private static function get_inner_blocks_from_navigation_post( $attributes ) {
		$navigation_post = get_post( $attributes['ref'] );
		if ( ! isset( $navigation_post ) ) {
			return new WP_Block_List( array(), $attributes );
		}

		// Only published posts are valid. If this is changed then a corresponding change
		// must also be implemented in `use-navigation-menu.js`.
		if ( 'publish' === $navigation_post->post_status ) {
			$parsed_blocks = parse_blocks( $navigation_post->post_content );

			// 'parse_blocks' includes a null block with '\n\n' as the content when
			// it encounters whitespace. This code strips it.
			$blocks = block_core_navigation_filter_out_empty_blocks( $parsed_blocks );

			// Re-serialize, and run Block Hooks algorithm to inject hooked blocks.
			// TODO: See if we can move the apply_block_hooks_to_content_from_post_object() call
			// before the parse_blocks() call further above, to avoid the extra serialization/parsing.
			$markup = serialize_blocks( $blocks );
			$markup = apply_block_hooks_to_content_from_post_object( $markup, $navigation_post );
			$blocks = parse_blocks( $markup );

			$blocks = static::filter_blocks_by_nesting_level( $blocks, $attributes['maxNestingLevel'] ?? 5 );
			
			// TODO - this uses the full navigation block attributes for the
			// context which could be refined.
			return new WP_Block_List( $blocks, $attributes );
		}
	}


	/**
	 * Gets the inner blocks for the navigation block from the fallback.
	 *
	 * @since 6.5.0
	 *
	 * @param array $attributes The block attributes.
	 * @return WP_Block_List Returns the inner blocks for the navigation block.
	 */
	private static function get_inner_blocks_from_fallback( $attributes ) {
		$fallback_blocks = block_core_navigation_get_fallback_blocks();

		// Fallback my have been filtered so do basic test for validity.
		if ( empty( $fallback_blocks ) || ! is_array( $fallback_blocks ) ) {
			return new WP_Block_List( array(), $attributes );
		}

		return new WP_Block_List( $fallback_blocks, $attributes );
	}


	private static function get_inner_blocks( $attributes, $block ) {
		$inner_blocks = $block->inner_blocks;

		// Ensure that blocks saved with the legacy ref attribute name (navigationMenuId) continue to render.
		if ( array_key_exists( 'navigationMenuId', $attributes ) ) {
			$attributes['ref'] = $attributes['navigationMenuId'];
		}

		// Load inner blocks from the navigation post.
		if ( array_key_exists( 'ref', $attributes ) ) {
			$inner_blocks = static::get_inner_blocks_from_navigation_post( $attributes );
		}

		// If there are no inner blocks then fallback to rendering an appropriate fallback.
		if ( empty( $inner_blocks ) ) {
			$inner_blocks = static::get_inner_blocks_from_fallback( $attributes );
		}

		/**
		 * Filter navigation block $inner_blocks.
		 * Allows modification of a navigation block menu items.
		 *
		 * @since 6.1.0
		 *
		 * @param \WP_Block_List $inner_blocks
		 */
		$inner_blocks = apply_filters( 'block_core_navigation_render_inner_blocks', $inner_blocks );

		$post_ids = block_core_navigation_get_post_ids( $inner_blocks );
		if ( $post_ids ) {
			_prime_post_caches( $post_ids, false, false );
		}

		return $inner_blocks;
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
		$font_sizes   = block_core_navigation_build_css_font_sizes( $attributes );
		$block_styles = isset( $attributes['styles'] ) ? $attributes['styles'] : '';
		return $block_styles . $font_sizes['inline_styles'];
	}

	private static function get_classes( $attributes ) {
		// Restore legacy classnames for submenu positioning.
		$font_sizes         = block_core_navigation_build_css_font_sizes( $attributes );

		// Manually add block support text decoration as CSS class.
		$text_decoration       = $attributes['style']['typography']['textDecoration'] ?? null;
		$text_decoration_class = sprintf( 'has-text-decoration-%s', $text_decoration );
		$layout_type		   = $attributes['type'] ?? 'list';
		$layout_type_class = sprintf( 'layout-type--%s', $layout_type );
		$position_class = ( ! empty( $attributes['menuPosition'] ) ) ? ['is-position-' . sanitize_title( $attributes['menuPosition'] )] : [];

		$classes = array_merge(
			array('gwx-menu'),
			$font_sizes['css_classes'],
			$position_class,
			$layout_type ? array($layout_type_class) : array(),
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

		$type               = $attributes['type'] ?? 'list';
		$to_type            = $attributes['toType'] ?? null;
		$switch_at          = isset( $attributes['switchAt'] )
			? Groundworx_Menu_Breakpoints::resolve( $attributes['switchAt'] )
			: null;
		$is_responsive      = static::is_responsive( $attributes );

		// Build context
		$context_data = [
			'submenuOpenedBy' => [
				'click' => false,
				'hover' => false,
				'focus' => false,
			],
			'shouldSwitchLayout' => false,
			'type'          => 'submenu',
			'roleAttribute' => '',
			'ariaLabel'     => __( 'Menu', 'groundworx-navigation' ),
		];

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
		
		if ( $type === $to_type) {
			$directives[ 'data-wp-class--layout-type--' . sanitize_title( $to_type ) ] = 'context.isInitialized';
		} else {
			// Only inject layout switching logic if both switchAt and type are valid
			if ( $type ) {
				$directives[ 'data-wp-class--layout-type--' . sanitize_title( $type ) ] = '!context.shouldSwitchLayout';
			}
			
			if ( $is_responsive && !empty($to_type) && !empty($switch_at)) {
				$directives[ 'data-wp-class--layout-type--' . sanitize_title( $to_type ) ] = 'context.shouldSwitchLayout';
			}
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

		return trim( $output );
	}

	private static function handle_view_script_module_loading( $attributes, $block, $inner_blocks ) {
		if ( static::is_interactive( $attributes, $inner_blocks ) ) {
			wp_enqueue_script_module( 'groundworx-navigation-view' );
		}
	}

	private static function add_directives_to_navigation_submenu( $tags, $block_attributes ) {
		$type    = $block_attributes['type'] ?? '';
		$to_type = $block_attributes['toType'] ?? '';
		$layout_type = $to_type ?: $type;
		$open_submenus_on_hover = $block_attributes['openSubmenusOnHover'] ?? false;
		$show_submenu_icon = $block_attributes['showSubmenuIcon'] ?? false;

		while ( $tags->next_tag(
			array(
				'tag_name'   => 'LI',
				'class_name' => 'has-child',
			)
		) ) {
			// Add directives to the parent `<li>`.
			$tags->set_attribute( 'data-wp-interactive', 'groundworx/navigation' );			
			$context = array(
				'submenuOpenedBy' => array(
					'click' => false,
					'hover' => false,
					'focus' => false,
				),
				'type' => 'submenu',
				'modal' => null,
				'shouldAlignRight' => false,
				'previousFocus' => null
			);
			$tags->set_attribute( 'data-wp-context', wp_json_encode( $context ) );

			$tags->set_attribute( 'data-wp-watch', 'callbacks.initMenu' );
			$tags->set_attribute( 'data-wp-on--focusout', 'actions.handleMenuFocusout' );
			$tags->set_attribute( 'data-wp-on--keydown', 'actions.handleMenuKeydown' );
			
			// This is a fix for Safari. Without it, Safari doesn't change the active
			// element when the user clicks on a button. It can be removed once we add
			// an overlay to capture the clicks, instead of relying on the focusout
			// event.
			$tags->set_attribute( 'tabindex', '-1' );

			if ( $layout_type === 'horizontal-menu' && $open_submenus_on_hover !== false ) {
				$tags->set_attribute( 'data-wp-on-async--mouseenter', 'actions.openMenuOnHover' );
				$tags->set_attribute( 'data-wp-on-async--mouseleave', 'actions.closeMenuOnHover' );
			}

			// Add directives to the toggle submenu button.
			if ( $open_submenus_on_hover !== false ) {
				if ( $tags->next_tag(
					array(
						'tag_name'   => 'DIV',
						'class_name' => 'gwx-menu-item__content',
					)
				) ) {
					$tags->set_attribute( 'data-wp-bind--aria-expanded', 'state.isMenuOpen' );
					$tags->add_class( 'is-hover' );
				}
				
			} else {
				if ( $tags->next_tag(
					array(
						'tag_name'   => 'DIV',
						'class_name' => 'gwx-menu-item__content',
					)
				) ) {
					$tags->set_attribute( 'data-wp-on-async--click', 'actions.toggleMenuOnClick' );
					$tags->set_attribute( 'data-wp-bind--aria-expanded', 'state.isMenuOpen' );
					$tags->add_class( 'is-click' );
				}
			}

			if ( $show_submenu_icon !== false ) {
				if ( $tags->next_tag(
					array(
						'tag_name'   => 'BUTTON',
						'class_name' => 'gwx-menu-item__icon',
					)
				) ) {
					$tags->set_attribute( 'data-wp-on-async--click', 'actions.toggleMenuOnClick' );
					$tags->set_attribute( 'data-wp-bind--aria-expanded', 'state.isMenuOpen' );
					// The `aria-expanded` attribute for SSR is already added in the submenu block.
				}
			}

			// Add directives to the submenu.
			if ( $tags->next_tag(
				array(
					'tag_name'   => 'DIV',
					'class_name' => 'gwx-menu-item__subcontent',
				)
			) ) {
				$tags->set_attribute( 'data-wp-on-async--focus', 'actions.openMenuOnFocus' );
			}

			// Iterate through subitems if exist.
			static::add_directives_to_navigation_submenu( $tags, $block_attributes );
		}
		return $tags->get_updated_html();
	}


	public static function render( $attributes, $content, $block ) {
		$context   = isset( $block->context ) && is_array( $block->context ) ? $block->context : [];

		$attributes = array_merge( $attributes, $context );

		if ( empty( $attributes['ref'] ) ) {
			return '';
		}

		$post = get_post( (int) $attributes['ref'] );
		if ( ! $post || 'gwx_menu' !== $post->post_type || 'publish' !== $post->post_status ) {
			return '';
		}
		$inner_blocks = static::get_inner_blocks( $attributes, $block );
		
		static::handle_view_script_module_loading( $attributes, $block, $inner_blocks );

		return sprintf(
			'<div %1$s><div class="gwx-menu__container">%2$s</div></div>',
			static::get_nav_wrapper_attributes( $attributes, $inner_blocks ),
			static::get_inner_blocks_html( $attributes, $inner_blocks )
		);
	}
}

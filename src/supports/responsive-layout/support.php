<?php
defined( 'ABSPATH' ) || exit;

class GWXResponsiveLayoutSupport {
	public function __construct() {
		add_filter( 'render_block', [ $this, 'render_block' ], 10, 2 );
	}

	/**
	 * Adds responsive layout styles and classes during block rendering.
	 */
	public function render_block( $block_content, $block ) {
		if (
			empty( $block['attrs']['responsiveSize'] ) ||
			! $this->block_supports_responsive_layout( $block )
		) {
			return $block_content;
		}

		$mode  = $block['attrs']['responsiveSize']['mode'] ?? 'fit';
		$value = $block['attrs']['responsiveSize']['value'] ?? '';

		// Add has-mode-{mode} class
		if ( $mode ) {
			$block_content = preg_replace(
				'/class="([^"]*)"/',
				'class="$1 has-mode-' . esc_attr( $mode ) . '"',
				$block_content,
				1
			);
		}

		// Compose style string
		$style = '';
		if ( $mode === 'grow' ) {
			$style .= 'flex-grow: 1;';
		} elseif ( $mode === 'fixed' && $value ) {
			$style .= 'flex-basis: ' . esc_attr( $value ) . ';';
		}

		// Inject inline style
		if ( $style ) {
			$block_content = preg_replace_callback(
				'/<([a-z0-9]+)([^>]*)>/i',
				function ( $matches ) use ( $style ) {
					if ( strpos( $matches[2], 'style=' ) !== false ) {
						// Append to existing style
						return preg_replace(
							'/style=(["\'])(.*?)\1/',
							'style=$1$2 ' . $style . '$1',
							"<{$matches[1]}{$matches[2]}>"
						);
					} else {
						// Add new style
						return "<{$matches[1]}{$matches[2]} style=\"" . esc_attr( $style ) . "\">";
					}
				},
				$block_content,
				1
			);
		}

		return $block_content;
	}

	/**
	 * Checks if a block supports the responsiveLayout support flag.
	 */
	private function block_supports_responsive_layout( $block ) {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] ?? '' );

		return (
			$block_type
			&& ! empty( $block_type->supports['groundworx']['responsiveLayout'] )
		);
	}
}

// Initialize it
new GWXResponsiveLayoutSupport();

<?php 
defined( 'ABSPATH' ) || exit;

function gwx_navigation_register_block_menu_branding() {
	register_block_type_from_metadata(
		__DIR__
	);
}
add_action( 'init', 'gwx_navigation_register_block_menu_branding' );

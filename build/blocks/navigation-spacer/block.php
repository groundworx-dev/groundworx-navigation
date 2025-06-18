<?php
defined( 'ABSPATH' ) || exit;

function register_block_groundworx_navgation_spacer() {
	register_block_type_from_metadata(
		__DIR__
	);
}
add_action( 'init', 'register_block_groundworx_navgation_spacer' );

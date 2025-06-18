<?php
defined( 'ABSPATH' ) || exit;

function groundworx_get_menu_icon( $key ) {
        
    $icons = apply_filters( 'groundworx_menu_icons', [
        'menuOpen' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="6" width="18" height="2"/><rect x="3" y="11" width="18" height="2"/><rect x="3" y="16" width="18" height="2"/></svg>', // hamburger

        'menuClose' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', // close (X)

        'submenuToggle' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M8 10l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>', // chevron down

        'submenuResponsiveToggle' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>', // thicker chevron down
    ] );

    if ( ! isset( $icons[ $key ] ) ) {
        return '';
    }

    return groundworx_menu_sanitize_svg( $icons[ $key ] );
}

function groundworx_menu_sanitize_svg( $svg ) {
	return wp_kses( $svg, array(
		'svg' => array(
			'xmlns' => true,
			'width' => true,
			'height' => true,
			'viewBox' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'aria-hidden' => true,
			'focusable' => true,
			'class' => true,
			'role' => true,
		),
		'rect' => array(
			'x' => true,
			'y' => true,
			'width' => true,
			'height' => true,
			'rx' => true,
			'ry' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
		),
		'path' => array(
			'd' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'stroke-linejoin' => true,
			'class' => true,
		),
		'g' => array(
			'fill' => true,
			'stroke' => true,
			'class' => true,
		),
		'circle' => array(
			'cx' => true,
			'cy' => true,
			'r' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
		),
		'title' => array(),
		'desc' => array(),
	) );
}

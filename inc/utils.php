<?php
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Groundworx_Menu_Breakpoints' ) ) {
	class Groundworx_Menu_Breakpoints {
		protected static $breakpoints = null;

		/**
		 * Load and cache breakpoints from JSON
		 */
		protected static function load() {
			if ( ! is_null( self::$breakpoints ) ) {
				return;
			}
		
			$path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . 'breakpoints.json';
		
			if ( file_exists( $path ) ) {
				$json = file_get_contents( $path );
				$data = json_decode( $json, true );
				self::$breakpoints = is_array( $data ) ? $data : [];
			} else {
				self::$breakpoints = [];
			}
		}

		/**
		 * Get all breakpoints
		 *
		 * @return array
		 */
		public static function all() {
			self::load();
			return self::$breakpoints;
		}

		/**
		 * Get raw breakpoint value by key
		 *
		 * @param string $key
		 * @return string|null
		 */
		public static function get( $key ) {
			self::load();
			return self::$breakpoints[ $key ] ?? null;
		}

		/**
		 * Get numeric value from breakpoint key or number
		 *
		 * @param string|int $key
		 * @return int|null
		 */
		public static function resolve( $key ) {
			self::load();

			// Already a number
			if ( is_numeric( $key ) ) {
				return (int) $key;
			}

			$value = self::get( $key );
			if ( $value && preg_match( '/^\d+/', $value, $matches ) ) {
				return (int) $matches[0];
			}

			return null;
		}
	}
}
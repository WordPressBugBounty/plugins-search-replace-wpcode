<?php
/**
 * Load scripts for the admin area.
 *
 * @package WPCode
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_enqueue_scripts', 'wsrw_admin_scripts' );

/**
 * Load admin scripts here.
 *
 * @return void
 */
function wsrw_admin_scripts() {

	$current_screen = get_current_screen();

	if ( ! isset( $current_screen->id ) || false === strpos( $current_screen->id, 'wsrw-search-replace' ) ) {
		return;
	}

	$admin_asset_file = WSRW_PLUGIN_PATH . 'build/admin.asset.php';

	if ( ! file_exists( $admin_asset_file ) ) {
		return;
	}

	$asset = require $admin_asset_file;

	wp_enqueue_style( 'wsrw-admin-css', WSRW_PLUGIN_URL . 'build/admin.css', null, $asset['version'] );

	wp_enqueue_script( 'wsrw-admin-js', WSRW_PLUGIN_URL . 'build/admin.js', $asset['dependencies'], $asset['version'], true );

	wp_localize_script(
		'wsrw-admin-js',
		'wsrwjs',
		apply_filters(
			'wsrw_admin_js_data',
			array(
				'nonce'       => wp_create_nonce( 'wsrw_admin' ),
				'yes'         => esc_html__( 'Yes', 'search-replace-wpcode' ),
				'no'          => esc_html__( 'No', 'search-replace-wpcode' ),
				'ok'          => esc_html__( 'OK', 'search-replace-wpcode' ),
				'error_title' => esc_html__( 'Error', 'search-replace-wpcode' ),
				'please_wait' => esc_html__( 'Please Wait', 'search-replace-wpcode' ),
			)
		)
	);
}

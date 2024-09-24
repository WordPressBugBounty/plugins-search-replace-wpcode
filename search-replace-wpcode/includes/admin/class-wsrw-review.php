<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ask for some love.
 */
class WSRW_Review {

	/**
	 * Primary class constructor.
	 */
	public function __construct() {
		// Admin footer text.
		add_filter( 'admin_footer_text', array( $this, 'admin_footer' ), 1, 2 );
	}

	/**
	 * When user is on a WSRW related admin page, display custom footer text.
	 *
	 * @param string $text Footer text.
	 *
	 * @return string
	 *
	 *
	 */
	public function admin_footer( $text ) {

		global $current_screen;

		if ( ! empty( $current_screen->id ) && strpos( $current_screen->id, 'wsrw' ) !== false ) {
			$view = isset( $_GET['view'] ) ? sanitize_text_field( wp_unslash( $_GET['view'] ) ) : 'search_replace';
			$url  = wsrw_utm_url( 'https://wpcode.com/sr-feedback', 'admin-footer', $view );
			$text = sprintf(
				/* translators: %1$s - opening link tag; %2$s - closing link tag. */
				__( 'Have feedback or feature requests? %1$sShare them with us!%2$s', 'insert-headers-and-footers' ),
				'<a href="' . esc_url( $url ) . '" target="_blank">',
				'</a>'
			);
		}

		return $text;
	}

}

new WSRW_Review();

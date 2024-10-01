jQuery( function ( $ ) {
	$( '.wsrw-close-modal, .wsrw-modal-overlay' ).on(
		'click',
		function () {
			const $body = $( 'body' );
			// Let's disable closing the modal if a specific class is used.
			if ( $body.hasClass( 'wsrw-no-close' ) ) {
				return;
			}
			$body.removeClass( 'wsrw-show-modal' );

			$(document).trigger( 'wsrw-modal-closed' );
		}
	);
} );

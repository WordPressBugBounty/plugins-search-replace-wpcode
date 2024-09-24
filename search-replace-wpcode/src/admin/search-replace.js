/* global ajaxurl, wsrwjs */
const WSRSearchReplace = window.WSRSearchReplace || (
	function ( document, window, $ ) {
		// jquery-confirm defaults.
		jconfirm.defaults = {
			closeIcon: true,
			backgroundDismiss: false,
			escapeKey: true,
			animationBounce: 1,
			useBootstrap: false,
			theme: 'modern',
			boxWidth: '400px',
			type: 'blue',
			animateFromElement: false,
		};
		const app = {
			pages: 0,
			dry_run: true,
			init() {
				app.find_elements();
				app.init_form();
			},
			find_elements() {
				app.form = $( '#wsrw-search-replace-form' );
				app.results = $( '#wsrw-results' );
				app.progress = $( '#wsrw-progress-bar-replace .wsrw-progress-bar-inner' );
				app.$table = $( '#wsrw-results-table' );
				app.$start_button = $( '#wsrw-start-replace' );
				app.$do_button = $( '#wsrw-perform-search-replace' );
				app.$text_display = $( '#wsrw-progress-text-replace' );
				app.$modal = $( '#wsrw-search-replace-progress' );
				app.$undo_button = $( document.getElementById( 'wsrw-results-undo-button' ) );
			},
			init_form() {
				app.form.on(
					'submit',
					function ( e ) {
						e.preventDefault();
						WSRSpinner.show_button_spinner( app.$start_button );
						app.start_search_replace();
					}
				);
				app.$do_button.on(
					'click',
					function ( e ) {
						e.preventDefault();
						// Jconfirm the user before proceeding.
						$.confirm( {
							title: wsrwjs.sr_confirm_title,
							content: wsrwjs.sr_confirm_message,
							type: 'blue',
							icon: 'fa fa-exclamation-circle',
							animateFromElement: false,
							buttons: {
								confirm: {
									text: wsrwjs.yes,
									btnClass: 'btn-confirm',
									keys: ['enter'],
								},
								cancel: {
									text: wsrwjs.no,
									btnClass: 'btn-cancel',
									keys: ['esc'],
								},
							},
							onAction: function ( action ) {
								if ( action === 'confirm' ) {
									app.$do_button.prop( 'disabled', true );
									app.start_search_replace( false );
								}
							},
						} );

					}
				);
			},
			start_search_replace( dry_run = true ) {
				app.dry_run = dry_run;
				const search = $( '#wsrw-search' ).val();
				const data = {
					action: 'wsrw_start_search_replace',
					nonce: wsrwjs.nonce,
					search: search,
					replace: $( '#wsrw-replace' ).val(),
				};
				// If search term is empty return and show error.
				if ( search === '' ) {
					WSRSpinner.hide_button_spinner( app.$start_button );
					$.alert( {
						title: wsrwjs.no_search_term_title,
						content: wsrwjs.no_search_term_message,
						type: 'blue',
						icon: 'fa fa-exclamation-circle',
						animateFromElement: false,
						buttons: {
							confirm: {
								text: wsrwjs.ok,
								btnClass: 'btn-confirm',
								keys: ['enter'],
							},
						},
					} );
					return;
				}
				if ( $( '#wsrw-case-insensitive' ).is( ':checked' ) ) {
					data.case_insensitive = 1;
				}
				if ( !dry_run ) {
					data.dry_run = 0;
				}
				// Let's get the tables value from all the checkboxes with the name of tables[].
				const tables = $( 'input[name="tables[]"]:checked' ).map(
					function () {
						return $( this ).val();
					}
				).get();
				// If no tables selected, return and show error.
				if ( tables.length === 0 ) {
					WSRSpinner.hide_button_spinner( app.$start_button );
					$.alert( {
						title: wsrwjs.no_table_selected_title,
						content: wsrwjs.no_table_selected_message,
						type: 'blue',
						icon: 'fa fa-exclamation-circle',
						animateFromElement: false,
						buttons: {
							confirm: {
								text: wsrwjs.ok,
								btnClass: 'btn-confirm',
								keys: ['enter'],
							},
						},
					} );
					return;
				}

				data['tables[]'] = tables;

				app.$do_button.prop( 'disabled', true );
				$.ajax(
					{
						url: ajaxurl,
						type: 'POST',
						data: data,
						beforeSend: function () {
							app.form.find( 'input, button' ).prop( 'disabled', true );
						},
						success: function ( response ) {
							// Let's show the modal at this stage.
							app.$undo_button.hide();
							$( 'body' ).addClass( 'wsrw-show-modal wsrw-no-close' );
							app.fit_results();
							WSRSpinner.hide_button_spinner( app.$start_button );
							app.form.find( 'input, button' ).prop( 'disabled', false );
							app.pages = response.data.pages;
							// Remove all the rows from the table except the first one.
							app.$table.find( 'tr:gt(0)' ).remove();
							app.do_search_replace( response.data );
						},
						error: function ( response ) {
							app.form.find( 'input, button' ).prop( 'disabled', false );
							app.show_results( response );
						}
					}
				);
			},
			do_search_replace() {
				const data = {
					action: 'wsrw_do_search_replace',
					nonce: wsrwjs.nonce,
				};
				$.ajax(
					{
						url: ajaxurl,
						type: 'POST',
						data: data,
						success: function ( response ) {
							app.show_results( response );
							// Let's calculate the progress bar width.
							const progress = (
								                 response.data.page / app.pages
							                 ) * 100;
							app.progress.css( 'width', progress + '%' );
							if ( response.data.page < response.data.pages ) {
								app.do_search_replace();
							} else {
								app.show_finish_message();
							}
						},
						error: function ( response ) {
							app.show_results( response );
						}
					}
				);
			},
			show_results( response ) {
				if ( response.data.updated_data && response.data.updated_data.length > 0 ) {
					// Loop through the updated data and show it.
					$.each(
						response.data.updated_data,
						function ( key, value ) {
							// The value here has the format of an object with the keys: table, column, row, old, new.
							app.$table.append( $( '<tr><td>' + value.table + '</td><td>' + value.column + '</td><td>' + value.row + '</td><td><pre>' + value.old + '</pre></td><td><pre>' + value.new + '</pre></td></tr>' ) );

						}
					);
				}

				if ( response.data.message ) {
					app.display_text( response.data.message );
				}
			},
			show_finish_message() {
				// If no rows were added to the table, show a message.
				if ( app.$table.find( 'tr' ).length === 1 ) {
					app.display_text( wsrwjs.no_results_found );
				} else {
					app.display_text( wsrwjs.finished );
				}
				// Remove the no-close class so the modal can be closed.
				$( 'body' ).removeClass( 'wsrw-no-close' );
				if ( ! app.dry_run ) {
					app.$undo_button.show();
				} else {
					app.$do_button.prop( 'disabled', false );
				}
			},
			display_text( text ) {
				app.$text_display.text( text );
			},
			fit_results() {
				// Let's fit the results box to the modal height.
				const modal_height = app.$modal.height();
				let other_height = 0;
				app.$modal.children().each(
					function () {
						if ( !$( this ).is( app.results ) ) {
							const childHeight = $( this ).outerHeight( true );
							other_height += childHeight;
						}
					}
				);
				app.results.height( modal_height - other_height );
			}
		};
		return app;
	}( document, window, jQuery )
);

WSRSearchReplace.init();
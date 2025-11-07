import {
	store,
	getContext,
	getElement,
	withSyncEvent
} from '@wordpress/interactivity';

const focusableSelectors = [
	'a[href]',
	'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
	'select:not([disabled]):not([aria-hidden])',
	'textarea:not([disabled]):not([aria-hidden])',
	'button:not([disabled]):not([aria-hidden])',
	'[contenteditable]',
	'[tabindex]:not([tabindex^="-"])',
];
let revealNavInitCount = 0;

const { actions, state } = store('groundworx/navigation', {
	state: {
		get switchAt() {
			const ctx = getContext();
			return ctx.switchAt;
		},
		get isInitialized() {
			const ctx = getContext();
			return ctx.isInitialized;
		},
		get roleAttribute() {
			const ctx = getContext();
			return ctx.type === 'overlay' && state.isMenuOpen ? 'dialog' : null;
		},
		get ariaModal() {
			const ctx = getContext();
			return ctx.type === 'overlay' && state.isMenuOpen ? 'true' : null;
		},
		get ariaLabel() {
			const ctx = getContext();
			return ctx.type === 'overlay' && state.isMenuOpen ? ctx.ariaLabel : null;
		},
		get ariaLabelTrigger() {
			const ctx = getContext();
			return ctx.type === 'overlay' && state.isMenuOpen ? ctx.ariaLabelOpened : ctx.ariaLabelClosed;
		},
		get isMenuOpen() {
			// The menu is opened if either `click`, `hover` or `focus` is true.
			return (
				Object.values( state.menuOpenedBy ).filter( Boolean )
					.length > 0
			);
		},
		get menuOpenedBy() {
			const ctx = getContext();
			return ctx.type === 'overlay' ? ctx.overlayOpenedBy : ctx.submenuOpenedBy;
		}
	},

	callbacks: {
		initMenu() {
			const ctx = getContext();
			const { ref } = getElement();

			actions.checkViewport();
			window
				.matchMedia(`(min-width: ${ctx.switchAt}px)`)
				.addEventListener('change', actions.checkViewport);

			ctx.isInitialized = true;

			if (state.isMenuOpen) {
				const focusableElements = ref.querySelectorAll(focusableSelectors);
				ctx.modal = ref;
				ctx.firstFocusableElement = focusableElements[0];
				ctx.lastFocusableElement = focusableElements[focusableElements.length - 1];
			}

		},
		focusFirstElement() {
			const { ref } = getElement();
			if ( state.isMenuOpen ) {
				const focusableElements = ref.querySelectorAll( focusableSelectors );
				focusableElements?.[ 0 ]?.focus();
			}
		},
        scrollUpReveal() {
			const { ref } = getElement();
			if (!ref || !ref.classList.contains('is-position-scroll-up-reveal')) return;

			// Init logic — run once
			if (!ref._scrollUpRevealInit && revealNavInitCount === 0) {
				ref._scrollUpRevealInit = true;
				revealNavInitCount++;

				const updateBodyHeightVar = () => {
					const height = ref.getBoundingClientRect().height;
					document.body.style.setProperty('--gwx-nav-top-height', `${height}px`);
				};

				requestAnimationFrame(() => {
					requestAnimationFrame(updateBodyHeightVar);
				});
				window.addEventListener('resize', updateBodyHeightVar);

				ref._scrollUpRevealThreshold = ref.offsetTop + ref.offsetHeight;
				ref._scrollUpRevealPrevScrollPos = window.scrollY;
			}

			// Always run this part
			const currentScrollPos = window.scrollY;
			const prevScrollPos = ref._scrollUpRevealPrevScrollPos ?? currentScrollPos;
			const scrollingDown = currentScrollPos > prevScrollPos;
			const isAtTop = currentScrollPos <= ref._scrollUpRevealThreshold;

			ref.classList.toggle('scroll-init', currentScrollPos > 0);
			ref.classList.toggle('scroll-up', !scrollingDown && !isAtTop);
			ref.classList.toggle('scroll-down', scrollingDown && !isAtTop);

			ref._scrollUpRevealPrevScrollPos = currentScrollPos;
		},
		
		measureNavBounds() {
			const { ref } = getElement();
			if (!ref || ref._navBoundsInit) return;

			const MIN_MEASURE_VW = 300;

			const clearVars = () => {
				const bodyStyle = document.body.style;
				bodyStyle.removeProperty('--gwx-nav-top-height');
				bodyStyle.removeProperty('--gwx-nav-bottom-height');
				bodyStyle.removeProperty('--gwx-nav-left-width');
				bodyStyle.removeProperty('--gwx-nav-right-width');
			};

			const updateNavBounds = () => {
				const vw = document.documentElement.clientWidth;
				const vh = document.documentElement.clientHeight;

				// If too small, don't measure — and make sure we clear previous values.
				if (vw < MIN_MEASURE_VW) {
					clearVars();
					return;
				}

				const rect = ref.getBoundingClientRect();
				const bodyStyle = document.body.style;

				// Reset before setting
				clearVars();

				const distTop = Math.abs(rect.top);
				const distBottom = Math.abs(vh - rect.bottom);
				const distLeft = Math.abs(rect.left);
				const distRight = Math.abs(vw - rect.right);

				const touchesLeft = distLeft <= 1;
				const touchesRight = distRight <= 1;
				const touchesTop = distTop <= 50;
				const touchesBottom = distBottom <= 1;

				if (touchesLeft && touchesRight) {
					// Horizontal bar
					if (touchesBottom) {
						bodyStyle.setProperty('--gwx-nav-bottom-height', `${rect.height}px`);
					} else {
						bodyStyle.setProperty('--gwx-nav-top-height', `${rect.height}px`);
					}
				} else {
					// Vertical sidebar
					if (touchesLeft) {
						bodyStyle.setProperty('--gwx-nav-left-width', `${rect.width}px`);
					}
					if (touchesRight) {
						bodyStyle.setProperty('--gwx-nav-right-width', `${rect.width}px`);
					}
				}
			};

			ref._navBoundsInit = true;

			// Defer initial measure; guard will handle small viewports
			requestAnimationFrame(() => {
				requestAnimationFrame(updateNavBounds);
			});

			// Re-measure on resize; guard keeps it no-op under 300px
			window.addEventListener('resize', updateNavBounds);
		}

	},
	actions: {
		checkViewport() {
			const ctx = getContext();
			
			if (ctx.forceModal) {
				ctx.shouldSwitchLayout = false;
			} else {
				ctx.shouldSwitchLayout = window.innerWidth >= ctx.switchAt;
			}
			ctx._forceUpdate = Date.now(); // triggers reevaluation
		},
		openMenuOnHover() {
            const ctx = getContext();
			const parentCtx = getElement().ref.closest('[data-wp-context]');
			
			if (ctx.shouldSwitchLayout || ctx.alwaysHover) {
            	actions.openMenu('hover');
			}
        },
        closeMenuOnHover() {
            const ctx = getContext();
            const parentCtx = getElement().ref.closest('[data-wp-context]');
			if (ctx.shouldSwitchLayout || ctx.alwaysHover) {
            	actions.closeMenu('hover');
			}
        },

		toggleMenuOnClick() {
			const ctx = getContext();
			const { ref } = getElement();

			if (window.document.activeElement !== ref) {
				ref.focus();
			}
			const { menuOpenedBy } = state;
			if (menuOpenedBy.click || menuOpenedBy.focus) {
				actions.closeMenu('click');
				actions.closeMenu('focus');
			} else {
				ctx.previousFocus = ref;
				actions.openMenu('click');
			}
		},

		openMenuOnClick() {
			const ctx = getContext();
			const { ref } = getElement();
			ctx.previousFocus = ref;

			actions.openMenu( 'click' );
		},
		
		closeMenuOnClick() {
			actions.closeMenu( 'click' );
			actions.closeMenu( 'focus' );
		},

		handleMenuFocusout(event) {
			const ctx = getContext();
			const { modal, type } = ctx;
			
			if (
				event.relatedTarget === null ||
				( ! modal?.contains( event.relatedTarget ) && event.target !== window.document.activeElement )
			) {
				actions.closeMenu( 'click' );
				actions.closeMenu( 'focus' );
			}
		},

		openMenu(menuOpenedOn = 'click') {
			const { type, lockBody } = getContext();
			state.menuOpenedBy[menuOpenedOn] = true;

			if (type === 'overlay' && lockBody === true) {
				document.documentElement.classList.add('has-modal-open');
			}
		},

		closeMenu(menuClosedOn = 'click') {
			const ctx = getContext();
			const { type, lockBody } = ctx;

			state.menuOpenedBy[menuClosedOn] = false;
		
			if (!state.isMenuOpen) {
				
				if (ctx.modal?.contains(document.activeElement)) {
					ctx.previousFocus?.focus();
				}
				ctx.modal = null;
				ctx.previousFocus = null;
	
				if (type === 'overlay' && lockBody === true) {
					document.documentElement.classList.remove('has-modal-open');
				}
			}
		},
		
		handleMenuKeydown: withSyncEvent( ( event ) => {
			const { type, firstFocusableElement, lastFocusableElement } = getContext();
			
			if ( state.menuOpenedBy.click ) {
				// If Escape close the menu.
				if ( event.key === 'Escape' ) {
					event.stopPropagation(); // Keeps ancestor menus open.
					actions.closeMenu( 'click' );
					actions.closeMenu( 'focus' );
					return;
				}

				// Trap focus if it is an overlay (main menu).
				if ( type === 'overlay' && event.key === 'Tab' ) {
					// If shift + tab it change the direction.
					if (
						event.shiftKey &&
						window.document.activeElement ===
							firstFocusableElement
					) {
						event.preventDefault();
						lastFocusableElement.focus();
					} else if (
						! event.shiftKey &&
						window.document.activeElement ===
							lastFocusableElement
					) {
						event.preventDefault();
						firstFocusableElement.focus();
					}
				}
			}
		} ),
		
	}
	
},
{ lock: true });

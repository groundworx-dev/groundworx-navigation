import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { store as blockEditorStore, BlockControls, InspectorControls, useBlockProps, useInnerBlocksProps, withColors } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useCallback, useEffect, useState, useRef } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { plus } from '@wordpress/icons';
import { getBreakpoints } from '@groundworx/utils';

import ColorTools from './color-tools';
import MenuInspectorControls from './inspector-controls';
import { getColorCSSVar, getEditorCanvasWidth } from './../utils.js';

const ALLOWED_BLOCKS = [
	'groundworx/navigation-branding',
	'groundworx/navigation-menu',
];
const TEMPLATE = [
	['groundworx/navigation-branding'],
	['groundworx/navigation-menu'],
];

const DEFAULT_BLOCK = {
	name: 'groundworx/navigation-menu',
};

function Edit(props) {
	const { 
		attributes, 
		setAttributes,
        clientId,
		isSelected,
        className,
        textColor,
        setTextColor,
        linkColor,
        setLinkColor,
        hoverLinkColor,
        setHoverLinkColor,
        backgroundColor,
        setBackgroundColor,

        submenuTextColor,
        setSubmenuTextColor,
        submenuLinkColor,
        setSubmenuLinkColor,
        submenuHoverLinkColor,
        setSubmenuHoverLinkColor,
        submenuBackgroundColor,
        setSubmenuBackgroundColor,
        customPlaceholder: CustomPlaceholder = null,
        __unstableLayoutClassNames: layoutClassNames } = props;
	const {
		ref, 
		template,
		switchAt,
		type,
		toType,
		position,
		minHeight,
		toggleBehavior,
		templateLock
	} = attributes;
	
	const navRef = useRef();

	function measureNavBoundsForEditor(ref) {
		if (!ref || ref._navBoundsInit) return;

		const updateNavBounds = () => {
			const rect = ref.getBoundingClientRect();

			const iframe = document.querySelector('iframe[name="editor-canvas"]');
			const rootContainer = iframe?.contentDocument?.querySelector(
				'.is-root-container.wp-site-blocks.block-editor-block-list__layout'
			);

			if (!rootContainer) return;
			const style = rootContainer.style;

			// Clear all existing vars
			style.removeProperty('--gwx-nav-top-height');
			style.removeProperty('--gwx-nav-bottom-height');
			style.removeProperty('--gwx-nav-left-width');
			style.removeProperty('--gwx-nav-right-width');

			const { innerWidth: vw, innerHeight: vh } = iframe.contentWindow;

			const distTop = Math.abs(rect.top);
			const distBottom = Math.abs(vh - rect.bottom);
			const distLeft = Math.abs(rect.left);
			const distRight = Math.abs(vw - rect.right);

			const touchesLeft = distLeft <= 1;
			const touchesRight = distRight <= 1;
			const touchesTop = distTop <= 50;
			const touchesBottom = distBottom <= 1;

			if (touchesLeft && touchesRight) {
				if (touchesBottom) {
					style.setProperty('--gwx-nav-bottom-height', `${rect.height}px`);
				} else {
					style.setProperty('--gwx-nav-top-height', `${rect.height}px`);
				}
			} else {
				if (touchesLeft) {
					style.setProperty('--gwx-nav-left-width', `${rect.width}px`);
				}
				if (touchesRight) {
					style.setProperty('--gwx-nav-right-width', `${rect.width}px`);
				}
			}
		};

		ref._navBoundsInit = true;

		requestAnimationFrame(() => {
			requestAnimationFrame(updateNavBounds);
		});

		window.addEventListener('resize', updateNavBounds);
	}

	const { hasChildSelected } = useSelect(
		(select) => {
			const { getBlockOrder, getBlockName, getBlock, hasSelectedInnerBlock, getSelectedBlockClientId } =
				select('core/block-editor');

			const childClientIds = getBlockOrder(clientId);

			const navMenuBlockId = childClientIds.find(
				(childId) => getBlockName(childId) === 'groundworx/navigation-menu'
			);

			if (!navMenuBlockId) {
				return { hasChildSelected: false };
			}

			const selectedBlockId = getSelectedBlockClientId();
			const isNavMenuSelected = selectedBlockId === navMenuBlockId;
			const isDescendantSelected = hasSelectedInnerBlock(navMenuBlockId, true);

			return {
				hasChildSelected: isNavMenuSelected || isDescendantSelected,
			};
		},
		[clientId]
	);

	const { menus, isMenuLoading } = useSelect((select) => {
		const coreDataStore = select('core');

		return {
			menus: coreDataStore.getEntityRecords('postType', 'gwx_menu', { per_page: -1 }) || [],
			isMenuLoading: coreDataStore.isResolving('core', 'getEntityRecords', ['postType', 'gwx_menu']),
		};
	}, []);


	const handleUpdateMenu = useCallback(
		(newRef) => {
			setAttributes({ ref: newRef });
		},
		[setAttributes]
	);


    const [shouldSwitchLayout, setShouldSwitchLayout] = useState(false);

	const shouldOpenModal = hasChildSelected;

	const { insertBlocks } = useDispatch(blockEditorStore);
	const insertBlock = (blockName, clientId) => {
		const newBlock = createBlock(blockName);
		insertBlocks(newBlock, undefined, clientId);
	};

	useEffect(() => {
		if ( toggleBehavior === true ) {
			setShouldSwitchLayout(false);
			return;
		}

		const updateLayoutSwitch = () => {
			const canvasWidth = getEditorCanvasWidth();
			
			const resolved = getBreakpoints.resolve(switchAt);
			setShouldSwitchLayout(canvasWidth >= resolved);
		};

		updateLayoutSwitch();

		const resizeObserver = new ResizeObserver(updateLayoutSwitch);
		const iframe = document.querySelector('iframe[name="editor-canvas"]');
		if (iframe?.contentDocument?.body) {
			resizeObserver.observe(iframe.contentDocument.body);
		}

		return () => resizeObserver.disconnect();
	}, [switchAt, toggleBehavior]);

	const blockProps = useBlockProps({
		ref: navRef, 
		className: clsx(
			className,
			getEditorLayoutClasses(attributes, shouldSwitchLayout, shouldOpenModal),
			{
				'is-responsive': toType,
				'has-text-color': !! textColor.color || !! textColor?.class,
				'has-background': !! backgroundColor.color || backgroundColor.class,
			},
			layoutClassNames
		),
		style: {
            ...getColorCSSVar(attributes.textColor, attributes.customTextColor, '--grx--color--menu--text'),
            ...getColorCSSVar(attributes.backgroundColor, attributes.customBackgroundColor, '--grx--color--menu--background'),
            ...getColorCSSVar(attributes.linkColor, attributes.customLinkColor, '--grx--color--menu--link'),
            ...getColorCSSVar(attributes.hoverLinkColor, attributes.customHoverLinkColor, '--grx--color--menu--hover--link'),
            ...getColorCSSVar(attributes.submenuTextColor, attributes.customSubmenuTextColor, '--grx--color--submenu--text'),
            ...getColorCSSVar(attributes.submenuBackgroundColor, attributes.customSubmenuBackgroundColor, '--grx--color--submenu--background'),
            ...getColorCSSVar(attributes.submenuLinkColor, attributes.customSubmenuLinkColor, '--grx--color--submenu--link'),
            ...getColorCSSVar(attributes.submenuHoverLinkColor, attributes.customSubmenuHoverLinkColor, '--grx--color--submenu--hover--link'),
            ...(minHeight ? { '--gwx--min-nav-size': minHeight } : {}),
        }
	});
	
	const blockCounts = useSelect((select) => {
		const { getBlockOrder, getBlockName } = select(blockEditorStore);
		const childIds = getBlockOrder(clientId);

		const counts = {};

		childIds.forEach((id) => {
			const name = getBlockName(id);
			if (!name) return;
			counts[name] = (counts[name] || 0) + 1;
		});

		return counts;
	}, [clientId]);

	const allowedBlocks = ALLOWED_BLOCKS.filter(
		(blockName) => !blockCounts[blockName] || blockCounts[blockName] < 1
	);

	useEffect(() => {
		const { getBlockOrder, getBlockName } = wp.data.select('core/block-editor');
		const { removeBlock } = wp.data.dispatch('core/block-editor');

		const childIds = getBlockOrder(clientId);
		const seen = new Set();

		childIds.forEach((id) => {
			const name = getBlockName(id);
			if (!ALLOWED_BLOCKS.includes(name)) return;

			if (seen.has(name)) {
				removeBlock(id);
			} else {
				seen.add(name);
			}
		});
	}, [clientId, blockCounts]);


	const innerBlocksProps = useInnerBlocksProps({
		className: [
			'gwx-navigation__modal',
		]
	},{
		allowedBlocks,
		defaultBlock: DEFAULT_BLOCK,
		template: TEMPLATE,
		directInsert: false,
		templateInsertUpdatesSelection: true,
		templateLock,
		__unstableDisableLayoutClassNames: true,
		renderAppender: false
	});
	
	function getEditorLayoutClasses(attributes, shouldSwitchLayout, shouldOpenModal ) {
		const {
			type,
			toType,
			toggleBehavior,
			position,
		} = attributes;

		const isModal = toggleBehavior === true || toggleBehavior === 'responsive';
		const isSlideIn = template === 'slide-in';

		const templateMap = {
			modal: 'modal',
			'modal-dropdown': 'modal',
			'slide-in': 'slide-in',
		};

		const layout = templateMap[template] || 'menu';
		
		return clsx(
			`is-template--${template}`,
			position && `is-position-${position}`,

			!isSlideIn && isModal && !shouldSwitchLayout && `has-${layout}`,
			!isSlideIn && isModal && !shouldSwitchLayout && shouldOpenModal && `has-${layout}-open`,
			!isSlideIn && isModal && !shouldSwitchLayout && !shouldOpenModal && `has-${layout}-close`,
			
			isSlideIn && isModal && !shouldSwitchLayout && 'has-modal-dropdown',
			isSlideIn && isModal && !shouldSwitchLayout && shouldOpenModal && 'has-modal-dropdown-open',
			isSlideIn && isModal && !shouldSwitchLayout && !shouldOpenModal && 'has-modal-dropdown-close',

			isSlideIn && isModal && shouldSwitchLayout && 'has-slide-in',
			isSlideIn && isModal && shouldSwitchLayout && shouldOpenModal && 'has-slide-in-open',
			isSlideIn && isModal && shouldSwitchLayout && !shouldOpenModal && 'has-slide-in-close'
		);
	}
	
	const menuContent = {
        className: 'gwx-navigation__content'
    };

	const menuTrigger = {
		className: 'gwx-navigation__menutrigger'
	};

	const { selectBlock, clearSelectedBlock } = useDispatch(blockEditorStore);

	const navMenuBlockId = useSelect(
		(select) => {
			const { getBlockOrder, getBlockName } = select('core/block-editor');
			const childIds = getBlockOrder(clientId);
			return childIds.find((id) => getBlockName(id) === 'groundworx/navigation-menu');
		},
		[clientId]
	);

	useEffect(() => {
	if (navRef.current) {
		measureNavBoundsForEditor(navRef.current);
	}
}, []);

const isNavMenuOpen = useSelect(
	select => {
		const { getSelectedBlockClientId, hasSelectedInnerBlock } =
			select( 'core/block-editor' );
		const selected = getSelectedBlockClientId();
		return (
			navMenuBlockId &&
			( selected === navMenuBlockId ||
			  hasSelectedInnerBlock( navMenuBlockId, true ) )
		);
	},
	[ navMenuBlockId ]
);

	return (
		<>
			<div {...blockProps}>
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon={plus}
							label="Add Branding"
							onClick={() => insertBlock('groundworx/navigation-branding', clientId)}
							disabled={blockCounts['groundworx/navigation-branding'] >= 1}
						>
							Add Branding
						</ToolbarButton>
						<ToolbarButton
							icon={plus}
							label="Add Menu"
							onClick={() => insertBlock('groundworx/navigation-menu', clientId)}
							disabled={blockCounts['groundworx/navigation-menu'] >= 1}
						>
							Add Menu
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			
				<InspectorControls group="color">
					<ColorTools
						label="Menu"
						textColor={ textColor }
						setTextColor={ setTextColor }
						linkColor={ linkColor }
						setLinkColor={ setLinkColor }
						hoverLinkColor={ hoverLinkColor }
						setHoverLinkColor={ setHoverLinkColor }
						backgroundColor={ backgroundColor }
						setBackgroundColor={ setBackgroundColor }
						clientId={ clientId }
						navRef={ navRef }
					/>
					{ toType === 'horizontal-menu' && (
					<ColorTools
						label= "Submenu"
						textColor={ submenuTextColor }
						setTextColor={ setSubmenuTextColor }
						linkColor={ submenuLinkColor }
						setLinkColor={ setSubmenuLinkColor }
						hoverLinkColor={ submenuHoverLinkColor }
						setHoverLinkColor={ setSubmenuHoverLinkColor }
						backgroundColor={ submenuBackgroundColor }
						setBackgroundColor={ setSubmenuBackgroundColor }
						elements='[data-type="core/navigation-submenu"] [data-type="core/navigation-link"]'
						clientId={ clientId }
						navRef={ navRef }
					/>
					)}

				</InspectorControls>
				<MenuInspectorControls
					clientId={clientId}
					menuId={ref}
					setMenuId={handleUpdateMenu}
					menus={menus}
					name={name}
					isLoading={isMenuLoading}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
				
				<nav className="gwx-navigation__wrapper">
					<div {...menuContent}>
						<div className="gwx-navigation__menuback"></div>
						
						<div {...innerBlocksProps} />
						
						<div {...menuTrigger}>
							<div 
							className={ clsx(
									'gwx-menu-toggle',
									{ 'is-open': isNavMenuOpen }
								) }
							>
								<button className="gwx-toggle gwx-toggle--open" 
									type="button" 
									aria-label={ __( 'Open menu', 'groundworx-navigation' ) }
									onClick={() => {
										if (navMenuBlockId) {
												selectBlock(navMenuBlockId);
										}
									}}
									aria-pressed={isSelected}
								> 
									<svg className="gwx-toggle__bread" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
										<rect className="gwx-toggle__bread-top" x="4" y="7.5" width="16" height="1.5" />
										<rect className="gwx-toggle__bread-middle" x="4" y="11.25" width="16" height="1.5" />
										<rect className="gwx-toggle__bread-bottom" x="4" y="15" width="16" height="1.5" />
									</svg>
								</button>

								<button className="gwx-toggle gwx-toggle--close" 
									type="button" 
									aria-label={ __( 'Close menu', 'groundworx-navigation' ) }
									onClick={() => clearSelectedBlock() }
									aria-pressed={isSelected}
								> 
									<svg className="gwx-toggle__bread" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
										<rect className="gwx-toggle__bread-top" x="4" y="7.5" width="16" height="1.5" />
										<rect className="gwx-toggle__bread-middle" x="4" y="11.25" width="16" height="1.5" />
										<rect className="gwx-toggle__bread-bottom" x="4" y="15" width="16" height="1.5" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</nav>
			</div>
			<div className="gwx-navigation__curtain"></div>
			{ (position === 'sticky' || position === 'scroll-up-reveal') && (
				<div className="gwx-navigation__placeholder"></div>
			) }
		</>
	);
}

export default withColors(
	{ textColor: 'color' },
	{ backgroundColor: 'backgroundColor' },
	{ linkColor: 'color' },
	{ hoverLinkColor: 'color' },
	{ submenuTextColor: 'color' },
	{ submenuBackgroundColor: 'backgroundColor' },
	{ submenuLinkColor: 'color' },
	{ submenuHoverLinkColor: 'color' }
)( Edit );

import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl, ToggleControl, Button, TextControl, __experimentalHStack as HStack, __experimentalVStack as VStack, __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption, __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon } from '@wordpress/components';
import { InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

import { useEntityProp } from '@wordpress/core-data';

import ManageMenusButton from './../../navigation-menu/edit/manage-menus-button';
import useNavigationMenu from './../../navigation-menu/use-navigation-menu';

import { getLayoutConfig, layoutTemplates } from './../constants.js';
import { getEditorCanvasWidth } from './../utils.js';

import { getBreakpoints } from '@groundworx/utils';
import { WidthControl } from '@groundworx/components';
import { tablet, desktop, largeDesktop, laptop } from '@groundworx/icons';


export function getAllowedLayouts(isHeader = false) {
	return layoutTemplates.filter(({ positionOptions }) => {
		if (isHeader) return true;
		return positionOptions?.some(({ value }) =>
			['relative', 'sticky'].includes(value)
		);
	});
}

const useIsHeaderContext = (clientId, targetSlug = 'header') => {
	const [slug] = useEntityProp('postType', 'wp_template_part', 'slug');
	const isDirect = slug === targetSlug;

	const isNested = useSelect((select) => {
		if (!clientId) return false;

		const { getBlock, getBlockParents } = select(blockEditorStore);
		const parents = getBlockParents(clientId);

		return parents.some((parentId) => {
			const parent = getBlock(parentId);
			return parent?.name === 'core/template-part' && parent?.attributes?.slug === targetSlug;
		});
	}, [clientId, targetSlug]);

	return isDirect || isNested;
};

const MenuInspectorControls = ({ clientId, menuId, setMenuId, attributes, setAttributes }) => {
	
    const isHeader = useIsHeaderContext(clientId);

    const { openSubmenusOnHover, showLogo, position, toggleBehavior, showSubmenuIcon, minHeight, switchAt, template, type, toType } = attributes;
    let { behaviorOptions, positionOptions, allowedTypes, allowedToTypes } = getLayoutConfig(template);

    if (!isHeader) {
        positionOptions = positionOptions.filter(({ value }) =>
            ['relative', 'sticky'].includes(value)
        );
    }
    
    if (isHeader) {
        positionOptions = positionOptions.filter(({ value }) =>
            ['relative', 'fixed', 'scroll-up-reveal'].includes(value)
        );
    }

    const [shouldSwitchLayout, setShouldSwitchLayout] = useState(false);

    const [isRenamingMenu, setIsRenamingMenu] = useState(false);
    const [renameMenuName, setRenameMenuName] = useState('');

    const menus = useSelect((select) => {
        return (
            select('core').getEntityRecords('postType', 'gwx_menu', {
                per_page: -1,
                status: 'publish',
            }) || []
        );
    }, []);

    const { saveEntityRecord, deleteEntityRecord } = useDispatch('core');

    useEffect(() => {
        if (!toType || !switchAt) {
            setShouldSwitchLayout(false);
            return;
        }

        const updateLayoutSwitch = () => {
            const canvasWidth = getEditorCanvasWidth();
            const switchAtBreakpoint = getBreakpoints.resolve(attributes.switchAt);
            
            setShouldSwitchLayout(canvasWidth >= switchAtBreakpoint);
        };

        updateLayoutSwitch();

        const resizeObserver = new ResizeObserver(updateLayoutSwitch);
        const iframe = document.querySelector('iframe[name="editor-canvas"]');
        if (iframe?.contentDocument?.body) {
            resizeObserver.observe(iframe.contentDocument.body);
        }

        return () => resizeObserver.disconnect();
    }, [toType, switchAt]);

    
    useEffect(() => {
        const config = getLayoutConfig(template);

        const resolvedToggleBehavior = getValidOrDefault(toggleBehavior, config.behaviorOptions, false);
        const resolvedPosition = getValidOrDefault(position, config.positionOptions, 'relative');

        const next = {
            toggleBehavior: resolvedToggleBehavior,
            position: resolvedPosition,
            type: resolvedToggleBehavior === false
                ? 'horizontal-menu'
                : getValidOrDefault(type, config.allowedTypes, ''),
        };

        if ( resolvedToggleBehavior === 'responsive' ) {
            // pick first allowed breakpoint or fall back to 'tablet'
            const switchAtDefault =
                getValidOrDefault(
                    switchAt,
                    [
                        { value: 'tablet' },
                        { value: 'laptop' },
                        { value: 'desktop' },
                        { value: 'large-desktop' },
                    ],
                    'tablet'
                );

            next.switchAt = switchAtDefault;

            // keep your existing toType logic, but base it on *resolved* value
            next.toType =
                config.allowedToTypes?.length
                    ? getValidOrDefault(
                            toType,
                            config.allowedToTypes,
                            config.allowedToTypes[ 0 ].value
                    )
                    : next.type;
        } else {
            next.switchAt = ''; // or delete it if you prefer
            next.toType   = '';
        }

        const changed = Object.entries(next).some(
            ([key, val]) => attributes[key] !== val
        );

        if (changed) {
            setAttributes(next);
        }
    }, [template, toggleBehavior, position, type, toType]);


	function getValidOrDefault(current, options, fallback = '') {
		if (options.find(opt => opt.value === current)) return current;
		return options.find(opt => opt.isDefault)?.value || options?.[0]?.value || fallback;
	}

    // Sync the rename field with the current menu name
    useEffect(() => {
        const currentMenu = menus.find((menu) => menu.id === menuId);
        if (currentMenu) {
            setRenameMenuName(currentMenu.title.rendered);
        } else {
            setRenameMenuName('');
        }
    }, [menuId, menus]);

    useEffect(() => {
        const allowedTemplates = getAllowedLayouts(isHeader);
        const validTemplate = allowedTemplates.find((tpl) => tpl.name === template);

        if (!validTemplate && allowedTemplates.length > 0) {
            setAttributes({ template: allowedTemplates[0].name });
        }
    }, [template, isHeader]);

    // Generate a new menu name
    const generateMenuName = () => {
        const existingNames = menus.map((menu) => menu.title.rendered);
        let counter = 1;
        let newName = `Navigation ${counter}`;

        while (existingNames.includes(newName)) {
            counter++;
            newName = `Navigation ${counter}`;
        }

        return newName;
    };

    
    // Handle menu selection
    const handleMenuSelection = (selectedMenuId) => {
        setMenuId(parseInt(selectedMenuId) || null);
    };

    // Create a new menu
    const handleCreateMenu = async () => {
        const newMenuName = generateMenuName();

        const newMenu = await saveEntityRecord('postType', 'gwx_menu', {
            title: newMenuName,
            content: '', // Empty content initially
            status: 'publish',
        });

        if (newMenu && newMenu.id) {
            setMenuId(newMenu.id);
            setRenameMenuName(newMenuName);
        }
    };

    // Rename an existing menu
    const handleRenameMenu = async () => {
        if (!menuId || !renameMenuName.trim()) {
            return alert(__('Please select a menu and enter a new name.', 'groundworx-navigation'));
        }

        setIsRenamingMenu(true);

        const menuToRename = menus.find((menu) => menu.id === menuId);
        if (menuToRename) {
            await saveEntityRecord('postType', 'gwx_menu', {
                id: menuId,
                title: renameMenuName.trim(),
            });
        }

        setIsRenamingMenu(false);
    };

    // Delete a menu
    const handleDeleteMenu = async () => {
        if (!menuId) {
            return alert(__('Please select a menu to delete.', 'groundworx-navigation'));
        }

        const confirmDelete = confirm(__('Are you sure you want to delete this menu?', 'groundworx-navigation'));
        if (!confirmDelete) return;

        await deleteEntityRecord('postType', 'gwx_menu', menuId);
        setMenuId(null); // Clear selection after deletion
        setRenameMenuName(''); // Clear the rename input
    };

    const {
        hasResolvedNavigationMenus,
        canUserUpdateNavigationMenu,
        canUserCreateNavigationMenus,
    } = useNavigationMenu(menuId);

    const hasManagePermissions =
        canUserCreateNavigationMenus || canUserUpdateNavigationMenu;

    const isManageMenusButtonDisabled =
        !hasManagePermissions || !hasResolvedNavigationMenus;


    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Layout Settings', 'groundworx-navigation')} initialOpen={true}>
                    <SelectControl
                        label={__('Navigation Layout', 'groundworx-navigation' )}
                        value={template}
                        options={getAllowedLayouts(isHeader).map(({ label, name }) => ({
                            label,
                            value: name,
                        }))}
                        onChange={(value) => setAttributes({ template: value })}
                    />
                    
                    {behaviorOptions.length > 0 && (
                        <ToggleGroupControl
                            label={__('Toggle Behavior', 'groundworx-navigation')}
                            value={toggleBehavior}
                            onChange={(val) => setAttributes({ toggleBehavior: val })}
                            isBlock
                        >
                            {behaviorOptions.map(({ label, value }) => (
                                <ToggleGroupControlOption key={value} value={value} label={label} />
                            ))}
                        </ToggleGroupControl>
                    )}

                    {toggleBehavior === 'responsive' && (
                        <ToggleGroupControl
                            label={__('Toggle up to', 'groundworx-navigation')}
                            value={switchAt}
                            onChange={(val) => setAttributes({ switchAt: val })}
                            isBlock
                        >
                            <ToggleGroupControlOptionIcon value='tablet' label='Tablet' icon={tablet} />
                            <ToggleGroupControlOptionIcon value='laptop' label='Laptop' icon={laptop} />
                            <ToggleGroupControlOptionIcon value='desktop' label='Desktop' icon={desktop} />
                            <ToggleGroupControlOptionIcon value='large-desktop' label='Large Desktop' icon={largeDesktop} />                           
                        </ToggleGroupControl>
                    )}
                    
                    {toggleBehavior !== false && (
                        <SelectControl
                            label={__('Display menu as', 'groundworx-navigation')}
                            value={type}
                            onChange={(val) => setAttributes({ type: val })}
                            options={allowedTypes}
                        />
                    )}

                    {positionOptions.length > 0 && (
                        <SelectControl
                            label={__('Position', 'groundworx-navigation')}
                            value={position}
                            onChange={(val) => setAttributes({ position: val })}
                            options={positionOptions}
                        />
                    )}
                    
                    {toType === 'horizontal-menu' && (
                        <ToggleControl
                            label={__('Open submenus on hover', 'groundworx-navigation')}
                            help={__('If disabled, submenus will open on click instead.', 'groundworx-navigation')}
                            checked={!!openSubmenusOnHover}
                            onChange={(val) => setAttributes({ openSubmenusOnHover: val })}
                        />
                    )}
                   
                    <ToggleControl
                        label={__('Show submenu icon', 'groundworx-navigation')}
                        help={__('If disabled, submenus will appear without icon and link will be disabled.', 'groundworx-navigation')}
                        checked={!!showSubmenuIcon}
                        onChange={(val) => setAttributes({ showSubmenuIcon: val })}
                    />
                    
                    <WidthControl
						label={__('Minimum Size', 'groundworx-navigation')}
						value={minHeight}
						onChange={(val) => setAttributes({ minHeight: val })}
					/>

                </PanelBody>
                <PanelBody title="Menu Settings" initialOpen>
                    <SelectControl
                        label={__('Select Menu', 'groundworx-navigation')}
                        value={menuId || ''}
                        options={[
                            { label: __('Select a menu', 'groundworx-navigation'), value: '' },
                            ...menus.map((menu) => ({
                                label: menu.title.rendered,
                                value: menu.id,
                            })),
                        ]}
                        onChange={handleMenuSelection}
                    />

                    <Button
                        isPrimary
                        onClick={handleCreateMenu}
                    >
                        {__('Create New Menu', 'groundworx-navigation')}
                    </Button>
                </PanelBody>
            </InspectorControls>
            <InspectorControls group="advanced">
                <VStack spacing={4}>
                    <VStack spacing={0}>
                        <TextControl
                            __nextHasNoMarginBottom
                            label={__('Menu Name', 'groundworx-navigation')}
                            value={renameMenuName}
                            onChange={setRenameMenuName}
                            placeholder={__('Enter new menu name', 'groundworx-navigation')}
                            disabled={!menuId}
                        />
                        <HStack spacing={2}>
                            <Button
                                isSecondary
                                onClick={handleRenameMenu}
                                disabled={isRenamingMenu || !menuId}
                            >
                                {isRenamingMenu
                                    ? __('Renaming...', 'groundworx-navigation')
                                    : __('Rename Menu', 'groundworx-navigation')}
                            </Button>

                            <Button
                                isDestructive
                                onClick={handleDeleteMenu}
                                disabled={!menuId}
                            >
                                {__('Delete Menu', 'groundworx-navigation')}
                            </Button>
                        </HStack>
                    </VStack>
                    <ManageMenusButton
                        disabled={isManageMenusButtonDisabled}
                        className="gwx-menu-manage-menus-button"
                    />
                </VStack>
            </InspectorControls>
        </>
    );
};

export default MenuInspectorControls;

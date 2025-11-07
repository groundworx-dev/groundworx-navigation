import clsx from 'clsx';
import { __ } from '@wordpress/i18n';

import { useEffect, useState, useCallback } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { EntityProvider } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { PanelBody, SelectControl, Button, TextControl, RangeControl, ToggleControl, __experimentalHStack as HStack, __experimentalVStack as VStack } from '@wordpress/components';

import ManageMenusButton from './manage-menus-button';
import useNavigationMenu from './../use-navigation-menu';
import NavigationInnerBlocks from './navigation-inner-blocks';
import { getTemplateConfig } from './../constants';

import { getBreakpoints } from '@groundworx/utils';
import { getEditorCanvasWidth, useResponsiveLayout, getEditorCanvasElement, getValidOrDefault } from './../../navigation/utils.js';

import { getLayoutConfig, layoutTemplates } from './../../navigation/constants.js';

import './../index.scss';

const Edit = (props) => {
    const {
        attributes,
        setAttributes,
        clientId,
        className,
        context,
        customPlaceholder: CustomPlaceholder = null,
        __unstableLayoutClassNames: layoutClassNames
    } = props;
    
    const { 
        ref,
        type,
        toType,
        showSubmenuIcon,
        openSubmenusOnHover,
        indentSubmenu,
        maxNestingLevel,
        flattenSubmenu,
        responsive,
	    templateLock
    } = attributes;

    const { switchAt, template, toggleBehavior } = { ...attributes, ...context };

    let { allowedTypes } = getLayoutConfig(template);
    
    const shouldSwitchLayout = useResponsiveLayout(toggleBehavior, switchAt);

    const layoutType = shouldSwitchLayout ? toType : type;
    const config = getTemplateConfig(layoutType);
    
    const { orientation = 'horizontal' } = config;

    const typeConfig = getTemplateConfig(type);
    const toTypeConfig = getTemplateConfig(toType);

    const setMenuId = useCallback(
            (newRef) => {
                setAttributes({ ref: newRef });
            },
            [setAttributes]
        );

    useEffect(() => {
       
        setAttributes({
            responsiveLayout: {
                typeConfig,
                toTypeConfig,
            }
        });
    }, [typeConfig, toTypeConfig, switchAt]);

    function getEditorLayoutClasses(layoutType ) {
        return clsx(
            `layout-type--${layoutType}`,
        );
    }

    const blockProps = useBlockProps({
        className: clsx(
            className,
            getEditorLayoutClasses(layoutType),
            {
                'is-responsive': responsive,
                'is-flatten': flattenSubmenu,
                'is-indent': indentSubmenu,
                'is-vertical': orientation === 'vertical'
            },
            layoutClassNames
        )
    });

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

    // Sync the rename field with the current menu name
    useEffect(() => {
        const currentMenu = menus.find((menu) => menu.id === ref);
        if (currentMenu) {
            setRenameMenuName(currentMenu.title.rendered);
        } else {
            setRenameMenuName('');
        }
    }, [ref, menus]);

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
        if (!ref || !renameMenuName.trim()) {
            return alert(__('Please select a menu and enter a new name.', 'groundworx-navigation'));
        }

        setIsRenamingMenu(true);

        const menuToRename = menus.find((menu) => menu.id === ref);
        if (menuToRename) {
            await saveEntityRecord('postType', 'gwx_menu', {
                id: ref,
                title: renameMenuName.trim(),
            });
        }

        setIsRenamingMenu(false);
    };

    // Delete a menu
    const handleDeleteMenu = async () => {
        if (!ref) {
            return alert(__('Please select a menu to delete.', 'groundworx-navigation'));
        }

        const confirmDelete = confirm(__('Are you sure you want to delete this menu?', 'groundworx-navigation'));
        if (!confirmDelete) return;

        await deleteEntityRecord('postType', 'gwx_menu', ref);
        setMenuId(null); // Clear selection after deletion
        setRenameMenuName(''); // Clear the rename input
    };

    const {
            hasResolvedNavigationMenus,
            canUserUpdateNavigationMenu,
            canUserCreateNavigationMenus,
        } = useNavigationMenu(ref);
    
    const hasManagePermissions =
        canUserCreateNavigationMenus || canUserUpdateNavigationMenu;
        
    const isManageMenusButtonDisabled =
        !hasManagePermissions || !hasResolvedNavigationMenus;

    useEffect(() => {
        // Only react to template changes to avoid race conditions with parent's toggleBehavior updates
        const config = getLayoutConfig(template);
        
        // Exit early if we're in a non-responsive mode (handled by initial attributes)
        if (toggleBehavior !== 'responsive') {
            return;
        }

        const next = {};

        // Set type for before-toggle state
        if (config.allowedTypes && config.allowedTypes.length > 0) {
            const defaultType = config.allowedTypes.find(t => t.isDefault)?.value || config.allowedTypes[0].value;
            next.type = getValidOrDefault(type, config.allowedTypes, defaultType);
        }

        // Set toType for after-toggle state
        if (config.allowedToTypes?.length) {
            const defaultToType = config.allowedToTypes.find(t => t.isDefault)?.value || config.allowedToTypes[0].value;
            next.toType = getValidOrDefault(toType, config.allowedToTypes, defaultToType);
        }

        const changed = Object.entries(next).some(
            ([key, val]) => attributes[key] !== val
        );

        if (changed) {
            setAttributes(next);
        }
    }, [template]);

    
    return (
        <div {...blockProps}>
            <InspectorControls>

                <PanelBody title="Layout Settings" initialOpen>
                     {toggleBehavior !== false && (
                        <SelectControl
                            label={__('Display menu before toggle as', 'groundworx-navigation')}
                            value={type}
                            onChange={(val) => setAttributes({ type: val })}
                            options={allowedTypes}
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

                    <RangeControl
                        label={__('Max Visible Nesting Level', 'groundworx-navigation')}
                        help={__('Limits submenu depth. All levels remain visible in the editor.', 'groundworx-navigation')}
                        value={maxNestingLevel}
                        onChange={(val) => setAttributes({ maxNestingLevel: val })}
                        min={1}
                        max={5}
                        step={1}
                    />
                    { maxNestingLevel > 1 && (
                        <>
                            <ToggleControl
                                label={__('Indent Submenu', 'groundworx-navigation')}
                                checked={!!indentSubmenu}
                                onChange={(val) => setAttributes({ indentSubmenu: val })}
                            />

                            <ToggleControl
                                label={__('Flatten Submenu', 'groundworx-navigation')}
                                help={__('Display all items at the same level.', 'groundworx-navigation')}
                                checked={!!flattenSubmenu}
                                onChange={(val) => setAttributes({ flattenSubmenu: val })}
                            />
                        </>
                    )}
                </PanelBody>

                <PanelBody title="Menu Settings" initialOpen>
                    <SelectControl
                        label={__('Select Menu', 'groundworx-navigation')}
                        value={ref || ''}
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
                        {__('Create a New Menu', 'groundworx-navigation')}
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
                            disabled={!ref}
                        />
                        <HStack spacing={2}>
                            <Button
                                isSecondary
                                onClick={handleRenameMenu}
                                disabled={isRenamingMenu || !ref}
                            >
                                {isRenamingMenu
                                    ? __('Renaming...', 'groundworx-navigation')
                                    : __('Rename Menu', 'groundworx-navigation')}
                            </Button>

                            <Button
                                isDestructive
                                onClick={handleDeleteMenu}
                                disabled={!ref}
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
            { ref ? (
                    <EntityProvider kind="postType" type="gwx_menu" id={ref}>
                        <NavigationInnerBlocks
                            clientId={clientId}
                            hasCustomPlaceholder={!!CustomPlaceholder}
                            templateLock={templateLock}
                            orientation={orientation}
                        />
                    </EntityProvider>
            ) : (
                    <p>Select a menu.</p>
            )}
            
        </div>
    );
};

export default Edit;
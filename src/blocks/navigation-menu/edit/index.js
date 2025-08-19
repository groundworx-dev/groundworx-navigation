import clsx from 'clsx';
import { __ } from '@wordpress/i18n';

import { useEffect, useState, useCallback } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { EntityProvider } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { PanelBody, SelectControl, Button, TextControl, ToggleControl, __experimentalHStack as HStack, __experimentalVStack as VStack } from '@wordpress/components';

import ManageMenusButton from './manage-menus-button';
import useNavigationMenu from './../use-navigation-menu';
import NavigationInnerBlocks from './navigation-inner-blocks';
import { getTemplateConfig } from './../constants';

import { getBreakpoints } from '@groundworx/utils';
import { getEditorCanvasWidth, getEditorCanvasElement, getValidOrDefault } from './../../navigation/utils.js';

import { getLayoutConfig, layoutTemplates } from './../../navigation/constants.js';

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
        responsive,
	    templateLock
    } = attributes;

    const { switchAt, template, toggleBehavior } = { ...attributes, ...context };

    let { allowedTypes } = getLayoutConfig(template);
    
    const [shouldSwitchLayout, setShouldSwitchLayout] = useState(false);

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

    useEffect(() => {
        if (!toType || !switchAt) {
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
    }, [toType, switchAt]);

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
        if (toggleBehavior === true) {
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
        const target = getEditorCanvasElement();

        if (target) {
            resizeObserver.observe(target);
        }

        return () => resizeObserver.disconnect();
    }, [toType, switchAt]);

    useEffect(() => {
        const config = getLayoutConfig(template);

        const resolvedToggleBehavior = getValidOrDefault(toggleBehavior, config.behaviorOptions, false);

        const next = {
            toggleBehavior: resolvedToggleBehavior,
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
            next.toType   = '';
        }

        const changed = Object.entries(next).some(
            ([key, val]) => attributes[key] !== val
        );

        if (changed) {
            setAttributes(next);
        }
    }, [template, toggleBehavior, type, toType]);

    
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
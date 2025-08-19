import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl, ToggleControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption, __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon } from '@wordpress/components';
import { InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import { useEntityProp } from '@wordpress/core-data';

import { getLayoutConfig, layoutTemplates } from './../constants.js';
import { getEditorCanvasWidth, getEditorCanvasElement, getValidOrDefault } from './../utils.js';

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

const MenuInspectorControls = ({ clientId, attributes, setAttributes }) => {
	
    const isHeader = useIsHeaderContext(clientId);

    const { showLogo, position, toggleBehavior, minHeight, switchAt, template } = attributes;
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
    }, [switchAt]);

    
    useEffect(() => {
        const config = getLayoutConfig(template);

        const resolvedToggleBehavior = getValidOrDefault(toggleBehavior, config.behaviorOptions, false);
        const resolvedPosition = getValidOrDefault(position, config.positionOptions, 'relative');

        const next = {
            toggleBehavior: resolvedToggleBehavior,
            position: resolvedPosition
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
        } else {
            next.switchAt = ''; // or delete it if you prefer
        }

        const changed = Object.entries(next).some(
            ([key, val]) => attributes[key] !== val
        );

        if (changed) {
            setAttributes(next);
        }
    }, [template, toggleBehavior, position]);

    useEffect(() => {
        const allowedTemplates = getAllowedLayouts(isHeader);
        const validTemplate = allowedTemplates.find((tpl) => tpl.name === template);

        if (!validTemplate && allowedTemplates.length > 0) {
            setAttributes({ template: allowedTemplates[0].name });
        }
    }, [template, isHeader]);


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
                    
                    {positionOptions.length > 0 && (
                        <SelectControl
                            label={__('Position', 'groundworx-navigation')}
                            value={position}
                            onChange={(val) => setAttributes({ position: val })}
                            options={positionOptions}
                        />
                    )}
                    
                    <WidthControl
						label={__('Minimum Size', 'groundworx-navigation')}
						value={minHeight}
						onChange={(val) => setAttributes({ minHeight: val })}
					/>

                </PanelBody>
            </InspectorControls>
           
        </>
    );
};

export default MenuInspectorControls;

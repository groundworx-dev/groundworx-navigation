import clsx from 'clsx';
import { __ } from '@wordpress/i18n';

import { useEffect, useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { EntityProvider } from '@wordpress/core-data';

import { getBreakpoints } from '@groundworx/utils';

import NavigationInnerBlocks from './navigation-inner-blocks';

import { getTemplateConfig } from './../constants';

function getEditorCanvasWidth() {
	const iframe = document.querySelector('iframe[name="editor-canvas"]');
	return iframe?.contentDocument?.body?.getBoundingClientRect().width || window.innerWidth;
}

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
        responsive,
	    templateLock,
    } = attributes;

    const { ref, type, switchAt } = { ...attributes, ...context };
    const toType = context.toType ? context.toType : context.type;

    const [shouldSwitchLayout, setShouldSwitchLayout] = useState(false);

    const layoutType = shouldSwitchLayout ? toType : type;
    const config = getTemplateConfig(layoutType);
    
    const { orientation = 'horizontal' } = config;

    const typeConfig = getTemplateConfig(type);
    const toTypeConfig = getTemplateConfig(toType);

    useEffect(() => {
       
        setAttributes({
            responsiveLayout: {
                typeConfig,
                toTypeConfig,
                switchAt,
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

    return (
        <div {...blockProps}>
            
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
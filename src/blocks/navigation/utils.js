import { useState, useEffect } from '@wordpress/element';
import { getBreakpoints } from '@groundworx/utils';

export function useResponsiveLayout(toggleBehavior, switchAt) {
    const [shouldSwitchLayout, setShouldSwitchLayout] = useState(false);

    useEffect(() => {
        // If toggleBehavior is always visible (true), no switching needed
        if (toggleBehavior === true) {
            setShouldSwitchLayout(false);
            return;
        }

        // If no switchAt value, can't determine when to switch
        if (!switchAt) {
            setShouldSwitchLayout(false);
            return;
        }

        const updateLayoutSwitch = () => {
            const canvasWidth = getEditorCanvasWidth();
            const resolved = getBreakpoints.resolve(switchAt);
            setShouldSwitchLayout(canvasWidth >= resolved);
        };

        // Initial check
        updateLayoutSwitch();

        // Watch for canvas resizes
        const resizeObserver = new ResizeObserver(updateLayoutSwitch);
        const target = getEditorCanvasElement();

        if (target) {
            resizeObserver.observe(target);
        }

        // Cleanup
        return () => resizeObserver.disconnect();
    }, [switchAt, toggleBehavior]);

    return shouldSwitchLayout;
}

export function getEditorCanvasWidth() {
	const el = getEditorCanvasElement();
	return el?.getBoundingClientRect?.().width || window.innerWidth;
}

export function getEditorCanvasHeight() {
	const el = getEditorCanvasElement();
	return el?.getBoundingClientRect?.().height || window.innerHeight;
}

export function getEditorCanvasElement() {
	const iframe = document.querySelector('iframe[name="editor-canvas"]');
	if (iframe?.contentDocument?.body) return iframe.contentDocument.body;

	return document.querySelector('.editor-styles-wrapper');
}

export function getElementWidth(element) {
	if (element && typeof element.getBoundingClientRect === 'function') {
		return element.getBoundingClientRect().width;
	}
	return window.innerWidth;
}


export function getColorCSSVar(attribute, customAttribute, varName) {
	if (attribute && !customAttribute) {
		return { [varName]: `var(--wp--preset--color--${attribute})` };
	}
	if (!attribute && customAttribute) {
		return { [varName]: customAttribute };
	}
	return {};
}

export function getValidOrDefault(current, options, fallback = '') {
	if (options.find(opt => opt.value === current)) return current;
	return options.find(opt => opt.isDefault)?.value || options?.[0]?.value || fallback;
}
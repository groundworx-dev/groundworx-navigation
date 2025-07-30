export function getEditorCanvasWidth() {
	const el = getEditorCanvasElement();
	return el?.getBoundingClientRect?.().width || window.innerWidth;
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

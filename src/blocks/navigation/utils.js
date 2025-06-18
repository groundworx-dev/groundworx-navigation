export function getEditorCanvasWidth() {
	const iframe = document.querySelector('iframe[name="editor-canvas"]');
	return iframe?.contentDocument?.body?.getBoundingClientRect().width || window.innerWidth;
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

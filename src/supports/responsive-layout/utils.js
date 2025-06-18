export function getResponsiveLayoutStyle({ responsiveSize = {} }) {
	const { mode = 'fit', value = '', unit = 'px' } = responsiveSize;

	if (mode === 'grow') {
		return { flexGrow: 1 };
	}

	if (mode === 'fixed' && value) {
		return { flexBasis: `${value}${unit}` };
	}

	// fit or fallback
	return {};
}
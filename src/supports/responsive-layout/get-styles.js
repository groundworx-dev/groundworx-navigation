export default function getStyles({ responsiveSize = {}, clientId }) {
	const { mode = 'fit', value = '' } = responsiveSize;

	const rules = [];

	if (mode === 'grow') {
		rules.push('flex-grow: 1;');
	}

	if (mode === 'fixed' && value) {
		rules.push(`flex-basis: ${value};`);
	}

	if (!rules.length) return null;

	return (
		<style>
			{`
				#block-${clientId} {
					${rules.join('\n')}
				}
			`}
		</style>
	);
}

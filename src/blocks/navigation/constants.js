export const layoutTemplates = [
	{
		name: 'modal',
		label: 'Modal',
		positionOptions: [
			{ label: 'Fixed', value: 'fixed', isDefault: true },
			{ label: 'Scroll Up Reveal', value: 'scroll-up-reveal' }
		],
		behaviorOptions: [
			{ label: 'Responsive', value: 'responsive', isDefault: true },
			{ label: 'Always', value: true },
		],
		allowedTypes: [
			{ label: 'Accordion', value: 'accordion', isDefault: true },
			{ label: 'Vertical Menu', value: 'vertical-menu' },
			{ label: 'Stacked Menu', value: 'stacked-menu' },
			{ label: 'List', value: 'list' },
		],
		allowedToTypes: [
			{ label: 'Horizontal Menu', value: 'horizontal-menu', isDefault: true },
		],
	},
	{
		name: 'modal-dropdown',
		label: 'Modal Dropdown',
		positionOptions: [
			{ label: 'Relative', value: 'relative', isDefault: true },
			{ label: 'Sticky', value: 'sticky' },
			{ label: 'Fixed', value: 'fixed', isDefault: true },
			{ label: 'Scroll Up Reveal', value: 'scroll-up-reveal' }
		],
		behaviorOptions: [
			{ label: 'Responsive', value: 'responsive', isDefault: true },
			{ label: 'Always', value: true },
		],
		allowedTypes: [
			{ label: 'Accordion', value: 'accordion', isDefault: true },
			{ label: 'Vertical Menu', value: 'vertical-menu' },
			{ label: 'Stacked Menu', value: 'stacked-menu' },
			{ label: 'List', value: 'list' },
		],
		allowedToTypes: [
			{ label: 'Horizontal Menu', value: 'horizontal-menu', isDefault: true },
		],
	},
	{
		name: 'slide-in',
		label: 'Slide In',
		positionOptions: [
			{ label: 'Fixed', value: 'fixed', isDefault: true }
		],
		behaviorOptions: [
			{ label: 'Responsive', value: 'responsive', isDefault: true }
		],
		allowedTypes: [
			{ label: 'Accordion', value: 'accordion', isDefault: true },
			{ label: 'Vertical Menu', value: 'vertical-menu' },
			{ label: 'Stacked Menu', value: 'stacked-menu' },
			{ label: 'List', value: 'list' },
		],
		allowedToTypes: [],
	},
	{
		name: 'classic',
		label: 'Classic',
		positionOptions: [
			{ label: 'Relative', value: 'relative', isDefault: true },
			{ label: 'Sticky', value: 'sticky' },
			{ label: 'Fixed', value: 'fixed', isDefault: true },
			{ label: 'Scroll Up Reveal', value: 'scroll-up-reveal' }
		],
		behaviorOptions: [
			{ label: 'Responsive', value: 'responsive' },
			{ label: 'Always', value: true },
		],
		allowedTypes: [
			{ label: 'Accordion', value: 'accordion', isDefault: true },
			{ label: 'Vertical Menu', value: 'vertical-menu' },
			{ label: 'Stacked Menu', value: 'stacked-menu' },
			{ label: 'List', value: 'list' },
		],
		allowedToTypes: [
			{ label: 'Horizontal Menu', value: 'horizontal-menu', isDefault: true },
		],
	}
];

export function getLayoutConfig(layoutName) {
	return layoutTemplates.find(tpl => tpl.name === layoutName)
		|| layoutTemplates.find(tpl => tpl.name === 'classic');
}

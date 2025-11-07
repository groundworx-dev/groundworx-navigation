import { __ } from '@wordpress/i18n';

export const layoutTemplates = [
	{
		name: 'modal',
		label: __('Modal', 'groundworx-navigation'),
		positionOptions: [
			{ label: __('Fixed', 'groundworx-navigation'), value: 'fixed', isDefault: true },
			{ label: __('Scroll Up Reveal', 'groundworx-navigation'), value: 'scroll-up-reveal' }
		],
		behaviorOptions: [
			{ label: __('Responsive', 'groundworx-navigation'), value: 'responsive', isDefault: true },
			{ label: __('Always', 'groundworx-navigation'), value: true },
		],
		allowedTypes: [
			{ label: __('Accordion', 'groundworx-navigation'), value: 'accordion', isDefault: true },
			{ label: __('Accordion Alt', 'groundworx-navigation'), value: 'accordion-alt' },
			{ label: __('Vertical Menu', 'groundworx-navigation'), value: 'vertical-menu' },
			{ label: __('List', 'groundworx-navigation'), value: 'list' },
		],
		allowedToTypes: [
			{ label: __('Horizontal Menu', 'groundworx-navigation'), value: 'horizontal-menu', isDefault: true },
		],
	},
	{
		name: 'modal-dropdown',
		label: __('Modal Dropdown', 'groundworx-navigation'),
		positionOptions: [
			{ label: __('Relative', 'groundworx-navigation'), value: 'relative', isDefault: true },
			{ label: __('Sticky', 'groundworx-navigation'), value: 'sticky' },
			{ label: __('Fixed', 'groundworx-navigation'), value: 'fixed', isDefault: true },
			{ label: __('Scroll Up Reveal', 'groundworx-navigation'), value: 'scroll-up-reveal' }
		],
		behaviorOptions: [
			{ label: __('Responsive', 'groundworx-navigation'), value: 'responsive', isDefault: true },
			{ label: __('Always', 'groundworx-navigation'), value: true },
		],
		allowedTypes: [
			{ label: __('Accordion', 'groundworx-navigation'), value: 'accordion', isDefault: true },
			{ label: __('Accordion Alt', 'groundworx-navigation'), value: 'accordion-alt' },
			{ label: __('Vertical Menu', 'groundworx-navigation'), value: 'vertical-menu' },
			{ label: __('List', 'groundworx-navigation'), value: 'list' },
		],
		allowedToTypes: [
			{ label: __('Horizontal Menu', 'groundworx-navigation'), value: 'horizontal-menu', isDefault: true },
		],
	},
	{
		name: 'slide-in',
		label: __('Slide In', 'groundworx-navigation'),
		positionOptions: [
			{ label: __('Fixed', 'groundworx-navigation'), value: 'fixed', isDefault: true }
		],
		behaviorOptions: [
			{ label: __('Responsive', 'groundworx-navigation'), value: 'responsive', isDefault: true }
		],
		allowedTypes: [
			{ label: __('Accordion', 'groundworx-navigation'), value: 'accordion', isDefault: true },
			{ label: __('Accordion Alt', 'groundworx-navigation'), value: 'accordion-alt' },
			{ label: __('Vertical Menu', 'groundworx-navigation'), value: 'vertical-menu' },
			{ label: __('List', 'groundworx-navigation'), value: 'list' },
		],
		allowedToTypes: [],
	},
	{
		name: 'classic',
		label: __('Classic', 'groundworx-navigation'),
		positionOptions: [
			{ label: __('Relative', 'groundworx-navigation'), value: 'relative', isDefault: true },
			{ label: __('Sticky', 'groundworx-navigation'), value: 'sticky' },
			{ label: __('Fixed', 'groundworx-navigation'), value: 'fixed', isDefault: true },
			{ label: __('Scroll Up Reveal', 'groundworx-navigation'), value: 'scroll-up-reveal' }
		],
		behaviorOptions: [
			{ label: __('Responsive', 'groundworx-navigation'), value: 'responsive' },
			{ label: __('Always', 'groundworx-navigation'), value: true },
		],
		allowedTypes: [
			{ label: __('Accordion', 'groundworx-navigation'), value: 'accordion', isDefault: true },
			{ label: __('Accordion Alt', 'groundworx-navigation'), value: 'accordion-alt' },
			{ label: __('Vertical Menu', 'groundworx-navigation'), value: 'vertical-menu' },
			{ label: __('List', 'groundworx-navigation'), value: 'list' },
		],
		allowedToTypes: [
			{ label: __('Horizontal Menu', 'groundworx-navigation'), value: 'horizontal-menu', isDefault: true },
		],
	}
];

export function getLayoutConfig(layoutName) {
	return layoutTemplates.find(tpl => tpl.name === layoutName)
		|| layoutTemplates.find(tpl => tpl.name === 'classic');
}

export const DEFAULT_BLOCK = {
	name: 'groundworx/navigation-link',
};

export const PRIORITIZED_INSERTER_BLOCKS = [
	'groundworx/navigation-link/page',
	'groundworx/navigation-link',
];

export const PRELOADED_NAVIGATION_MENUS_QUERY = {
	per_page: 100,
	status: [ 'publish', 'draft' ],
	order: 'desc',
	orderby: 'date',
};

export const ALLOWED_BLOCKS = [
	'groundworx/navigation-link',
	'groundworx/navigation-submenu',
	'groundworx/navigation-spacer',
	'core/page-list',
];

export const SELECT_NAVIGATION_MENUS_ARGS = [
	'postType',
	'gwx_menu',
	PRELOADED_NAVIGATION_MENUS_QUERY,
];

export const menuTemplates = [
	{ name: 'accordion', label: 'Accordion', type: 'accordion', direction: 'vertical' },
	{ name: 'list', label: 'List', type: 'list', direction: 'vertical' },
	{ name: 'vertical-menu', label: 'Vertical Menu', type: 'menu', direction: 'vertical' },
	{ name: 'accordion-alt', label: 'Accordion Alt', type: 'menu', direction: 'vertical' },
	{ name: 'horizontal-menu', label: 'Horizontal Menu', type: 'menu', direction: 'horizontal' }
];

export const TEMPLATE_CONFIG = Object.fromEntries(
	menuTemplates.map( ( { name, direction } ) => [
		name,
		{ layout: { type: 'flex', orientation: direction } },
	] )
);

export function getTemplateConfig( menuType ) {
	const fallback = { type: 'flex', orientation: 'horizontal', flexWrap: 'wrap' };
	return TEMPLATE_CONFIG[ menuType ]?.layout || fallback;
}

export const MIN_SIZE = 20;
export const LINK_DESTINATION_NONE = 'none';
export const LINK_DESTINATION_MEDIA = 'media';
export const LINK_DESTINATION_ATTACHMENT = 'attachment';
export const LINK_DESTINATION_CUSTOM = 'custom';
export const NEW_TAB_REL = [ 'noreferrer', 'noopener' ];
export const ALLOWED_MEDIA_TYPES = [ 'image' ];
export const MEDIA_ID_NO_FEATURED_IMAGE_SET = 0;
export const SIZED_LAYOUTS = [ 'flex', 'grid' ];

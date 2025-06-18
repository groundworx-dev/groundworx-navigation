import clsx from 'clsx';

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { hasBlockSupport } from '@wordpress/blocks';
import { getBreakpoints } from '@groundworx/utils';

import ResponsiveLayoutPanel from './responsive-layout-panel';
import GetStyles from './get-styles';

const addAttributes = (settings) => {
	if (!settings?.supports?.groundworx?.responsiveLayout) return settings;

	return {
		...settings,
		attributes: {
			...settings.attributes,
			responsiveSize: {
				type: 'object',
				default: {
					mode: 'fit',
					value: '',
					unit: 'px',
				},
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'groundworx/responsiveLayout/attributes',
	addAttributes
);


const addContext = (settings) => {
	if (!settings?.supports?.groundworx?.responsiveLayout) return settings;

    if(!settings.hasOwnProperty("usesContext")){
        settings.usesContext = [];
    }

    if (!settings.usesContext.includes("responsiveLayout")) {
		settings.usesContext.push("responsiveLayout");
	}

    return settings
};

addFilter(
	'blocks.registerBlockType',
	'groundworx/responsiveLayout/context',
	addContext
);

const editResponsiveLayoutStyle = createHigherOrderComponent((BlockListBlock) => {
	return (props) => {
		const { name, attributes, className } = props;
		
		if (!hasBlockSupport(name, 'groundworx.responsiveLayout')) {
			return <BlockListBlock {...props} />;
		}

		const mode = attributes.responsiveSize?.mode;

		return (
			<>
				<BlockListBlock
					{...props}
					className={clsx(className, {
						[`has-mode-${mode}`]: mode,
					})}
				/>
			</>
		);
	};
}, 'editResponsiveLayoutStyle');

addFilter(
	'editor.BlockListBlock',
	'groundworx/responsiveLayout/editor-style',
	editResponsiveLayoutStyle
);

const withResponsiveLayoutContext = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const {
			attributes,
			setAttributes,
			name,
			context,
			clientId
		} = props;

		if (!hasBlockSupport(name, 'groundworx.responsiveLayout')) {
			return <BlockEdit {...props} />;
		}

		const { responsiveLayout } = context;

		if (!responsiveLayout) {
			return <BlockEdit {...props} />;
		}
		const {typeConfig, toTypeConfig, switchAt} = responsiveLayout;

		const { responsiveSize } = attributes;

		const canvasWidth = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument?.body?.getBoundingClientRect().width || window.innerWidth;
		const resolved = getBreakpoints.resolve(switchAt);
		const activeLayout = canvasWidth >= resolved ? toTypeConfig : typeConfig;

		const orientation = activeLayout.orientation ? activeLayout.orientation : 'horizontal';
		
		return (
			<Fragment>

				<GetStyles responsiveSize={responsiveSize} clientId={clientId} />
				
				<BlockEdit
					{...props}
				/>
			
				<ResponsiveLayoutPanel
					attributes={attributes}
					setAttributes={setAttributes}
					clientId={clientId}
					orientation={orientation}
				/>
		
			</Fragment>
		);
	};
}, 'withResponsiveLayoutContext');

addFilter(
	'editor.BlockEdit',
	'groundworx/responsiveLayout/editWrapper',
	withResponsiveLayoutContext
);

const applyResponsiveLayoutStyle = (extraProps, blockType, attributes) => {
	if (!hasBlockSupport(blockType, 'groundworx.responsiveLayout')) {
		return extraProps;
	}
	
	const mode = attributes.responsiveSize?.mode;

	return {
		...extraProps,
		className: clsx(extraProps.className, {
			[`has-mode-${mode}`]: mode,
		}),
	};
};

addFilter(
	'blocks.getSaveContent.extraProps',
	'groundworx/responsiveLayout/saveStyles',
	applyResponsiveLayoutStyle
);

const addGroundworxSupport = (settings, name) => {
	if ([
		'core/page-list',
		'core/home-link',
		'core/site-title',
		'core/site-logo',
	].includes(name)) {
		settings.supports = {
			...(settings.supports || {}),
			groundworx: {
				...(settings.supports?.groundworx || {}),
				responsiveLayout: true,
			},
		};
	}

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'groundworx/addResponsiveLayoutSupport',
	addGroundworxSupport,
	9
);


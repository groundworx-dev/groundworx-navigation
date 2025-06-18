/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * Determine the colors for a menu.
 *
 * Order of priority is:
 * 3: Custom colors
 * 4: Theme colors
 * 5: Global styles
 *
 * @param {Object}  context
 * @param {boolean} isSubMenu
 */
export function getColors( context, isSubMenu ) {
	const {
		textColor,
		customTextColor,
		backgroundColor,
		customBackgroundColor,
		style,
	} = context;

	const colors = {};

	if ( !! customTextColor ) {
		colors.customTextColor = customTextColor;
	} else if ( !! textColor ) {
		colors.textColor = textColor;
	} else if ( !! style?.color?.text ) {
		colors.customTextColor = style.color.text;
	}

	if ( !! customBackgroundColor ) {
		colors.customBackgroundColor = customBackgroundColor;
	} else if ( !! backgroundColor ) {
		colors.backgroundColor = backgroundColor;
	} else if ( !! style?.color?.background ) {
		colors.customTextColor = style.color.background;
	}

	return colors;
}

export function getNavigationChildBlockProps( innerBlocksColors ) {
	return {
		className: clsx( 'gwx-menu-item__container', {
			'has-text-color': !! ( innerBlocksColors.textColor || innerBlocksColors.customTextColor	),
			'has-background': !! ( innerBlocksColors.backgroundColor || innerBlocksColors.customBackgroundColor	)
		} )
	};
}

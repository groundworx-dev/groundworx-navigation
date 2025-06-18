import { __, sprintf } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';
import { 
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalUnitControl as UnitControl } from '@wordpress/components';

import { WidthControl } from '@groundworx/components';

const ResponsiveLayoutPanel = ({ attributes, setAttributes, clientId, orientation }) => {
	const { responsiveSize = {} } = attributes;
	const { mode = 'fit', value = '', unit = 'px' } = responsiveSize;

	const isHeight = orientation === 'vertical';
	const label = isHeight ? __('Height') : __('Width');

	const units = ['px', '%', 'em'];

	const setMode = (newMode) => {
		setAttributes({
			responsiveSize: {
				mode: newMode,
				value: newMode === 'fixed' ? value : '',
				unit,
			},
		});
	};

	const setSize = (newValue) => {
		setAttributes({
			...attributes,
			responsiveSize: {
				...responsiveSize,
				value: newValue,
			},
		});
	};

	const setUnit = (newUnit) => {
		setAttributes({
			...attributes,
			responsiveSize: {
				...responsiveSize,
				unit: newUnit,
			},
		});
	};

	const hasValue = () => mode !== 'fit';
	const reset = () =>
		setAttributes({
			...attributes,
			responsiveSize: {
				mode: 'fit',
				value: '',
				unit: 'px',
			},
		});

	return (
		<InspectorControls group="dimensions">
			<VStack
				as={ToolsPanelItem}
				spacing={2}
				hasValue={hasValue}
				label={label}
				onDeselect={reset}
				isShownByDefault
				panelId={ clientId }
			>
				<ToggleGroupControl
					isBlock
					label={label}
					value={mode}
					onChange={setMode}
				>
					<ToggleGroupControlOption value="fit" label={__('Fit')} />
					<ToggleGroupControlOption value="grow" label={__('Grow')} />
					<ToggleGroupControlOption value="fixed" label={__('Fixed')} />
				</ToggleGroupControl>

				{mode === 'fixed' && (
					<WidthControl
						label={sprintf(__('Specify a fixed %s.'), isHeight ? 'height' : 'width')}
						value={value}
						onChange={setSize}
					/>
				)}
			</VStack>
		</InspectorControls>
	);
};

export default ResponsiveLayoutPanel;

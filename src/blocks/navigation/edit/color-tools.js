
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';
import { reset as resetIcon } from '@wordpress/icons';

import { __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown, __experimentalColorGradientControl as ColorGradientControl, __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients } from '@wordpress/block-editor';

import { Dropdown, Button, ColorIndicator, Flex, FlexItem, __experimentalZStack as ZStack, __experimentalHStack as HStack, __experimentalToolsPanelItem as ToolsPanelItem, __experimentalDropdownContentWrapper as DropdownContentWrapper, TabPanel } from '@wordpress/components';

function ColorPanelTab({
	isGradient,
	inheritedValue,
	colorValue,
	setValue,
	colorGradientControlSettings,
}) {
	return (
		<ColorGradientControl
			{ ...colorGradientControlSettings }
			showTitle={ false }
			enableAlpha
			__experimentalIsRenderedInSidebar
			colorValue={ isGradient ? undefined : inheritedValue }
			gradientValue={ isGradient ? inheritedValue : undefined }
			onColorChange={ isGradient ? undefined : setValue }
			onGradientChange={ isGradient ? setValue : undefined }
			clearable={ inheritedValue === colorValue }
			headingLevel={ 3 }
		/>
	);
}

const LinkColorTabs = ({
	label,
	hasValue,
	linkColor,
	setLinkColor,
	hoverLinkColor,
	setHoverLinkColor,
	resetValue,
	colorGradientSettings,
	panelId
}) => {
	const dropdownButtonRef = useRef();

	const tabs = [
		{
			key: 'link',
			label: __('Default', 'groundworx-navigation'),
			colorValue: linkColor?.color ?? '',
			inheritedValue: linkColor?.color ?? '',
			setValue: setLinkColor,
		},
		{
			key: 'hover',
			label: __('Hover', 'groundworx-navigation'),
			colorValue: hoverLinkColor?.color ?? '',
			inheritedValue: hoverLinkColor?.color ?? '',
			setValue: setHoverLinkColor,
		}
	];

	const LabeledColorIndicators = ( { indicators, label } ) => (
		<HStack justify="flex-start">
			<ZStack isLayered={ false } offset={ -8 }>
				{ indicators.map( ( indicator, index ) => (
					<Flex key={ index } expanded={ false }>
						<ColorIndicator colorValue={ indicator } />
					</Flex>
				) ) }
			</ZStack>
			<FlexItem className="block-editor-panel-color-gradient-settings__color-name">
				{ label }
			</FlexItem>
		</HStack>
	);
	
	return (
		<>
		
			<ToolsPanelItem
				className="block-editor-tools-panel-color-gradient-settings__item"
				hasValue={hasValue}
				label={ label }
				onDeselect={() => {
					setLinkColor();
					setHoverLinkColor();
				}}
                resetAllFilter={ resetValue }
				isShownByDefault
				panelId={panelId}
			>
				<Dropdown
				className='block-editor-tools-panel-color-gradient-settings__dropdown'
					popoverProps={{ placement: 'left-start', offset: 36, shift: true }}
					renderToggle={({ onToggle, isOpen }) => {
						const toggleProps = {
							onClick: onToggle,
							className: clsx(
								'block-editor-panel-color-gradient-settings__dropdown',
								{ 'is-open': isOpen }
							),
							'aria-expanded': isOpen,
							ref: dropdownButtonRef,
						};
						return(
							<>
								<Button { ...toggleProps } __next40pxDefaultSize>
									<LabeledColorIndicators
										indicators={ tabs.map( (tab) => tab.colorValue ) }
										label={ label }
									/>
								</Button>
								{hasValue() && (
									<Button
										__next40pxDefaultSize
										icon={resetIcon}
										className="block-editor-panel-color-gradient-settings__reset"
										size="small"
										label={__('Reset', 'groundworx-navigation')}
										onClick={() => {
											resetValue();
											if (isOpen) onToggle();
											dropdownButtonRef.current?.focus();
										}}
									/>
								)}
							</>
						);
					} }
					renderContent={() => (
						<DropdownContentWrapper paddingSize="none">
							<div className="block-editor-panel-color-gradient-settings__dropdown-content">

								<TabPanel
									className="color-tab-panel"
									activeClass="is-active"
									tabs={tabs.map((tab) => ({
									name: tab.key,
									title: tab.label,
								}))}
								>
									{(tab) => {
										const current = tabs.find((t) => t.key === tab.name);
										if (!current) return null;

										const { key, ...rest } = current;

										return (
											<ColorPanelTab
												key={key}
												{...rest}
												colorGradientControlSettings={colorGradientSettings}
											/>
										);
									}}
								</TabPanel>

							</div>
						</DropdownContentWrapper>
					)}
				/>
			</ToolsPanelItem>
		</>
	);
};



export default function ColorTools({
	label,
	textColor,
	setTextColor,
	linkColor,
	setLinkColor,
	hoverLinkColor,
	setHoverLinkColor,
	backgroundColor,
	setBackgroundColor,
	clientId,
	navRef
}) {
    const colorGradientSettings = useMultipleOriginColorsAndGradients();
	if ( ! colorGradientSettings.hasColorsOrGradients ) {
		return null;
	}
	
	return (
		<>
			<ColorGradientSettingsDropdown
				__experimentalIsRenderedInSidebar
				resetIcon
				settings={ [
					{
						colorValue: textColor.color,
						label: `${label} ${__( 'Text', 'groundworx-navigation' )}`,
						onColorChange: setTextColor,
						resetAllFilter: () => setTextColor(),
						clearable: true,
						enableAlpha: true,
					},
					{
						colorValue: backgroundColor.color,
						label: `${label} ${__( 'Background', 'groundworx-navigation' )}`,
						onColorChange: setBackgroundColor,
						resetAllFilter: () => setBackgroundColor(),
						clearable: true,
						enableAlpha: true,
					}
				] }
				panelId={ clientId }
				{ ...colorGradientSettings }
				gradients={ [] }
				disableCustomGradients
			/>
            <LinkColorTabs
				label= { `${label} ${__( 'Link', 'groundworx-navigation' )}` }
				hasValue={ () => Boolean(linkColor?.color || hoverLinkColor?.color) }
                linkColor={ linkColor }
                setLinkColor={ setLinkColor }
                hoverLinkColor={ hoverLinkColor }
                setHoverLinkColor={ setHoverLinkColor }
				resetValue={() => {
					setLinkColor();
					setHoverLinkColor();
				}}
				colorGradientSettings = { colorGradientSettings }
                panelId={ clientId }
            />
		</>
	);
}


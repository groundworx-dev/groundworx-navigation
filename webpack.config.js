const path = require('path');
const [scriptConfig, moduleConfig] = require('@wordpress/scripts/config/webpack.config.js');
const breakpoints = require('./breakpoints.json');

// Generate SCSS $breakpoints map
const scssVars = `$breakpoints: (${Object.entries(breakpoints)
  .map(([k, v]) => `${k}: ${v}`)
  .join(',\n')});`;


function injectGlobalSass(config) {
	if (config.module?.rules) {
		config.resolve = {
			...(config.resolve || {}),
			alias: {
				...(config.resolve?.alias || {}),
				'global-styles': path.resolve(__dirname, 'src/global'),
			},
		};

		config.module.rules = config.module.rules.map((rule) => {
			if (Array.isArray(rule.use)) {
				rule.use = rule.use.map((loader) => {
					if (
						typeof loader === 'object' &&
						loader.loader?.includes('sass-loader')
					) {
						return {
							...loader,
							options: {
								...loader.options,
								sassOptions: {
									...(loader.options?.sassOptions || {}),
									includePaths: [
										path.resolve(__dirname, 'src/global'),
									],
								},
								additionalData: `${scssVars}\n@import "global-styles/index";`,
							},
						};
					}
					return loader;
				});
			}
			return rule;
		});
	}

	config.ignoreWarnings = [() => true];
	
	return config;
}

module.exports = [
	injectGlobalSass(scriptConfig),
	injectGlobalSass(moduleConfig),
];

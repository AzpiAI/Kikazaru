const locI18next = require("loc-i18next");
const i18next = require("i18next");

var localize = null;
i18next.init(
	{
		lng: "en",
		debug: false,
		returnEmptyString: true,
		resources: {
			en: { translation: require("./locales/en.json") },
			es: { translation: require("./locales/es.json") },
		},
	},
	function () {
		localize = locI18next.init(i18next, {
			selectorAttr: "data-i18n", // selector for translating elements
			targetAttr: "i18n-target",
			optionsAttr: "i18n-options",
			useOptionsAttr: false,
			parseDefaultValueFromContent: true,
		});

		i18next.on("languageChanged", function () {
			localize("*");
		});
	}
);

function changeLanguage(lng) {
	i18next.changeLanguage(lng);
}

function load() {
	localize("*");
}

module.exports = {
	translate: i18next.t,
	localize: localize,
	load: load,
	changeLanguage: changeLanguage,
};

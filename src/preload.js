const { contextBridge, ipcRenderer, shell } = require("electron");
const i18n = require("./i18n.js");

contextBridge.exposeInMainWorld("electron", {
	ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on },
	shell: { ...shell, openExternal: shell.openExternal },
});

contextBridge.exposeInMainWorld("models", require("./models.json"));

contextBridge.exposeInMainWorld("i18n", {
	translate: i18n.translate,
	localize: i18n.localize,
	load: i18n.load,
	changeLanguage: i18n.changeLanguage,
});

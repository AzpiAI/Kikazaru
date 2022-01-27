const { contextBridge, ipcRenderer, shell } = require("electron");
const i18n = require("./i18n.js");

contextBridge.exposeInMainWorld("api", {
	send: (channel, data) => {
		let validChannels = [
			"inputDevicesAvailable",
			"getInputDevice",
			"saveSelectedInputDevice",
			"close",
			"minimize"
		];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	receive: (channel, func) => {
		let validChannels = ["savedInputDevice"];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
});

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

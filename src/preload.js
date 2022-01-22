const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on },
	shell: { ...shell, openExternal: shell.openExternal },
});

contextBridge.exposeInMainWorld("models", require("./models.json"));

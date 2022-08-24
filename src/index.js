const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");
const is = require("electron-util");
const unhandled = require("electron-unhandled");
// const debug = require("electron-debug");
const config = require("./config.js");
const server = require("./server.js");
const process = require("process");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

app.commandLine.appendSwitch("js-flags", "--expose_gc");

unhandled(); // Manage unhandled rejections (https://github.com/sindresorhus/electron-unhandled#readme)
// debug(); // Debug features
try {
	require('electron-reloader')(module);
} catch {
	// only for dev
}

let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		icon: path.join(__dirname, "static", "logo.png"),
		show: false,
		width: 525,
		height: 450,
		frame: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
		},
	});

	win.webContents.once("dom-ready", () => {
		ipcMain.on("getInputDevice", () => {
			win.webContents.send("savedInputDevice", config.get("inputDevice"));
		});

		ipcMain.on("saveSelectedInputDevice", (_, data) => {
			config.set("inputDevice", data);
		});

		ipcMain.on("minimize", () => {
			win.minimize();
		});

		server.start();

		server.onHost((data) => {
			win.webContents.send("serverStart", data);
		});
	});

	win.on("ready-to-show", () => {
		win.show();
	});

	win.on("closed", () => {
		mainWindow = undefined;
	});
	await win.loadFile(path.join(__dirname, "views", "index.html"));

	return win;
};

if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on("before-quit", () => {
	server.stop();
});

app.on("second-instance", () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on("window-all-closed", () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on("activate", () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

ipcMain.on("partialResult", (_, result) => {
	server.sendPartialResult(result);
});

ipcMain.on("result", (_, result) => {
	server.sendResult(result);
});

ipcMain.on("close", () => {
	app.quit();
});

(async () => {
	await app.whenReady();
	mainWindow = await createMainWindow();
})();

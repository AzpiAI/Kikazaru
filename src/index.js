const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");
const is = require("electron-util");
const  unhandled  = require("electron-unhandled");
const debug = require("electron-debug");
// const {contextMenu} = require( 'electron-context-menu');
// const packageJson = require("../package.json");
const config = require("./config.js");
// const {autoUpdater} = require( 'electron-updater');

unhandled(); // Manage unhandled rejections (https://github.com/sindresorhus/electron-unhandled#readme)
debug(); // Debug features

// app.setAppUserModelId(packageJson.build.appId);

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window = require( being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		icon: path.join(__dirname, "static", "icon.ico"),
		show: false,
		width: 800,
		height: 800,
		webPreferences: { //seguridad
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false, // turn off remote
			preload: path.join(__dirname, "utils/preload.js")
		}
	});

	win.on("ready-to-show", () => {
		// inputDevice.getLastConfiguredInputDevice();
		let device = config.get('inputDevice');
		win.webContents.send("savedInputDevice", device);

		win.show();
		
		ipcMain.on("getInputDevice", () => {
			mainWindow.webContents.send("savedInputDevice", config.get("inputDevice"));
		})

		ipcMain.on("saveSelectedInputDevice", (evt,data)=>{
			config.set("inputDevice", data);
			// console.log("popoop")
		})
	});

	win.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});
	await win.loadFile(path.join(__dirname, "views", "index.html"));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

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

(async () => {
	await app.whenReady();
	mainWindow = await createMainWindow();

	const favoriteAnimal = config.get("favoriteAnimal"); // Example of how to get a value = require( the config file
	console.log(favoriteAnimal); // Example of how to log a value = require( the config file
})();


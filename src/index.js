const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");
const is = require("electron-util");
const unhandled = require("electron-unhandled");
// const debug = require("electron-debug");
const config = require("./config.js");
const server = require("./server.js");
const process = require("process");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

// const {contextMenu} = require( 'electron-context-menu');
// const packageJson = require("../package.json");
// const {autoUpdater} = require( 'electron-updater');

app.commandLine.appendSwitch("js-flags", "--expose_gc");

unhandled(); // Manage unhandled rejections (https://github.com/sindresorhus/electron-unhandled#readme)
// debug(); // Debug features

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

const createMainWindow = async() => {
    const win = new BrowserWindow({
        title: app.name,
        icon: path.join(__dirname, "static", "logo.png"),
        show: false,
        width: 725,
        height: 520,
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

// server.onHost((data)=>{
// 	mainWindow.webContents.send("serverUrl", data);
// });

(async() => {
    await app.whenReady();
    mainWindow = await createMainWindow();
})();
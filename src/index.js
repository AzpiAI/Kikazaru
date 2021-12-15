const {app, BrowserWindow} = require('electron')

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        icon : __dirname + '/../resources/yuzu_icon.ico',
    })
    
    window.loadFile('app/index.html')
}

app.whenReady().then(() => {
    createWindow()
    // Whereas Linux and Windows apps quit when they have no windows open, 
    // macOS apps generally continue running even without any windows open, 
    // and activating the app when no windows are available should open a new one.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
    }
)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
})
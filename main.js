const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const path = require('path')
const MainMenuapp = require('./menu-config')
const RightMenuapp = require('./right-menu-config')
const PrintOptions = require('./right-menu-config')
const remoteMain = require('@electron/remote/main')
remoteMain.initialize();

let mainWindow
let mainMenu = Menu.buildFromTemplate(MainMenuapp)
let rightMenu = Menu.buildFromTemplate(RightMenuapp)


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    titleBarOverlay: {
      color: 'rgba(0,0,0,0.0)',
      symbolColor: '#000000',
      height: 40
    },
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegrationInSubFrames: true,
      webviewTag: true,
      nodeIntegration: true
    }
  })
  remoteMain.enable(mainWindow.webContents);
  Menu.setApplicationMenu(mainMenu) 
  mainWindow.webContents.on('context-menu', e => {
    rightMenu.popup(mainWindow)
  })

  //mainWindow.webContents.openDevTools()
  loadWebContent()
}

function loadWebContent() {
  mainWindow.loadFile(path.join(__dirname, 'loading.html'))
  let wc = mainWindow.webContents
  wc.once('did-finish-load'  ,  () => {
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'))
  })
  wc.on('did-fail-provisional-load', (error, code)=> {
    mainWindow.loadFile(path.join(__dirname, 'offline.html'))
  })
}
ipcMain.on('online-status-changed', (event, status) => {
  if(status == true) { loadWebContent() }
})

// Print page option
ipcMain.on('printPage', () => {

  var options = PrintOptions;
  let win = BrowserWindow.getFocusedWindow();
  win.webContents.print(options, (success, failureReason) => {
      if (!success) dialog.showMessageBox(mainWindow, {
        message: failureReason.charAt(0).toUpperCase() + failureReason.slice(1),
        type: "error",
        buttons: ["Cancel"],
        defaultId: 0,
        title: "Print Error",
    });
  });
})

//Load menuItem local pages (About, Home page, etc)
module.exports = (pageId) => {
  if(pageId === 'home') {
    loadWebContent()
  } else {
    mainWindow.loadFile(path.join(__dirname, `public/windows/${pageId}.html`))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

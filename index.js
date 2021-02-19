const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
var AutoLaunch = require('auto-launch');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    setTimeout(autoUpdateCheck,10000);
  });
}

function autoUpdateCheck(){
  autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

var autoLauncher = new AutoLaunch({
  name: 'omica',
  path: app.getPath('exe'),
});

autoLauncher.enable();

autoLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
      return;
    }
    autoLauncher.enable();
})
.catch(function(err){
  // handle error
});
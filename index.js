const { app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
const { autoUpdater } = require('electron-updater');
var AutoLaunch = require('auto-launch');
const log = require('electron-log');

let mainWindow;
const updateCheck = false;
var iconpath = './pic/favicon.ico';

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
    icon: iconpath,
  });
  mainWindow.loadFile('index.html');
  var appIcon = new Tray('./pic/16x16.ico');
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click:  function(){
      mainWindow.show();
    } },
    { label: 'Quit', click:  function(){
      app.isQuiting = true;
      app.quit();
    } }
  ]);
  appIcon.setContextMenu(contextMenu);
  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on('closed', function (event) {
    mainWindow = null;
    // if (!app.isQuiting) {
    //   event.preventDefault();
    //   mainWindow.hide();
    //   event.returnValue = false;
    // }
  });
  
  mainWindow.once('ready-to-show', () => {
    autoUpdateCheck(updateCheck);
  });
}

autoUpdater.logger = log;
log.info('App starting...');    
autoUpdater.on('download-progress', (progressObj) => {
  updateCheck = true;
  let log_message = ' - Downloaded ' + Math.round(progressObj.percent) + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

function autoUpdateCheck(updateCheck){
  if(!updateCheck){
    autoUpdater.checkForUpdatesAndNotify();
  }
  setTimeout(autoUpdateCheck,60000);
}

app.on('ready', () => {
  createWindow();
  mainWindow.minimize();
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
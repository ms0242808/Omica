const { app, BrowserWindow, ipcMain} = require('electron');
const { autoUpdater } = require('electron-updater');
var AutoLaunch = require('auto-launch');
const log = require('electron-log');

let mainWindow;
var iconpath = './pic/favicon.icon';

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 460,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
    icon: iconpath,
    autoHideMenuBar: true,
    frame: false 
  });
  mainWindow.loadFile('index.html');
  
  mainWindow.on('closed',function(event){
    mainWindow = null;
  });
  
  mainWindow.once('ready-to-show', () => {
    // autoUpdateCheck();
  });
}

autoUpdater.logger = log;
log.info('App starting...');    
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = ' - Downloaded ' + Math.round(progressObj.percent) + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

function sendStatusToWindow(text){
  log.info(text);
  mainWindow.webContents.send('message', text);
}

function autoUpdateCheck(){
  autoUpdater.checkForUpdatesAndNotify();
  setTimeout(autoUpdateCheck,1800000);
}

app.on('ready', () => {
  createWindow();
  setTimeout(function(){mainWindow.minimize();autoUpdateCheck();},2000);
});

app.on('window-all-closed',function(){
  if(process.platform !== 'darwin'){
    app.quit();
  }
});

app.on('activate', function(){
  if(mainWindow === null){
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
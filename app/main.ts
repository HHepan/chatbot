import "reflect-metadata"
import {app, BrowserWindow, screen, globalShortcut, Menu, ipcMain, IpcMainInvokeEvent} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {AppDataSource} from "./data-source";
import {EventsCenter} from "./events.center";
import {MainService} from "./main.service";
import {ItemRepository} from "./repository/item.repository";
let win: BrowserWindow | null = null;
const eventsCenter = new EventsCenter();
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
export const mainService = new MainService();

function createWindow(): BrowserWindow {
  AppDataSource.initialize().then(r => {
    console.log(AppDataSource.isInitialized);
    // 实例化加载事件
    new ItemRepository(eventsCenter);
    eventsCenter.handleAll();
  })

  // Create the browser window.
  win = new BrowserWindow({
    width: 1300,
    height: 800,
    maximizable: true,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    },
  });

  // win.webContents.openDevTools();

  Menu.setApplicationMenu(null);

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}


try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 400);
    globalShortcut.register('CommandOrControl+Shift+i', function () {
      if (win !== null) {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools()
        } else {
          win.webContents.openDevTools()
        }
      }
    })
    const size = screen.getPrimaryDisplay().workAreaSize;
    ipcMain.handle('login-success', () => {
      console.log('ipcMain login-success')
      // win?.setSize(size.width * (7 / 8), size.height * (7 / 8));
      win?.setSize(1300, 800);
      // 获取屏幕的大小
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;

      let widthAndHeight = win?.getSize();
      if (!widthAndHeight) {widthAndHeight = [0, 0]}
      // 计算窗口的 x 和 y 坐标使其位于屏幕正中央
      const x = (width - widthAndHeight[0]) / 2;
      const y = (height - widthAndHeight[1]) / 2;

      // 使用setPosition()方法将窗口定位到计算后的 x 和 y 坐标
      win?.setPosition(x, y);
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

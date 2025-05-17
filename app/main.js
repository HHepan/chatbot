"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainService = void 0;
require("reflect-metadata");
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
const data_source_1 = require("./data-source");
const events_center_1 = require("./events.center");
const main_service_1 = require("./main.service");
const message_repository_1 = require("./repository/message.repository");
const xunfei_api_service_1 = require("./services/xunfei-api.service");
const setting_repository_1 = require("./repository/setting.repository");
let win = null;
const eventsCenter = new events_center_1.EventsCenter();
const args = process.argv.slice(1), serve = args.some(val => val === '--serve');
exports.mainService = new main_service_1.MainService();
function createWindow() {
    data_source_1.AppDataSource.initialize().then(r => {
        console.log(data_source_1.AppDataSource.isInitialized);
        // 实例化加载事件
        new message_repository_1.MessageRepository(eventsCenter);
        new setting_repository_1.SettingRepository(eventsCenter);
        // 实例化讯飞api服务
        new xunfei_api_service_1.XunFeiApiService(eventsCenter);
        // 监听所有事件
        eventsCenter.handleAll();
    });
    // Create the browser window.
    win = new electron_1.BrowserWindow({
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
    electron_1.Menu.setApplicationMenu(null);
    if (serve) {
        const debug = require('electron-debug');
        debug();
        require('electron-reloader')(module);
        win.loadURL('http://localhost:4200');
    }
    else {
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
    electron_1.app.on('ready', () => {
        setTimeout(createWindow, 400);
        electron_1.globalShortcut.register('CommandOrControl+Shift+i', function () {
            if (win !== null) {
                if (win.webContents.isDevToolsOpened()) {
                    win.webContents.closeDevTools();
                }
                else {
                    win.webContents.openDevTools();
                }
            }
        });
    });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map
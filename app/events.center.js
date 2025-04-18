"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsCenter = void 0;
const electron_1 = require("electron");
/**
 * 保存所有事件
 */
class EventsCenter {
    constructor() {
        this._events = {};
    }
    registerEvent(channel, listener) {
        this._events[channel] = listener;
    }
    /**
     * 将事件添加到 _events
     */
    registerEvents(events) {
        for (const eventKey in events) {
            this.registerEvent(eventKey, events[eventKey]);
        }
    }
    handle(channel, listener) {
        electron_1.ipcMain.handle(channel, listener);
    }
    /**
     *  在createWindow时调用，监听所有事件
     */
    handleAll() {
        for (const channel in this._events) {
            this.handle(channel, this._events[channel]);
        }
    }
}
exports.EventsCenter = EventsCenter;
//# sourceMappingURL=events.center.js.map
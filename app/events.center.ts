import {IpcMainInvokeEvent, ipcMain} from 'electron';
/**
 * 保存所有事件
 */
export class EventsCenter {

  _events: Record<string, (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)> = {};

  registerEvent(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => any) {
    this._events[channel] = listener;
  }
  /**
   * 将事件添加到 _events
   */
  registerEvents(events: Record<string, (event: IpcMainInvokeEvent, ...args: any[]) => any>): void {
    for (const eventKey in events) {
      this.registerEvent(eventKey, events[eventKey])
    }
  }

  handle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    ipcMain.handle(channel, listener);
  }

  /**
   *  在createWindow时调用，监听所有事件
   */
  handleAll(): void {
    for (const channel in this._events) {
      this.handle(channel, this._events[channel]);
    }
  }

}

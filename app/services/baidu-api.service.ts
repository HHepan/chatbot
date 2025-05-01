import {IpcMainInvokeEvent, ipcMain} from 'electron';
import {EventsCenter} from "../events.center";
import {Item} from "../entity/item";
/**
 * 调用百度 api
 */
export class BaiduApiService {
  constructor(private eventsCenter: EventsCenter) {
    this.loadEvents()
  }

  addEvent(eventKey: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    this.eventsCenter.registerEvent(`${eventKey}`, listener);
  }

  loadEvents(): void {
    this.addEvent('speech-recognition-api', async () => {
      console.log('electron speech-recognition-api');
    });
  }
}

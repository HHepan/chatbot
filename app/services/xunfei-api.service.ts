import {IpcMainInvokeEvent, ipcMain} from 'electron';
import {EventsCenter} from "../events.center";
/**
 * 调用讯飞 api
 */
export class XunfeiApiService {
  constructor(private eventsCenter: EventsCenter) {
    this.loadEvents()
  }

  addEvent(eventKey: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    this.eventsCenter.registerEvent(`${eventKey}`, listener);
  }

  loadEvents(): void {
    this.addEvent('speech-recognition-api', async () => {
      console.log('electron speech-recognition-api');
      // 向讯飞语音识别api发起请求
    });
  }
}

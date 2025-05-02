import {IpcMainInvokeEvent, ipcMain, app} from 'electron';
import {EventsCenter} from "../events.center";
import * as fs from 'fs';
import * as path from 'path';

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
    const projectRoot = app.getAppPath(); // 获取 Electron 项目的根目录
    const audioDir = path.join(projectRoot, 'audio');

    // 如果目录不存在则创建
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const outputPath = path.join(audioDir, 'recording.pcm');
    let writeStream: fs.WriteStream | null = null;

    this.addEvent('speech-recognition-api', async (event, pcmBuffer: ArrayBuffer) => {
      console.log('electron speech-recognition-api', pcmBuffer);
      if (!writeStream) {
        writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
      }
      writeStream.write(Buffer.from(pcmBuffer));
      // 向讯飞语音识别api发起请求
    });

    this.addEvent('stop-speech-recognition', async () => {
      if (writeStream) {
        writeStream.end();
        writeStream = null;
      }
    });
  }
}

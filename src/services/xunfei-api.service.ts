import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";
import {Observable} from "rxjs";

@Injectable()
export class XunfeiApiService {
  constructor(private _electronService: ElectronService) {
  }

  /**
   * 语音识别 api
   * */
  speechRecognitionApi(pcm: Int16Array): Observable<string> {
    return new Observable(observer => {
      // 调用 Electron 主进程方法
      this._electronService.ipcRenderer.invoke('speech-recognition-api', pcm.buffer);

      // 监听结果
      const handler = (event: any, data: string | undefined) => {
        observer.next(data);     // 发出识别结果
        observer.complete();     // 完成
        this._electronService.ipcRenderer.removeListener('speech-recognition-result', handler);
      };

      // 注册事件
      this._electronService.ipcRenderer.on('speech-recognition-result', handler);
    });
  }

  /**
   * 停止录音，关闭语音识别
   * */
  stopSpeechRecognition() {
    this._electronService.ipcRenderer.invoke('stop-speech-recognition');
  }
}

import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";
import {from, Observable, throwError} from "rxjs";

@Injectable()
export class XunFeiApiService {
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

  /**
   * 调用讯飞 Spark Max 自然语言处理 API，返回 Observable 流式响应
   */
  naturalLanguageApi(message: string, currentSettingId: string): Observable<string> {
    // 向主进程发送消息
    this._electronService.ipcRenderer.invoke('natural-language-api', message, currentSettingId);

    return new Observable<string>(observer => {
      const listener = (_event: any, data: string) => {
        observer.next(data);
      };

      this._electronService.ipcRenderer.on('natural-language-result', listener);

      // 关键：在取消订阅时移除监听器，防止重复
      return () => {
        this._electronService.ipcRenderer.removeListener('natural-language-result', listener);
      };
    });
  }

  /**
   * 语音合成 api
   * */
  speechSynthesisApi(text: string) {
    this._electronService.ipcRenderer.invoke('speech-synthesis-api', text);
    return new Observable<string>(observer => {
      const listener = (_event: any, data: string) => {
        observer.next(data);
      };

      this._electronService.ipcRenderer.on('speech-synthesis-result', listener);

      // 关键：在取消订阅时移除监听器，防止重复
      return () => {
        this._electronService.ipcRenderer.removeListener('speech-synthesis-result', listener);
      };
    });
  }
}

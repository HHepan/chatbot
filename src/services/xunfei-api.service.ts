import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";

@Injectable()
export class XunfeiApiService {
  constructor(private _electronService: ElectronService) {
  }

  /**
   * 语音识别 api
   * */
  speechRecognitionApi(pcm: Int16Array) {
    this._electronService.ipcRenderer.invoke('speech-recognition-api', pcm.buffer);
  }

  /**
   * 停止录音，关闭语音识别
   * */
  stopSpeechRecognition() {
    this._electronService.ipcRenderer.invoke('stop-speech-recognition');
  }
}

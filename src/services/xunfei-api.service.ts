import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";

@Injectable()
export class XunfeiApiService {
  constructor(private _electronService: ElectronService) {
  }

  /**
   * 语音识别 api
   * */
  speechRecognitionApi() {
    this._electronService.ipcRenderer.invoke('speech-recognition-api');
  }
}

import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";

@Injectable()
export class BaiduApiService {
  constructor(private _electronService: ElectronService) {
  }

  speechRecognitionApi() {
    console.log('BaiduApiService speechRecognitionApi');
    this._electronService.ipcRenderer.invoke('speech-recognition-api');
  }
}

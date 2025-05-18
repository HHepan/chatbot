import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";
import {from, Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {Setting} from "../../app/entity/setting";

@Injectable()
export class SettingService {
  baseUrl = 'setting-';
  constructor(private _electronService: ElectronService) {
  }

  add(setting: Setting) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'add', setting))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  getAll() {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'getAll'))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  delete(setting: Setting) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'delete', setting))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  getById(settingId: number) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'getById', settingId))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  setDefaultById(settingId: number) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'setDefaultById', settingId))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  update(newSetting: Setting) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'update', newSetting))
      .pipe(catchError((error: any) => throwError(error.json)));
  }
}

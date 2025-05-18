import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";
import {from, Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {Message} from "../../app/entity/message";

@Injectable()
export class IndexService {
  baseUrl = 'message-';
  constructor(private _electronService: ElectronService) {
  }

  add(message: Message) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'add', message))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

    getAllByCurrentSettingId(currentSettingId: number) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'getAll', currentSettingId))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  delete(message: Message) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'delete', message))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  getById(messageId: number) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'getById', messageId))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  update(newMessage: Message) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'update', newMessage))
      .pipe(catchError((error: any) => throwError(error.json)));
  }
}

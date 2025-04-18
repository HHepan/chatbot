import {Injectable} from "@angular/core";
import {ElectronService} from "./electron.service";
import {from, Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {Item} from "../../app/entity/item";

@Injectable()
export class IndexService {
  baseUrl = 'item-';
  constructor(private _electronService: ElectronService) {
  }

  add(item: Item): Observable<Electron.Item> {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'add', item))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  getAll(searchName: string | null) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'getAll', searchName))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  delete(item: Item) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'delete', item))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  getById(itemId: number) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'getById', itemId))
      .pipe(catchError((error: any) => throwError(error.json)));
  }

  update(newItem: Item) {
    return from(this._electronService.ipcRenderer.invoke(this.baseUrl + 'update', newItem))
      .pipe(catchError((error: any) => throwError(error.json)));
  }
}

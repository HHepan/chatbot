import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable()
export class IndexSubjectService {
  indexSubject = new Subject();
  eventKeys = {
    addSettingFinish: 'addSettingFinish',
  }

  getIndexSubject() {
    return this.indexSubject;
  }

  getEventKeys() {
    return this.eventKeys;
  }

  addSettingFinish() {
    this.indexSubject.next(this.eventKeys.addSettingFinish);
  }
}

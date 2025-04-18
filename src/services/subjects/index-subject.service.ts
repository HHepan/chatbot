import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable()
export class IndexSubjectService {
  indexSubject = new Subject();
  eventKeys = {
    addFinish: 'addFinish',
  }

  getIndexSubject() {
    return this.indexSubject;
  }

  getEventKeys() {
    return this.eventKeys;
  }

  addFinish() {
    this.indexSubject.next(this.eventKeys.addFinish);
  }
}

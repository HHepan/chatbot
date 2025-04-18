import { Component } from '@angular/core';
import {refresh} from "electron-debug";
import {CommonService} from "../services/common.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLogin: string | null | undefined;
  constructor(private commonService: CommonService) {
  }
}

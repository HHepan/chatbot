import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index.component';
import {IndexRoutingModule} from "./index-routing.module";
import {FormsModule} from "@angular/forms";
import {XunFeiApiService} from "../../services/xunfei-api.service";
import {IndexService} from "../../services/index.service";



@NgModule({
  declarations: [
    IndexComponent
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    FormsModule
  ],
  providers: [XunFeiApiService, IndexService]
})
export class IndexModule { }

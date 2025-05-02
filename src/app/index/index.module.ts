import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index.component';
import {IndexRoutingModule} from "./index-routing.module";
import {FormsModule} from "@angular/forms";
import {XunfeiApiService} from "../../services/xunfei-api.service";



@NgModule({
  declarations: [
    IndexComponent
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    FormsModule
  ],
  providers: [XunfeiApiService]
})
export class IndexModule { }

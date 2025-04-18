import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index.component';
import {IndexRoutingModule} from "./index-routing.module";
import {FormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    IndexComponent
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    FormsModule
  ]
})
export class IndexModule { }

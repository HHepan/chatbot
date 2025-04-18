import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IndexComponent} from "./index.component";
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class IndexRoutingModule { }

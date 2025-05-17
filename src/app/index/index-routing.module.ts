import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IndexComponent} from "./index.component";
import {RouterModule, Routes} from "@angular/router";
import {DialogEntryComponent} from "../common/dialog-entry/dialog-entry.component";
import {CharacterAddComponent} from "./character-add/character-add.component";
import {CharacterEditComponent} from "./character-edit/character-edit.component";

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    children: [
      {
        path: 'add',
        component: DialogEntryComponent,
        data: {
          component: CharacterAddComponent
        }
      },
      {
        path: 'edit',
        component: DialogEntryComponent,
        data: {
          component: CharacterEditComponent
        }
      },
    ]
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index.component';
import {IndexRoutingModule} from "./index-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {XunFeiApiService} from "../../services/xunfei-api.service";
import {IndexService} from "../../services/index.service";
import { CharacterAddComponent } from './character-add/character-add.component';
import {DialogEntryModule} from "../common/dialog-entry/dialog-entry.module";
import { CharacterEditComponent } from './character-edit/character-edit.component';
import {SettingService} from "../../services/setting.service";



@NgModule({
  declarations: [
    IndexComponent,
    CharacterAddComponent,
    CharacterEditComponent
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    FormsModule,
    DialogEntryModule,
    ReactiveFormsModule,
  ],
  providers: [XunFeiApiService, IndexService, SettingService]
})
export class IndexModule { }

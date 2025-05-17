import { Component } from '@angular/core';
import {CommonService} from "../../../services/common.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-character-edit',
  templateUrl: './character-edit.component.html',
  styleUrls: ['./character-edit.component.scss']
})
export class CharacterEditComponent {
  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    character_setting: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    max_text_number: new FormControl('', [Validators.required]),
  });
  key = {
    name: 'name',
    character_setting: 'character_setting',
    description: 'description',
    max_text_number: 'max_text_number'
  };
  constructor(private commonService:CommonService) {
  }

  onClose() {
    this.commonService.back();
  }

  onSubmit() {

  }
}

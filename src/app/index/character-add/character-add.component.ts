import { Component } from '@angular/core';
import {CommonService} from "../../../services/common.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Setting} from "../../../../app/entity/setting";
import {SettingService} from "../../../services/setting.service";
import {IndexSubjectService} from "../../../services/subjects/index-subject.service";

@Component({
  selector: 'app-character-add',
  templateUrl: './character-add.component.html',
  styleUrls: ['./character-add.component.scss']
})
export class CharacterAddComponent {
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
  constructor(private commonService: CommonService,
              private settingService: SettingService,
              private indexSubjectService: IndexSubjectService) {
  }

  onClose() {
    this.commonService.back();
  }

  onSubmit() {
    const setting = new Setting();
    setting.name = this.formGroup.get(this.key.name)?.value;
    setting.character_setting = this.formGroup.get(this.key.character_setting)?.value;
    setting.description = this.formGroup.get(this.key.description)?.value;
    setting.max_text_number = this.formGroup.get(this.key.max_text_number)?.value;
    setting.default = 0;

    console.log('add setting', setting);
    this.settingService.add(setting).subscribe(result => {
      console.log('Character Add success', result);
      this.onClose();
      this.commonService.success();
      this.indexSubjectService.addSettingFinish();
    });
  }
}

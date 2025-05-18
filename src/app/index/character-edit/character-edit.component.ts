import {Component, OnInit} from '@angular/core';
import {CommonService} from "../../../services/common.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Setting} from "../../../../app/entity/setting";
import {ActivatedRoute} from "@angular/router";
import {SettingService} from "../../../services/setting.service";
import {IndexSubjectService} from "../../../services/subjects/index-subject.service";

@Component({
  selector: 'app-character-edit',
  templateUrl: './character-edit.component.html',
  styleUrls: ['./character-edit.component.scss']
})
export class CharacterEditComponent implements OnInit{
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
  settingId: number | undefined;
  currentSetting: Setting | undefined;
  constructor(private commonService:CommonService,
              private activeRoute: ActivatedRoute,
              private settingService: SettingService,
              private indexSubjectService: IndexSubjectService) {
  }

  ngOnInit(): void {
    this.settingId = this.activeRoute.snapshot.params['id'];
    console.log('CharacterEditComponent settingId', this.settingId);
    if (this.settingId !== undefined) {
      this.getCurrentSetting(this.settingId);
    }
  }

  private getCurrentSetting(settingId: number) {
    this.settingService.getById(settingId).subscribe(setting => {
      this.currentSetting = setting;
      this.setFormGroup(this.currentSetting);
    });
  }

  private setFormGroup(currentSetting: Setting | undefined) {
    if (currentSetting !== undefined) {
      this.formGroup.get(this.key.name)?.setValue(currentSetting.name);
      this.formGroup.get(this.key.character_setting)?.setValue(currentSetting.character_setting);
      this.formGroup.get(this.key.description)?.setValue(currentSetting.description);
      this.formGroup.get(this.key.max_text_number)?.setValue(currentSetting.max_text_number);
    }
  }

  onClose() {
    this.commonService.back();
  }

  onSubmit() {
    const newSetting = new Setting();
    newSetting.name = this.formGroup.get(this.key.name)?.value;
    newSetting.character_setting = this.formGroup.get(this.key.character_setting)?.value;
    newSetting.description = this.formGroup.get(this.key.description)?.value;
    newSetting.max_text_number = this.formGroup.get(this.key.max_text_number)?.value;
    newSetting.id = this.settingId;
    this.settingService.update(newSetting).subscribe(() => {
      this.onClose();
      this.commonService.success();
      this.indexSubjectService.addSettingFinish();
    });
  }
}

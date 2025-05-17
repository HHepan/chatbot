import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {DialogEntryComponent} from './dialog-entry.component'

@NgModule({
  declarations: [
    DialogEntryComponent
  ],
  imports: [
    MatDialogModule
  ],
  exports: [
    DialogEntryComponent
  ]
})
export class DialogEntryModule {
}

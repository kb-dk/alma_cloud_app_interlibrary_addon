import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ExternalLinkTemplate} from "../models/externalLinkTemplate";

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<SettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ExternalLinkTemplate)
  {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    console.log('Settings-dialog started')
  }

  onChange() {
    //TODO: JJEG: Hvis linket er komplet vises test link
  }
}

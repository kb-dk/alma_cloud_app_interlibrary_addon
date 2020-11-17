import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ExternalLinkTemplate, SearchCriteria} from "../models/externalLinkTemplate";

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {

  showExample: boolean = false;
  testlink: string = '';
  readyForSaving: boolean = false;

  //The dialog has the handle 'dialogRef', uses this component (SettingsDialogComponent)
  //and is injected with ExternalLinkTemplate data-type.
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
    //creates the testlink - only visible if readyForSaving = true;
    const titleTestValue = 'Aesthetics, disinterestedness and effectiveness in political art.';
    const isbnTestValue = '0415232813';
    const mmsIdTestValue = '99122413971805763';
    const authorTestValue = 'H.C.Andersen';
    let testSearchValue: string;
    switch (+this.data.searchCriteria) {
      case SearchCriteria.MMS_ID:
        testSearchValue = mmsIdTestValue;
        break;
      case SearchCriteria.ISBN:
        testSearchValue = isbnTestValue;
        break;
      case SearchCriteria.TITLE:
        testSearchValue = titleTestValue;
        break;
      case SearchCriteria.AUTHOR:
        testSearchValue = authorTestValue;
        break;
      default:
        break;
    }
    this.testlink = this.data.partOfUrlBeforeSearchCriteria + testSearchValue + this.data.partOfUrlAfterSearchCriteria;
    this.readyForSaving = this.data.searchCriteria>0 && this.data.linkName != '' && this.data.partOfUrlBeforeSearchCriteria != ''
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }
}

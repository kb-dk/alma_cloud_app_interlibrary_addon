import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { ExternalLinkTemplate, SearchCriteriaType} from "../../models/external-link-template";

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
  }

  onChange() {
    //creates the testlink - only visible if readyForSaving = true;
    const titleTestValue = 'Aesthetics, disinterestedness and effectiveness in political art.';
    const isbnTestValue = '0415232813';
    const authorTestValue = 'H.C.Andersen';
    const issnTestValue = '0106-9470';
    let testSearchValue: string;
    switch (+this.data.searchCriteriaType) {
      case SearchCriteriaType.ISBN:
        testSearchValue = isbnTestValue;
        break;
      case SearchCriteriaType.TITLE:
        testSearchValue = titleTestValue;
        break;
      case SearchCriteriaType.AUTHOR:
        testSearchValue = authorTestValue;
        break;
      case SearchCriteriaType.ISSN:
        testSearchValue = issnTestValue;
        break;
      default:
        break;
    }
    this.testlink = this.data.startOfLink + testSearchValue + this.data.endOfLink;
    this.readyForSaving = this.data.searchCriteriaType>0 && this.data.linkName != '' && this.data.startOfLink != ''
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }
}

import {Component, Input, OnInit} from '@angular/core';
import { AppService } from '../app.service';
import { FormGroup } from '@angular/forms';
import { CloudAppSettingsService, FormGroupUtil } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrService } from 'ngx-toastr';
import { Settings } from '../models/settings';
import { ExternalLinkTemplate} from "../models/externalLinkTemplate";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup
  saving = false;

  constructor(
    private appService: AppService,
    private settingsService: CloudAppSettingsService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.appService.setTitle('Settings');
    let test:Settings = new Settings();
    console.log("SETTINGS; " + JSON.stringify(test));
    this.settingsService.getAsFormGroup().subscribe( settings => {
      this.form = Object.keys(settings.value).length==0 ?
        FormGroupUtil.toFormGroup(new Settings()) :
        settings;
    });
  }

  save() {
    this.saving = true;
    console.log('Vi gemmer: ' + this.form.value);
    this.settingsService.set(this.form.value).subscribe(
      response => {
        this.toastr.success('Settings successfully saved.');
        this.form.markAsPristine();
      },
      err => this.toastr.error(err.message),
      ()  => this.saving = false
    );
  }


  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
//    this.dialog.open(CourseDialogComponent, dialogConfig);
  }

}

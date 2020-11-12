import {Component, Input, OnInit} from '@angular/core';
import { AppService } from '../app.service';
import { FormGroup } from '@angular/forms';
import { CloudAppSettingsService, FormGroupUtil } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrService } from 'ngx-toastr';
import { Settings } from '../models/settings';
import { ExternalLinkTemplate} from "../models/externalLinkTemplate";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {SettingsDialogComponent} from "../settings-dialog/settings-dialog.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  items: ExternalLinkTemplate[] = [];
  loading: boolean = true;
  form: FormGroup;
  settings: Settings;
  saving = false;
  dialogOpen: boolean = false;



  constructor(
    private appService: AppService,
    private settingsService: CloudAppSettingsService,
    private toastr: ToastrService,
    public dialog: MatDialog
    ) { }

  ngOnInit() {
    this.settingsService.get().subscribe(result => {
      if(!result.items) {
        result.settings.items = [];
        console.log("Items oprettet" + result.items);
      }
      this.settings = result;
    })
    this.appService.setTitle('Settings');
/*
    let test:Settings = new Settings();
    console.log("SETTINGS: " + JSON.stringify(test));
    this.settingsService.getAsFormGroup().subscribe( settings => {
      console.log("Settings hentet: " + settings);
      // console.log("Settings hentet JSON: " + JSON.stringify(settings));
      this.form = Object.keys(settings.value).length==0 ? FormGroupUtil.toFormGroup(new Settings()):settings;

    });
*/

    this.loading = false;
  }

/*
  saveOld() {
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
*/

  save() {
    this.saveSettings();
  }

  private saveSettings() {
    this.saving = true;
    // console.log('Vi gemmer: ' + this.form.value);
    this.settingsService.set(this.settings).subscribe(
        response => {
          this.toastr.success('New Settings successfully saved.');
          // this.form.markAsPristine();
        },
        err => this.toastr.error(err.message),
        () => this.saving = false
    );
    this.saving = false;
  }

  remove(removableItem: ExternalLinkTemplate) {
    console.log("Før slet af item: " + this.settings.items.length);
    this.settings.items.splice(this.settings.items.findIndex(item => item.id === removableItem.id,1));
    this.saveSettings();
    console.log("Efter slet af item: " + this.settings.items.length);
    this.toastr.success(removableItem.linkName + ' removed.');
  }

  openDialog() {
    this.dialogOpen = true;
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '90%',
      data: new ExternalLinkTemplate()
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogOpen = false;
      console.log("Før tilføj item: " + this.settings.items.length);
      this.settings.items.push(result);
      console.log("Efter tilføj af item: " + this.settings.items.length);
      this.save();
    });
  }

}

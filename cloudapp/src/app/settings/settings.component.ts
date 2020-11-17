import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { FormGroup } from '@angular/forms';
import { CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrService } from 'ngx-toastr';
import { Settings } from '../models/settings';
import { ExternalLinkTemplate} from "../models/externalLinkTemplate";
import { MatDialog } from "@angular/material/dialog";
import { SettingsDialogComponent } from "../settings-dialog/settings-dialog.component";

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
    this.loading = false;
  }

  private saveSettings(toastMessage:string) {
    this.saving = true;
    this.settingsService.set(this.settings).subscribe(
        response => {
            this.toastr.success(toastMessage);
          // this.form.markAsPristine();
        },
        err => this.toastr.error(err.message),
        () => this.saving = false
    );
    this.saving = false;
  }

  remove(removableItem: ExternalLinkTemplate) {
    this.settings.items = this.settings.items.filter(item => item.id != removableItem.id);
    this.saveSettings('Localization-link: ' + removableItem.linkName + ' removed from settings.');
  }

  openDialog() {
    this.dialogOpen = true;
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '95%',
      data: new ExternalLinkTemplate()
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogOpen = false;
      this.settings.items.push(result);
      this.saveSettings('Localization-link: ' + result.linkName + ' saved to settings.');
    });
  }

}

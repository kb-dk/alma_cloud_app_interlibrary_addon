import { Component, OnInit } from '@angular/core';
import {ExternalLinkTemplate} from "../models/external-link-template";
import {Settings} from "../models/settings";
import {AppService} from "../app.service";
import {CloudAppSettingsService} from "@exlibris/exl-cloudapp-angular-lib";
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  locationsUsableForDitization: string[] = [];
  settings: Settings;
  saving = false;
  // dialogOpen: boolean = false;
  newLocation: string;
  private savedOk: boolean = false;
  private showExample: boolean = false;

  constructor(
      private appService: AppService,
      private settingsService: CloudAppSettingsService,
      private toastr: ToastrService,
      // public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.appService.setTitle('Configuraton');
    this.getSettings();
  }

  private getSettings() {
    this.settingsService.get().subscribe(result => {
      console.log('result(get Settings): ', result);
      if (!result.externalLinkTemplates && !result.locationsUsableForDitization) {
        console.log('1');
        result = new Settings();
      }
      if (!result.locationsUsableForDitization) {
        console.log('2');
        result.locationsUsableForDitization = [];
      }
      this.settings = result;
    })
  }

  private saveLocations(createNew: boolean) {
    this.saving = true;
    this.settingsService.set(this.settings).subscribe(
        response => {
          this.savedOk = true;
          if(!createNew) {
            this.toastr.success("Locations updated.")
          }
        },
        err => {
          this.saving = false;
          this.savedOk = false;
          console.log('err.message(): ', err.message);
          this.toastr.error(err.message)
        },
        () => this.saving = false
    );
  }

  remove(removableLocation: String) {
    this.settings.locationsUsableForDitization = this.settings.locationsUsableForDitization.filter(locationCode => locationCode != removableLocation);
    this.saveLocations(false);
  }

  saveNewLocation() {
    if (this.newLocation != '') {
      this.settings.locationsUsableForDitization.push(this.newLocation);
      this.saveLocations(true);
    }
    (async () => {
      while (this.saving) {// wait for post
        await this.delay(1000);
      }
      if (this.savedOk) {//no error
        this.toastr.success('Localization including text: ' + this.newLocation + ' is now valid for digitization.');
        this.newLocation = '';
      } else {
        this.toastr.error('Failed updating configuration');
      }
    })();
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }
}






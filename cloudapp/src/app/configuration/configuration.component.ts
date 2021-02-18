import {Component, OnInit} from '@angular/core';
import {AppService} from "../app.service";
import {CloudAppConfigService} from "@exlibris/exl-cloudapp-angular-lib";
import {ToastrService} from "ngx-toastr";
import {Configuration} from "../models/configuration";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  configuration: Configuration;
  saving = false;
  newLocation: string;
  private savedOk: boolean = false;
  public showExample: boolean = false;

  constructor(
      private appService: AppService,
      private cloudAppConfigService: CloudAppConfigService,
      private toastr: ToastrService,
      // public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.appService.setTitle('Configuraton');
    this.getConfiguration();
  }

  private getConfiguration() {
    this.cloudAppConfigService.get().subscribe(result => {
      console.log('result(get Configuratrion): ', result);
      if (!result.locationsUsableForDigitization) {
        console.log('!result.locationsUsableForDigitization. New Configuration is created. Result was:', result);
        result = new Configuration();
      }
      this.configuration = result;
      console.log('this.configuration(): ', this.configuration);
    })
  }

  private saveLocations(createNew: boolean) {
    this.saving = true;
    this.cloudAppConfigService.set(this.configuration).subscribe(
        () => {
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
    this.configuration.locationsUsableForDigitization = this.configuration.locationsUsableForDigitization.filter(locationCode => locationCode != removableLocation);
    this.saveLocations(false);
  }

  saveNewLocation() {
    if (this.newLocation != '') {
      this.configuration.locationsUsableForDigitization.push(this.newLocation);
      this.saveLocations(true);
    }
    (async () => {
      while (this.saving) {// wait for post
        await this.delay(1000);
      }
      if (this.savedOk) {//no error
        this.toastr.success('Localization code: ' + this.newLocation + ' is now valid for digitization.');
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






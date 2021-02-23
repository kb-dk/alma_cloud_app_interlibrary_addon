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
  public selectedValidationType:string ='';
  public newItemPolicy: string;
  readonly toastTimeOut = 7500;


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
      if (!result.locationsUsableForDigitization && !result.itemPoliciesUsableForDigitization) {
        result = new Configuration();
      }
      if(!result.locationsUsableForDigitization) {
        result.locationsUsableForDigitization = [];
      }
      if(!result.itemPoliciesUsableForDigitization) {
        result.itemPoliciesUsableForDigitization = [];
      }
      this.configuration = result;
      this.selectedValidationType = this.configuration.useLocationCodeAsValidationCriteria? 'L' : 'P';
    })
  }

  private saveConfiguration(createNew: boolean) {
    this.saving = true;

    this.cloudAppConfigService.set(this.configuration).subscribe(
        () => {
          this.savedOk = true;
          if(!createNew) {
            this.toastr.success("Configuration updated.", '', {timeOut: this.toastTimeOut});
          }
        },
        err => {
          this.saving = false;
          this.savedOk = false;
          console.log('err.message(): ', err.message);
          this.toastr.error(err.message, 'Error', {timeOut:this.toastTimeOut});
        },
        () => this.saving = false
    );
  }

  removeLocationCode(removableLocation: String) {
    this.configuration.locationsUsableForDigitization = this.configuration.locationsUsableForDigitization.filter(locationCode => locationCode != removableLocation);
    this.saveConfiguration(false);
  }

  removeItemPolicy(removableItemPolicy: String) {
    this.configuration.itemPoliciesUsableForDigitization = this.configuration.itemPoliciesUsableForDigitization.filter(itemPolicy => itemPolicy != removableItemPolicy);
    this.saveConfiguration(false);
  }

  saveNewLocation() {
    if (this.newLocation != '') {
      this.configuration.locationsUsableForDigitization.push(this.newLocation);
      this.saveConfiguration(true);
    }
    (async () => {
      while (this.saving) {// wait for post
        await this.delay(1000);
      }
      if (this.savedOk) {//no error
        this.toastr.success('Localization code: ' + this.newLocation + ' is now valid for digitization.', 'Location saved', {timeOut:this.toastTimeOut});
        this.newLocation = '';
      } else {
        this.toastr.error('Failed updating configuration', 'Error', {timeOut:this.toastTimeOut});
      }
    })();
  }

  saveNewItemPolicy() {
    if (this.newItemPolicy != '') {
      this.configuration.itemPoliciesUsableForDigitization.push(this.newItemPolicy);
      this.saveConfiguration(true);
    }
    (async () => {
      while (this.saving) {// wait for post
        await this.delay(1000);
      }
      if (this.savedOk) {//no error
        this.toastr.success('Item policy: ' + this.newItemPolicy + ' is now valid for digitization.', 'item policy saved' , {timeOut:this.toastTimeOut});
        this.newItemPolicy = '';
      } else {
        this.toastr.error('Failed updating configuration', 'Error', {timeOut:this.toastTimeOut});
      }
    })();
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }

  validationTypeChanged(value:string) {//TODO: dø
    this.selectedValidationType= value;
    this.configuration.useLocationCodeAsValidationCriteria = this.selectedValidationType==='L';
    this.saveConfiguration(false);
  }

}






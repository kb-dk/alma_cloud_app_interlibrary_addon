import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, CloudAppTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { TruncatePipe } from "./pipes/truncate.pipe";
import { ExternalLocalizationComponent } from "./external-localization/external-localization.component";
import { TopmenuComponent } from "./topmenu/topmenu.component";
import { SettingsComponent } from "./settings/settings.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExternalLocalizationService } from "./external-localization/external-localization.service";
import { SettingsDialogComponent } from './settings/settings-dialog/settings-dialog.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { SelectEntitiesComponent} from "./multi-select/select-entities/select-entities.component";
import { ConvertToDigitalComponent } from './convert-to-digital/convert-to-digital.component';
import { ConfigurationComponent } from './configuration/configuration.component';


export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

@NgModule({
  declarations: [
    AppComponent,
    TopmenuComponent,
    MainComponent,
    SettingsComponent,
    SettingsDialogComponent,
    ExternalLocalizationComponent,
    TruncatePipe,
    MultiSelectComponent,
    SelectEntitiesComponent,
    ConvertToDigitalComponent,
    ConfigurationComponent,
  ],
  entryComponents: [
    SettingsDialogComponent,
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CloudAppTranslateModule.forRoot(),
    getToastrModule(),
    AlertModule,
  ],
  providers: [
    Title,
    ExternalLocalizationService,
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})

export class AppModule { }

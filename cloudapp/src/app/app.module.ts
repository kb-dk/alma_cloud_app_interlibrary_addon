import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, getTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { TruncatePipe } from "./pipes/truncate.pipe";
import { ExternalLocalizationComponent } from "./external-localization/external-localization.component";
import { TopmenuComponent } from "./topmenu/topmenu.component";
import { SettingsComponent } from "./settings/settings.component";
import { UpdateRequestComponent } from "./update-request/update-request.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExternalLocalizationService } from "./external-localization/external-localization.service";
import { ConfigComponent } from './config/config.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    TopmenuComponent,
    SettingsComponent,
    ExternalLocalizationComponent,
    UpdateRequestComponent,
    TruncatePipe,
    ConfigComponent,
    SettingsDialogComponent
  ],
  entryComponents: [
    SettingsDialogComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    getTranslateModule(),
    getToastrModule()
  ],
  providers: [Title, ExternalLocalizationService],
  bootstrap: [AppComponent]
})
export class AppModule { }

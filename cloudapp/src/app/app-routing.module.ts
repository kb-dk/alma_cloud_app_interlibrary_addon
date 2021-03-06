import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ExternalLocalizationComponent } from "./external-localization/external-localization.component";
import { SettingsComponent } from "./settings/settings.component";
import {MultiSelectComponent} from "./multi-select/multi-select.component";
import {ConvertToDigitalComponent} from "./convert-to-digital/convert-to-digital.component";
import {ConfigurationComponent} from "./configuration/configuration.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'external-localization', component: ExternalLocalizationComponent },
  { path: 'convert-to-digital', component: ConvertToDigitalComponent },
  { path: 'multi-select', component: MultiSelectComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'config', component: ConfigurationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule { }

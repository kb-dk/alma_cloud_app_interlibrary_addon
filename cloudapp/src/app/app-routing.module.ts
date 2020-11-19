import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import {ExternalLocalizationComponent} from "./external-localization/external-localization.component";
import {SettingsComponent} from "./settings/settings.component";
import {ConfigComponent} from "./config/config.component";
import {JjComponent} from "./jj/jj.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'external-localization', component: ExternalLocalizationComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'config', component: ConfigComponent },
  { path: 'jj', component: JjComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

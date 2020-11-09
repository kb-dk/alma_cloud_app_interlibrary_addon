import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import {ExternalLocalizationComponent} from "./external-localization/external-localization.component";
import {SettingsComponent} from "./settings/settings.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'external-localization', component: ExternalLocalizationComponent },
  { path: 'settings', component: SettingsComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

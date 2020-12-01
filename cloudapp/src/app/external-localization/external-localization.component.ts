import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppService} from '../app.service';
import {CloudAppEventsService, CloudAppSettingsService, Entity, PageInfo} from '@exlibris/exl-cloudapp-angular-lib';
import {Subject, Subscription} from 'rxjs';
import {concatMap, tap} from "rxjs/operators";
import {ExternalLocalizationService} from "./external-localization.service";
import {Settings} from "../models/settings";

@Component({
  selector: 'app-external-localization',
  templateUrl: './external-localization.component.html',
  styleUrls: ['./external-localization.component.scss']
})

export class ExternalLocalizationComponent implements OnInit, OnDestroy {
  @Input()//make the following instance variable available to parent components to pass data down.
  private pageLoad$: Subscription;
  private pageLoadedSubscription: Subscription;//an object that represents a disposable resource, usually the execution of an Observable
  private pageMetadataSubscription: Subscription;
  private pageLoadedSubject = new Subject<Entity[]>();
  public settings: Settings;
  public pageLoading:boolean;
  private borrowningListCount = 0;
  public pageLoaded$ = this.pageLoadedSubject.asObservable().pipe( //This is where we pipe the data from Alma using entities
      concatMap(entities => this.externalLocationService.externalLinkAttributes$(entities)),
      tap(result => {
        this.borrowningListCount = result.length;
        this.pageLoading = false;
      }),
  );

  constructor(private appService: AppService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,
              private externalLocationService: ExternalLocalizationService)
  { }

  ngOnInit(): void {
    this.appService.setTitle('External localization');
    this.pageLoading = true;
    this.getSettings();
    this.pageMetadataSubscription = this.eventsService.getPageMetadata().subscribe(this.onPageLoad);
    this.pageLoadedSubscription = this.eventsService.onPageLoad(this.onPageLoad);
  }

  private getSettings() {
    this.settingsService.get().subscribe(settings => {
      if(!settings.externalLinkTemplates) {
        settings = new Settings();
      }
      this.settings = settings;
    },
    error => {
      console.log('No settings were loaded');
    });
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageLoadedSubject.next(pageInfo.entities);
  };

  ngOnDestroy(): void {
    this.pageMetadataSubscription.unsubscribe();
    this.pageLoadedSubscription.unsubscribe();
  }

  public settingsExists():boolean {
    return (this.settings && this.settings.externalLinkTemplates && this.settings.externalLinkTemplates.length > 0);
  }


}

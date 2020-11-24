import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { AppService } from '../app.service';
import {
  CloudAppEventsService,
  CloudAppSettingsService,
  Entity,
  PageInfo
} from '@exlibris/exl-cloudapp-angular-lib';
import { Subject, Subscription } from 'rxjs';
import { concatMap, tap } from "rxjs/operators";
import { ExternalLocalizationService } from "./external-localization.service";
import { Settings } from "../models/settings";

@Component({
  selector: 'app-external-localization',
  templateUrl: './external-localization.component.html',
  styleUrls: ['./external-localization.component.scss']
})

export class ExternalLocalizationComponent implements OnInit, OnDestroy {
  @Input()//make the following instance variable available to parent components to pass data down.
  private pageLoad$: Subscription;
  private pageLoadedSubscription: Subscription;//an object that represents a disposable resource, usually the execution of an Observable
  private pageLoadedSubject = new Subject<Entity[]>();
  public settings: Settings;
  private settingsLoaded:boolean;
  public pageLoading:boolean;
  public pageLoaded$ = this.pageLoadedSubject.asObservable().pipe( //This is where we pipe the data from Alma using entities
      concatMap(entities => this.externalLocationService.externalLinkAttributes$(entities)),
      tap(() => {
        this.pageLoading = false;
      }),
  );

  constructor(private appService: AppService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,
              private externalLocationService: ExternalLocalizationService)
  { }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.appService.setTitle('External localization');
    this.settingsLoaded = false;
    this.pageLoading = true;
    this.getSettings();
    this.pageLoadedSubscription = this.eventsService.onPageLoad(this.onPageLoad);
  }

  private getSettings() {
    this.settingsService.get().subscribe(settings => {
      this.settings = settings as Settings;
      },
      error => {
        console.log('No settings were loaded');
      },
      () => {
        this.settingsLoaded = true;
      }
    );
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageLoadedSubject.next(pageInfo.entities);
  };

  ngOnDestroy(): void {
    this.pageLoadedSubscription.unsubscribe();
  }

  settingsFound():boolean {
    return this.settingsLoaded && this.settings.items.length>0;
  }
}

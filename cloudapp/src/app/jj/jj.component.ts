import {Component, OnInit} from '@angular/core';
import {
  CloudAppEventsService,
  CloudAppRestService,
  CloudAppSettingsService,
  Entity,
  PageInfo
} from "@exlibris/exl-cloudapp-angular-lib";
import {AppService} from "../app.service";
import {ExternalLocalizationService} from "../external-localization/external-localization.service";
import {Subject, Subscription} from "rxjs";
import {concatMap, tap} from "rxjs/operators";
import {ExternalLinkAttributes} from "../models/external-link-attributes";
import {CloudAppIncomingEvents} from "@exlibris/exl-cloudapp-angular-lib/lib/events/incoming-events";

@Component({
  selector: 'app-jj',
  templateUrl: './jj.component.html',
  styleUrls: ['./jj.component.scss']
})

export class JjComponent implements OnInit {

  private pageLoad$: Subscription;
  private pageLoadedSubscription: Subscription;//an object that represents a disposable resource, usually the execution of an Observable
  private pageLoadedSubject = new Subject<Entity[]>();
  private pageloaded: boolean = false;


  pageLoaded$ = this.pageLoadedSubject.asObservable().pipe(
    concatMap(entities => this.externalLocationService.externalLinkAttributes$(entities)),
    tap(() => this.pageloaded = true)
  );

  constructor(private restService: CloudAppRestService,
              private appService: AppService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,
              private externalLocationService: ExternalLocalizationService)
  { }

  ngOnInit(): void {
    this.pageLoadedSubscription = this.eventsService.onPageLoad(this.onPageLoad);
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageloaded = false;
    this.pageLoadedSubject.next(pageInfo.entities);
  };

  ngOnDestroy(): void {
    this.pageLoadedSubscription.unsubscribe();
  }

}

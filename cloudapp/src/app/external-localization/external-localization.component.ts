import {Component, Input, OnInit} from '@angular/core';
import { AppService } from '../app.service';
import {
  Entity,
  CloudAppEventsService,
  CloudAppRestService,
  CloudAppSettingsService
} from '@exlibris/exl-cloudapp-angular-lib';
import { from, Subscription, throwError} from 'rxjs';
import { AttributesFromAlma } from "./attributesFromAlma";
import { map } from "rxjs/operators";
import { ExternalLocalizationService } from "./external-localization.service";
import { Settings } from "../models/settings";

@Component({
  selector: 'app-external-localization',
  templateUrl: './external-localization.component.html',
  styleUrls: ['./external-localization.component.scss']
})

export class ExternalLocalizationComponent implements OnInit {
  @Input()
  private pageLoad$: Subscription;
  private pageLoaded:boolean = false;
  entities: Entity[];
  attributesFromAlmaArray: AttributesFromAlma[]=[];
  private settings: Settings;

  constructor(private restService: CloudAppRestService,
              private appService: AppService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,
              private externalLocationService: ExternalLocalizationService){
  }

  ngOnInit() {
    this.appService.setTitle('External localization');
    this.getSettings();
    this.getBibAttributes();
  }


  private getBibAttributes() {
    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {
      this.pageLoaded = false;
      var $retrieveLinkAttributes = from(pageInfo.entities).pipe(
          map((entity, index) => {
            //TODO JJEG: Mangler tjek for om hentede attributter findes (catchError block)
            //Brug evt. concatMap
            this.getRequestFromAlma(entity.link).subscribe(result => {
              let mmsId = result.mms_id;
              let title = result.title;
              if (mmsId) {
                this.getBibrecordFromAlma(mmsId).subscribe(bibRecord => {//isbn exist only on another Alma API
                  let isbn = bibRecord.isbn ;
                  let author = bibRecord.author;
                  let tmpNetpunktEntry = this.addNewNetpunktEntry(index, title, mmsId, isbn, author );
                })
              }
            })
          })
      );
      let subscription = $retrieveLinkAttributes.subscribe();
    });
  }

  private getSettings() {
    this.settingsService.get().subscribe(settings => {
      this.settings = settings as Settings;
    });
  }

///bibs/99122212568805763/requests/17242965100005763
  private getRequestFromAlma = link => {
    return this.restService.call(link);
  }

  ///bibs/{mmsId}
  private getBibrecordFromAlma = mmsId => {
    let link = '/bibs/' + mmsId;
    return this.restService.call(link);
  }


  private addNewNetpunktEntry( index: number, title: string, mms_id:string, isbn:string,  author:string) {
    let netpunktEntry = new AttributesFromAlma(index, title, mms_id, isbn, author);
    this.attributesFromAlmaArray.push(netpunktEntry);
    return netpunktEntry;
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }


/*
  private onInitTest() {//TODO: Bare testkode
    let $srcArray = from([1, 2, 3, 4]);
    let subscription =  $srcArray
        .pipe(map(val => { return val * 2}))
        .subscribe(val => { console.log(val)});
    console.log("before: " + subscription);
    subscription.unsubscribe();
    console.log("after: " + subscription);

  }
*/


}

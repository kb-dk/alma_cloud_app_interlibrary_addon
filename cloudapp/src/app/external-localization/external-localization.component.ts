import {Component, Input, OnInit} from '@angular/core';
import { AppService } from '../app.service';
import {
  Entity,
  CloudAppEventsService,
  CloudAppRestService,
  CloudAppSettingsService
} from '@exlibris/exl-cloudapp-angular-lib';
import {from, Subscription, throwError} from 'rxjs';
import { NetpunktEntry } from "./netpunktEntry";
import {catchError, concatMap, map} from "rxjs/operators";
import {ExternalLocalizationService} from "./external-localization.service";
import {Settings} from "../models/settings";
import {ExternalLinkTemplate} from "../models/externalLinkTemplate";
import {SearchCriteria} from "../models/externalLinkTemplate";

@Component({
  selector: 'app-external-localization',
  templateUrl: './external-localization.component.html',
  styleUrls: ['./external-localization.component.scss']
})

export class ExternalLocalizationComponent implements OnInit {
  @Input()
  private pageLoad$: Subscription;
  private pageLoaded:boolean = false;
  ids = new Set<string>();
  entities: Entity[];
  netpunktEntries: NetpunktEntry[]=[];
  private settings: Settings;
  private externalLinkTemplate: ExternalLinkTemplate;

  constructor(private restService: CloudAppRestService,
              private appService: AppService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,
              private externalLocationService: ExternalLocalizationService){
  }

  ngOnInit() {
    this.appService.setTitle('External localization');
    this.onInit();
  }


  private onInit() {
    this.getSettings();
    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {
      this.pageLoaded = false;
      var $retrieveLinkAttributes = from (pageInfo.entities).pipe(
          map((entity, index) => {
            this.getRequestFromAlma(entity.link).subscribe(result =>{
              let mmsId = result.mms_id;
              let title = result.title;
              let isbn;
              if (mmsId) {
                this.getBibrecordFromAlma(mmsId).subscribe(bibRecord => {
                  isbn = bibRecord.isbn;
                  let tmpNetpunktEntry =  this.addNewNetpunktEntry(title, mmsId, index);
                  tmpNetpunktEntry.setIsbn(isbn);
                })
              }
            })
          })
      );
      let subscription =  $retrieveLinkAttributes.subscribe();
      });
  }


  private getSettings() {
    this.settingsService.get().subscribe(settings => {
      let tmpSettings = settings as Settings;
      let externalLinkTemplate: ExternalLinkTemplate = new ExternalLinkTemplate(tmpSettings.searchCriteria, tmpSettings.partOfUrlBeforeSearchCriteria, tmpSettings.partOfUrlAfterSearchCriteria);
      this.externalLinkTemplate = externalLinkTemplate;
      this.settings = settings as Settings;//TODO: skal måske ikke bruges, hvis ovenstående kan virke.
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


  private addNewNetpunktEntry(title: string, mms_id:string, index: number) {
    let netpunktTitleLink = 'http://test.netpunkt.dk/search/work?search_block_form=term.default+adj+' + '%22' + title + '%22' + '&page_id=danbib-search'
    let netpunktMmsidLink = 'http://test.netpunkt.dk/search/work?search_block_form=term.default+adj+' + '%22' + mms_id + '%22' + '&page_id=danbib-search'
    let netpunktEntry = new NetpunktEntry(index, title, mms_id, netpunktTitleLink, netpunktMmsidLink);
    this.netpunktEntries.push(netpunktEntry);
    return netpunktEntry;
  }



  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  onEntitySelected(event) {
    if (event.checked) this.ids.add(event.mmsId);
    else this.ids.delete(event.mmsId);
  }

  private onInitTest() {//TODO: Bare testkode
    let $srcArray = from([1, 2, 3, 4]);
    let subscription =  $srcArray
        .pipe(map(val => { return val * 2}))
        .subscribe(val => { console.log(val)});
    console.log("before: " + subscription);
    subscription.unsubscribe();
    console.log("after: " + subscription);

  }


}

import { Component, OnInit } from '@angular/core';
import {
  CloudAppEventsService,
  CloudAppRestService,
  CloudAppSettingsService,
  Entity, PageInfo
} from "@exlibris/exl-cloudapp-angular-lib";
import {AppService} from "../app.service";
import {ExternalLocalizationService} from "../external-localization/external-localization.service";
import {combineLatest, forkJoin, from, iif, Observable, of, Subject, Subscription, throwError} from "rxjs";
import {catchError, concatMap, map, switchMap} from "rxjs/operators";
import {ExternalLinkAttributes, ExternalLinkAttributesImpl} from "../models/external-link-attributes";
import {CloudAppIncomingEvents} from "@exlibris/exl-cloudapp-angular-lib/lib/events/incoming-events";
import onPageLoad = CloudAppIncomingEvents.onPageLoad;




@Component({
  selector: 'app-jj',
  templateUrl: './jj.component.html',
  styleUrls: ['./jj.component.scss']
})
export class JjComponent implements OnInit {
  private pageLoad$: Subscription;
  externalLinkAttributes: ExternalLinkAttributes[] = [];
  private pageLoadSubscription: Subscription;//an object that represents a disposable resource, usually the execution of an Observable
  private pageLoadedSubject = new Subject<Entity[]>();


  externalLinkAttributes$ = (entities: Entity[]) =>{
    let calls = entities.map(entity => {
        return this.getDataFromAlma(entity.link);
    })

    return (calls.length === 0) ?
        of([]) :
        forkJoin(calls).pipe(
            catchError(err => this.handleError(err)),
            map(almaData => almaData.map((almaData, index) => this.externalLinkAttributesFromAlmaRequest(almaData, index))),
        );
  }

  private externalLinkAttributesFromAlmaRequest = (almaData, index) => almaData===null ?
      {id:index, title:'unknown title', mms_id: '', isbn: 'unknown isbn', author: 'unknown author'}:
      {id:index, title:almaData.requestData.title, mms_id: almaData.requestData.mms_id, isbn: almaData.bibData.isbn, author: almaData.bibData.author};


  private getDataFromAlma = (link) => this.restService.call(link).pipe(
      concatMap(requestResult => <Observable<any>>(
              this.restService.call(`/bibs/${requestResult.mms_id}`)
                  .pipe(
                      map(bibResult => ({
                        requestData: requestResult,
                        bibData: bibResult
                      }))
                  )
          )
      )
  );


  private handleError = (err: any) => {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  };


  pageLoaded$ = this.pageLoadedSubject.asObservable().pipe(
    concatMap(entities => this.externalLinkAttributes$(entities))

 /*     map((entity, index) => {
        //TODO JJEG: Mangler tjek for om hentede attributter findes (catchError block)
        //Brug evt. concatMap
        this.getRequestFromAlma(entity.link).subscribe(result => {

          console.log(result);
          let externalLinkAttribute = {id:index, title:'unknown title', mms_id: result.mms_id, isbn: 'unknown isbn'}
          this.externalLinkAttributes.push(externalLinkAttribute);
    })
      })
 */ );


  constructor(private restService: CloudAppRestService,
              private appService: AppService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,)
  { }

  ngOnInit(): void {
    this.pageLoadSubscription = this.eventsService.onPageLoad(this.onPageLoad);
  }

  onPageLoad = (pageInfo: PageInfo) => {
    console.log('JJ pageloaded')
    this.pageLoadedSubject.next(pageInfo.entities);
  };

  ngOnDestroy(): void {
    this.pageLoadSubscription.unsubscribe();
  }

/*  this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {
      var $retrieveLinkAttributes = from(pageInfo.entities).pipe(
          map((entity, index) => {
            //TODO JJEG: Mangler tjek for om hentede attributter findes (catchError block)
            //Brug evt. concatMap
            this.getRequestFromAlma(entity.link).subscribe(result => {

              console.log(result);
              let externalLinkAttribute = {id:index, title:'unknown title', mms_id: result.mms_id, isbn: 'unknown isbn'}
              this.externalLinkAttributes.push(externalLinkAttribute);

              /!*
                            let mmsId = result.mms_id;
                            let title = result.title;
                            if (mmsId) {
                              this.getBibrecordFromAlma(mmsId).subscribe(bibRecord => {//isbn exist only on another Alma API
                                let isbn = bibRecord.isbn ;
                                let author = bibRecord.author;
                              })
                            }
              *!/
            })
          })
      );
      let subscription = $retrieveLinkAttributes.subscribe();
    });
 */


///bibs/99122212568805763/requests/17242965100005763
  private getRequestFromAlma = (link) => {
    return this.restService.call(link);
  }

  ///bibs/{mmsId}
  private getBibrecordFromAlma = mmsId => {
    let link = '/bibs/' + mmsId;
    return this.restService.call(link);
  }


}

import {Injectable} from "@angular/core";
import {CloudAppRestService, Entity} from "@exlibris/exl-cloudapp-angular-lib";
import {forkJoin, Observable, of, throwError} from "rxjs";
import {catchError, concatMap, map, toArray} from "rxjs/operators";

@Injectable()

export class ExternalLocalizationService {

constructor(private restService: CloudAppRestService){
}

    externalLinkAttributesNEW$ = (entities: Entity[]) =>{
        return entities.map(entity => {
            this.getDataFromAlma(entity.link).pipe(
                map(almaData => almaData.map((almaData, index) => this.externalLinkAttributesFromAlmaRequest(almaData, index))),
            );
        })

/*
        return (calls.length === 0) ?
            of([]) :
            forkJoin(calls).pipe(
                catchError(err => this.handleError(err)),
                map(almaData => almaData.map((almaData, index) => this.externalLinkAttributesFromAlmaRequest(almaData, index))),
            );
*/
    }

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


    getDataFromAlma = (link) => this.getRequestFromAlma(link).pipe(
        concatMap(requestResult => <Observable<any>>(
                this.getBibrecordFromAlma(requestResult.mms_id)
                    .pipe(
                        map(bibResult => ({
                            requestData: requestResult,
                            bibData: bibResult
                        }))
                    )
            )
        )
    );

///bibs/99122212568805763/requests/17242965100005763
    private getRequestFromAlma = (link) => {
        return this.restService.call(link);
    }

///bibs/{mmsId}
    private getBibrecordFromAlma = mmsId => {
        let link = '/bibs/' + mmsId;
        return this.restService.call(link);
    }

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


}


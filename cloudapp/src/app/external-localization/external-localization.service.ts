import {Injectable} from "@angular/core";
import {CloudAppRestService, Entity, EntityType} from "@exlibris/exl-cloudapp-angular-lib";
import {forkJoin, from, iif, Observable, of, throwError} from "rxjs";
import {catchError, concatMap, map, switchMap} from "rxjs/operators";
import {AppService} from "../app.service";
import {AttributesFromAlma} from "./attributesFromAlma";

@Injectable()

export class ExternalLocalizationService {

constructor(private restService: CloudAppRestService){
}

    data$ = (entities: Entity[]) => {
        let calls = entities.map(entity => {
            return this.getDataFromAlma(entity.link);
        })
        return (calls.length === 0) ?
            of([]) :
            forkJoin(calls).pipe(
                catchError(err => this.handleError(err)),
                // map(calls => calls.map((call, index) => this.attributesFromAlmaCall(call, index))),
                // map(calls => calls.map((call, index) => this.attributesFromAlmaCall(call, index))),
            ).subscribe(finalData =>
                console.log(finalData)
            );
    }


/*
    private attributesFromAlmaCall(call: any, index: any) => call === null?
        {id: index, title: call.data.requestData.    }

*/

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



/*
    getData(id: String): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/path/${id}`).pipe(
            concatMap(
                evt =>
                    <Observable<any>>(
                        this.http
                            .get<any>(`${this.baseUrl}/path/relatedby/${evt.child_id}`)
                            .pipe(
                                map(resp => ({
                                    evtData: evt,
                                    childData: resp
                                }))
                            )
                    )
            ),
            // retry(3),
            // catchError(this.handleError("getData", []))
        );
*/

/*
    switchMap(request => iif(() => request.mms_id !== undefined,
    this.getRequestFromAlma(`/bibs/${request.mms_id}`))
*/


/*
    this.dataService.getPlayerData("heunetik").pipe(
        switchMap(data => this.dataService.getLifetimeStats(data.payload.guid(.pipe(map(innerData => [data, innerData])))
).subscribe(finalData => {
    console.log(finalData);
});
*/

// To get the user address from the page entities
// there is the need for two more API call (There might be other ways)
// get the requests from the link string in the entity object (if there is user info in it)
// then get the user info from the user_primary_id or user_id field and extract the address from the response

    private attributesFromAlmaRequest = (link) => this.getRequestFromAlma(link).pipe(
        switchMap(request => iif(() => request.mms_id !== undefined,
            this.getRequestFromAlma(`/bibs/${request.mms_id}`),
            of(null)
        ))
    );


private getRequestFromAlma = link => this.restService.call(link);

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


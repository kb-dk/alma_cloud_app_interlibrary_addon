import {Injectable} from "@angular/core";
import {CloudAppRestService, Entity} from "@exlibris/exl-cloudapp-angular-lib";
import {from, throwError} from "rxjs";
import {concatMap, map} from "rxjs/operators";

@Injectable()

export class ExternalLocalizationService {

// constructor(private restService: CloudAppRestService){
constructor(){
}

// To get the user address from the page entities
// there is the need for two more API call (There might be other ways)
// get the requests from the link string in the entity object (if there is user info in it)
// then get the user info from the user_primary_id or user_id field and extract the address from the response

/*
users$ = (entities: Entity[]) => {
    return from(entities).pipe(
        catchError(err => this.handleError(err)),
        concatMap(entity => this.getAlmaRequest(entity)),
        concatMap(request => this.getAlmaUser(request)),
        map((almaUser, index) => this.extractUserFromAlmaUser(almaUser, index)),
        toArray()
    );
};
*/

/*
 getAlmaRequest = (entity: Entity) => from([entity]).pipe(
    map(entity => entity.link),
    concatMap(link => this.getRequestFromAlma(link))
);

private getAlmaUser = (request) => from([request]).pipe(
    map(request => request.hasOwnProperty('user_primary_id') ? request.user_primary_id : request.user_id),
    concatMap(id => this.getUserFromAlma(id))
);

private getRequestFromAlma = link => this.restService.call(link);

private getUserFromAlma = id => this.restService.call(`/users/${id}`);
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
*/



}


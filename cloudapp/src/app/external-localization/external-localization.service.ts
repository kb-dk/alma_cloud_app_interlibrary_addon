import { Injectable } from "@angular/core";
import {CloudAppRestService, Entity, EntityType} from "@exlibris/exl-cloudapp-angular-lib";
import { forkJoin, of, throwError } from "rxjs";
import {catchError, map} from "rxjs/operators";
import { ExternalLinkAttributesImpl } from "../models/external-link-attributes";

@Injectable()

export class ExternalLocalizationService {

constructor(private restService: CloudAppRestService){
}

    externalLinkAttributes$ = (entities: Entity[]) =>{
        let calls = entities
            .filter(entity => [EntityType.BORROWING_REQUEST].includes(entity.type))
            .map(entity => {
            return this.getRequestFromAlma(entity.link);
        });

        return (calls.length === 0) ?
            of([]) :
            forkJoin(calls).pipe(
                catchError(err => this.handleError(err)),
                map(almaData => almaData.map((almaData, index) => this.extractLinkAttributesFromAlmaData(almaData, index))),
            );
    };

    private extractLinkAttributesFromAlmaData = (almaData, index) => {
        const title:string = this.cleanInput(almaData.title);
        const isbn:string =  this.cleanInput(almaData.isbn);
        const author:string = this.cleanInput(almaData.author);
        return new ExternalLinkAttributesImpl(index, title, isbn, author);
    };

    private cleanInput = (almaAttribute) => {
        return almaAttribute === undefined || null ? '' : almaAttribute;
    };

///bibs/99122212568805763/requests/17242965100005763
    private getRequestFromAlma = (link) => {
        return this.restService.call(link);
    };

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


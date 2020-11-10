export class ExternalLinkTemplate {
    searchCriteria: SearchCriteria;
    partOfUrlBeforeSearchCriteria: string;
    partOfUrlAfterSearchCriteria: string;

    constructor(searchCriteria?:string, uriPartOne?:string, uriPartTwo?:string) {
        let test: SearchCriteria = SearchCriteria[searchCriteria];
        this.searchCriteria = test || SearchCriteria.NONE;
        this.partOfUrlBeforeSearchCriteria = uriPartOne || '';
        this.partOfUrlAfterSearchCriteria = uriPartTwo || '';
        console.log('string: ' + searchCriteria)
        console.log('Enum: ' + this.searchCriteria)
        console.log('Enum string : ' + SearchCriteria[this.searchCriteria]);
    }

}

export enum SearchCriteria {
    NONE = "None",
    ISBN = "Isbn",
    TITLE = "Title",
    MMS_ID = "MmsId"
}

export class ExternalLinkTemplate {
    searchCriteria: SearchCriteria;
    partOfUrlBeforeSearchCriteria: string;
    partOfUrlAfterSearchCriteria: string;

    constructor(searchCriteria?:SearchCriteria, uriPartOne?:string, uriPartTwo?:string) {
        this.searchCriteria = searchCriteria || SearchCriteria.NONE;
        this.partOfUrlBeforeSearchCriteria = uriPartOne || '';
        this.partOfUrlAfterSearchCriteria = uriPartTwo || '';
    }

}

export enum SearchCriteria {
    NONE = "None",
    ISBN = "Isbn",
    TITLE = "Title",
    MMS_ID = "MmsId"
}

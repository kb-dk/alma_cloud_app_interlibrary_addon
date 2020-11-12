export class ExternalLinkTemplate {
    linkName: string;
    id: number;
    searchCriteria: SearchCriteria;
    partOfUrlBeforeSearchCriteria: string;
    partOfUrlAfterSearchCriteria: string;

    constructor(linkname?: string, searchCriteria?:string, uriPartOne?:string, uriPartTwo?:string) {
        this.linkName = linkname || '';
        this.id = new Date().getMilliseconds();//'Unik' id
        let test: SearchCriteria = SearchCriteria[searchCriteria];
        this.searchCriteria = test || SearchCriteria.NONE;
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

export class ExternalLinkTemplate {
    id: number;
    linkName: string;
    searchCriteria: SearchCriteria;
    partOfUrlBeforeSearchCriteria: string;
    partOfUrlAfterSearchCriteria: string;

    constructor(linkname?: string, searchCriteria?:string, partOfUrlBeforeSearchCriteria?:string, partOfUrlAfterSearchCriteria?:string) {
        this.linkName = linkname || '';
        this.id = new Date().getMilliseconds();//'Unique' id
        let test: SearchCriteria = SearchCriteria[searchCriteria];
        this.searchCriteria = test || SearchCriteria.NONE;
        this.partOfUrlBeforeSearchCriteria = partOfUrlBeforeSearchCriteria || '';
        this.partOfUrlAfterSearchCriteria = partOfUrlAfterSearchCriteria || '';
    }
}

export enum SearchCriteria {
    NONE = 0,
    ISBN = 1,
    TITLE = 2,
    MMS_ID = 3,
    AUTHOR = 4
}

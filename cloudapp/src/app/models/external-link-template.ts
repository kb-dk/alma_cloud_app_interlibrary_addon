export class ExternalLinkTemplate {
    id: number;
    linkName: string;
    searchCriteriaType: SearchCriteriaType;
    startOfLink: string;
    endOfLink: string;

    constructor(linkname?: string, searchCriteriaType?:string, startOfLink?:string, endOfLink?:string) {
        this.linkName = linkname || '';
        this.id = Math.floor(Math.random()*(100000-1+1)+1);//'Unique' id
        this.searchCriteriaType = SearchCriteriaType[searchCriteriaType] || SearchCriteriaType.NONE;
        this.startOfLink = startOfLink || '';
        this.endOfLink = endOfLink || '';
    }

    public toString(): string {
        return 'id: ' + this.id
            + ' linkName: ' + this.linkName
            + ' searchCriteriaType: ' + this.searchCriteriaType
            + ' startOfLink: ' + this.startOfLink
            + ' endOfLink ' + this.endOfLink
            ;
    }

}

export enum SearchCriteriaType {
    NONE = 0,
    ISBN = 1,
    TITLE = 2,
    AUTHOR = 3,
    ISSN = 4
}

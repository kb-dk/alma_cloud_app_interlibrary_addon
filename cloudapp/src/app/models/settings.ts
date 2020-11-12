import {ExternalLinkTemplate, SearchCriteria} from "./externalLinkTemplate";

export class Settings {
  showValue: boolean = false;
  pageSize: number = 10;
  searchCriteria: string = 'None' ;
  partOfUrlBeforeSearchCriteria: string = '';
  partOfUrlAfterSearchCriteria: string = '';
  items: ExternalLinkTemplate[] = [];

}

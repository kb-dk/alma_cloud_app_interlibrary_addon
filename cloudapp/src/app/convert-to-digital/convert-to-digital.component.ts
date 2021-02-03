import {Subscription} from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  CloudAppEventsService,
  CloudAppRestService,
  Entity,
  EntityType,
  HttpMethod,
  PageInfo,
  Request,
  RestErrorResponse
} from '@exlibris/exl-cloudapp-angular-lib';
import {AppService} from "../app.service";
import {FormBuilder} from "@angular/forms";
import {FormGroupConvertHelper} from "./formGroupConvertHelper";
import {ToastrService} from "ngx-toastr";
import * as url from "url";

@Component({
  selector: 'app-convert-to-digital',
  templateUrl: './convert-to-digital.component.html',
  styleUrls: ['./convert-to-digital.component.scss']
})
export class ConvertToDigitalComponent implements OnInit, OnDestroy {
  private pageLoad$: Subscription;
  pageEntities: Entity[];
  private _apiResultBorrowingRequestLink: any;
  private _resultFromGetUserRequestApiCall: any;

  citationTypeCode:string;
  borrowingRequestSelected: boolean = false;
  showBorrowingRequestSelectbox : boolean = false;
  showBibSelectbox : boolean = false;
  isChangeable :boolean = false;
  changeLog : string;
  selectedBorrowingRequestlink: string;
  infoText:string;
  selectedUserRequestlink:string;
  hasApiResult: boolean = false;
  loading = false;
  selectedItemTitle: string = '';
  showExample: boolean = false;
  formConvertHelper: FormGroupConvertHelper;
  toTextArea:any = '';
  selectedBorrowingRequest: string = '';
  tmpItemId: string = '';
  itemIdFoundOnAlmaPage:boolean = false;

  public bookToArticalSwap:Map<string, string> = new Map([
    ["BK", "CR"],
    ["CR", "BK"],
  ]);

  public citationTypeMap:Map<string, string> = new Map([
    ["BK", "book"],
    ["CR", "article"],
  ]);

  constructor(private appService: AppService,
              private restService: CloudAppRestService,
              private eventsService: CloudAppEventsService,
              private toastr: ToastrService,
              private formBuilder: FormBuilder)
  { }

  ngOnInit() {
    this.appService.setTitle('Convert Borrowing Request to Digitization');
    this.formConvertHelper = new FormGroupConvertHelper();
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
    this.tmpItemId = ""
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  get apiResultBorrowingRequestLink() {
    return this._apiResultBorrowingRequestLink;
  }

  set apiResultBorrowingRequestLink(result: any) {
    this._apiResultBorrowingRequestLink = result;
    this.hasApiResult = result && Object.keys(result).length > 0;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.itemIdFoundOnAlmaPage = false;
    this.pageEntities = pageInfo.entities;
    if(!this.borrowingRequestSelected){
      this.initPage(pageInfo);
    }
    const numberOfEntities = this.pageEntities.length;
    if(numberOfEntities >= 1){
      const typeOfFirstEntity = this.pageEntities[0].type;
      if(typeOfFirstEntity === EntityType.BORROWING_REQUEST) {
        this.handleBorrowingRequestTypeEntities(numberOfEntities, pageInfo);
      }else if(typeOfFirstEntity === EntityType.ITEM){
        this.handleItemTypeEntities();
        // }else if(typeOfFirstEntity === EntityType.BIB_MMS){
      //   this.handleBibData(numberOfEntities, pageInfo);
      }
    }
  }

  private handleItemTypeEntities() {
    this.toastr.success("handleItemTypeEntities")
    this.showItemType = this.pageEntities[0].type;
    this.showNumberOfItem = this.pageEntities.length;
    if(this.pageEntities.length== 1){
      const newTmpItemId = this.pageEntities[0].id;
      if (this.tmpItemId !== newTmpItemId) {
        this.itemIdFoundOnAlmaPage = true;
        this.toastr.success('ItemId updated from ' + this.tmpItemId + ' to ' + newTmpItemId);
        this.tmpItemId = newTmpItemId;
      }
    }
  }

  private handleBorrowingRequestTypeEntities(numberOfEntities: number, pageInfo: PageInfo) {
    if (numberOfEntities > 1) {
      this.infoText = 'Select Borrowing Request';
      this.showBorrowingRequestSelectbox = true;
    } else {
      this.findBorrowingRequestData(pageInfo.entities[0]);
    }
  }

  private initPage(pageInfo: PageInfo) {
    this.infoText = "";
    this.apiResultBorrowingRequestLink = Object.create(null);
    this.loading = false;
    this.isChangeable = false;
    this.showBorrowingRequestSelectbox = false;
    this.showBibSelectbox = false;
    this.changeLog = "";
    this.borrowingRequestSelected = false;
    this.selectedBorrowingRequest = '';
/*
    console.log('Class: ConvertToDigitalComponent, Function: onPageLoad, Line 84 JSON.stringify(pageInfo)(): '
        , JSON.stringify(pageInfo));
*/
  }

  findBorrowingRequestData(entity : Entity){
    this.borrowingRequestSelected = true;
    this.selectedBorrowingRequestlink = entity.link;
    this.restService.call(entity.link).subscribe(result => {
      this.apiResultBorrowingRequestLink = result;
      this.selectedUserRequestlink = JSON.stringify(result ['user_request']['link']);
      this.citationTypeCode = result['citation_type']['value'];
      if(result['status']['value'] === 'REQUEST_CREATED_BOR'){
        this.updateFormWithRequestValues(result);
        this.selectedItemTitle = '<b>Selected item:</b> ' + entity.description;
        this.infoText = 'Find physical item and copy MMS ID to the field below';
        // this.infoText = 'Find local ressource with "View Local Ressource" for the selected item in Alma';
        this.isChangeable = true;
        this.showBorrowingRequestSelectbox = false;
        this.selectedBorrowingRequest = JSON.stringify(result);
        this.toTextArea= "BORROWING-REQUEST" + this.selectedBorrowingRequest;
      }else{
        this.infoText = 'Borrowing request with status "'+result['status']['desc'] +'" can\'t be changed';
      }
    });
  }

  private updateFormWithRequestValues(result) {
    let userId: string = JSON.stringify(result['requester']['value']);
    let requestId: string = JSON.stringify(result['request_id']);
    this.formConvertHelper.updateFormWithRequestData(userId, requestId);
  }


  private sendCreateRequest({ url, requestBody }: { url: string; requestBody: any; }) {
    let request: Request = {
      url,
      method: HttpMethod.POST,
      requestBody
    };
    console.log('requestBody(sendCreateRequest (ORIGINAL)): ', requestBody);
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResultBorrowingRequestLink = result;
        // replace new id with request_id
        this.changeLog = this.changeLog.replace('Creating new request ...','Created new request (' + (this.apiResultBorrowingRequestLink['request_id']) + ')<br>');
        this.hasApiResult = true;
        this.toastr.success("request ok");
      },
      error: (e: RestErrorResponse) => {
        this.apiResultBorrowingRequestLink = {};
        this.changeLog = this.changeLog.replace('Deleted old request','Not deleting old request');
        this.changeLog = this.changeLog.replace('Creating new request ...','<b>' + e.message + '</b><br>');
        this.toastr.error('<b>Failed to create resource sharing request</b>' + this.changeLog);
        this.infoText ="";
        this.refreshPage();
      }
    });
  }

  sendDeleteRequest(deleteUrl: string) {
    let request: Request = {
      url : deleteUrl,
      method: HttpMethod.DELETE,
      requestBody : null
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.loading = false;
        this.toastr.success('<b>Success changing types!</b>\n' +this.changeLog);
        if(this.showBorrowingRequestSelectbox){
          this.refreshPage();
        }
      },
      error: (e: RestErrorResponse) => {
        this.apiResultBorrowingRequestLink = {};
        this.toastr.error('<b>Failed to delete resource sharing request</b> <br>' +e.message + this.changeLog);
        this.refreshPage();
      }
    });
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  refreshPage = () => {
    this.loading = true;
    this.eventsService.refreshPage().subscribe({
      error: e => {
        console.error(e);
        this.toastr.error('Failed to refresh page');
      },
      complete: () => this.loading = false
    });
  }
  showItemType: any;
  showNumberOfItem: any;

  submit() {
    const message = 'Raw value: ' + JSON.stringify(this.formConvertHelper.getForm().getRawValue());
    this.toTextArea = message;
    this.convertToDigitizationRequest();

  }

  convertToDigitizationRequest() {
        // ?user_id_type=all_unique&mms_id=99122724060705763&item_pid=231907048530005763&apikey=l8xxc1629b20fc544089a474aa348651898f

    var paramString = "?user_id_type=all_unique&mms_id=" + this.formConvertHelper.getMmsId() + "&item_pid=" + this.formConvertHelper.getItemId();
    console.log('paramString(): ', paramString);

    var getUserRequestUrl = '/' + this.selectedUserRequestlink.split('/').slice(3).join('/').replace('"','') + paramString;
    console.log('getUserRequestUrl(): ', getUserRequestUrl);
    this.restService.call(getUserRequestUrl).subscribe(result => {
      this._resultFromGetUserRequestApiCall = JSON.stringify(result);
      const requestBody = {...this.createDigitizationRequestBody()};
      var paramString = "?user_id_type=all_unique&mms_id=" + this.formConvertHelper.getMmsId() + "&item_pid=" + this.formConvertHelper.getItemId();
      const url:any = '/almaws/v1/users/' + this.apiResultBorrowingRequestLink['requester']['value'] + '/requests' + paramString;
      console.log('url(): ', url);// Ex: /almaws/v1/users/88118796/requests
      this.toTextArea = "DIGITIZATION" + JSON.stringify(requestBody);
      this.sendCreateRequest( {url, requestBody});
    });
  }

  resetForm() {
    this.changeType();
    // this.ngOnInit();
    //this.onLoadEntity(this.pageEntities[0]); TODO: spiller ikke!!!
    //this.formConvertHelper = new FormGroupConvertHelper();
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }

  createDigitizationRequestBody() {
    var digitizationRequestBody = Object.create(null);
    this.addProperty(digitizationRequestBody, "user_primary_id", this.apiResultBorrowingRequestLink['requester']['value']);
    this.setLastInterestDate(digitizationRequestBody);
    this.addProperty(digitizationRequestBody,"request_type","DIGITIZATION");
    this.setRequestSubtype(digitizationRequestBody);
    this.addProperty(digitizationRequestBody, 'mms_id', this.formConvertHelper.getMmsId()); //from submittet form
    this.addProperty(digitizationRequestBody, 'item_id',this.formConvertHelper.getItemId()); //from submittet form
    this.setTargetDestination(digitizationRequestBody);
    this.addProperty(digitizationRequestBody, 'partial_digitization', 'true');
    this.addProperty(digitizationRequestBody, 'chapter_or_article_title', this.apiResultBorrowingRequestLink['title']);
    this.addProperty(digitizationRequestBody, 'chapter_or_article_author', this.apiResultBorrowingRequestLink['author']);
    this.setRequiredPages(digitizationRequestBody);
    this.addProperty(digitizationRequestBody, "date_of_publication", this.apiResultBorrowingRequestLink['year']);
    this.addProperty(digitizationRequestBody, "volume", this.apiResultBorrowingRequestLink['volume']);
    this.addProperty(digitizationRequestBody, "issue", this.apiResultBorrowingRequestLink['issue']);
    this.setCommentWithPublisherAndEditionInfo(digitizationRequestBody);
    return digitizationRequestBody;
  }

  private setRequiredPages(digitizationRequestBody) {
    var requiredPageRangeObject = {
      from_page: this.apiResultBorrowingRequestLink['start_page'],
      to_page: this.apiResultBorrowingRequestLink['end_page']
    };
    var requiredPageRangeArray = [requiredPageRangeObject];
    this.addProperty(digitizationRequestBody, "required_pages_range", requiredPageRangeArray);
  }

  private setTargetDestination(digitizationRequestBody) {
    var targetDestinationObject = Object.create(null);
    this.addProperty(targetDestinationObject, 'value', 'DIGI_DEPT_INST');
    this.addProperty(digitizationRequestBody, 'target_destination', targetDestinationObject);
  }

  private setRequestSubtype(digitizationRequestBody) {
    var requestSubType = Object.create(null);
    this.addProperty(requestSubType, 'value', 'PHYSICAL_TO_DIGITIZATION');
    this.addProperty(digitizationRequestBody, 'request_sub_type', requestSubType);
  }

  private setLastInterestDate(digitizationRequestBody) {
    const lastInterestDate = this.apiResultBorrowingRequestLink['last_interest_date'];
    var date = Object.create(null);
    var defaultDate: Date = new Date("1 1 2099");
    date = lastInterestDate == null ? defaultDate : lastInterestDate;
    this.addProperty(digitizationRequestBody, 'last_interest_date', date);
  }

  private setCommentWithPublisherAndEditionInfo(digitizationRequest) {
    var comment = this._resultFromGetUserRequestApiCall['comment']==null ? '' : this._resultFromGetUserRequestApiCall['comment'];
    const publisher = this.apiResultBorrowingRequestLink['publisher']==null? '' : this.apiResultBorrowingRequestLink['publisher'];
    const edition = this.apiResultBorrowingRequestLink['edition']==null? '' : this.apiResultBorrowingRequestLink['edition'];
    comment  = 'Publisher: ' +  publisher + '  Edition: ' + edition + '  Usercomment: ' + comment;
    this.addProperty(digitizationRequest, 'comment', comment == null ? '' : comment);
  }

  private addProperty(requestObject: {}, key:string, value:any) {
    requestObject[key] = value;
  }

  saveItemIdToForm() {
    this.toastr.error(this.formConvertHelper.getMmsId());
    const findesItemIdPaaForm = this.formConvertHelper.getItemId();
    console.log('findesItemIdPaaForm(): ', findesItemIdPaaForm);
    this.formConvertHelper.updateFormWithMmsAndItemId(this.tmpItemId, this.formConvertHelper.getMmsId())
  }

  changeType(){
    // this.loading = true;
    this.isChangeable = false;
    const postBody = { ...this.apiResultBorrowingRequestLink }
    this.deleteIrrelevantFields(postBody);
    if(this.citationTypeCode === 'BK'){//bør kunne fjernes, når der er ryddet op.
      this.changeToArticle(postBody);
    }
    var url = this.selectedBorrowingRequestlink.split('/').slice(0, -1).join('/');// /users/88118796/resource-sharing-requests
    console.log('Gør klar til at sende create med url(): ', url);
    this.hasApiResult = false;
    this.sendCreateRequest({ url, requestBody: postBody});
    // wait for post
    (async () => {
      while (!this.hasApiResult) { // The loop is not for waiting for post request to end.
        await this.delay(1000);
      }
      /*
                if (this.apiResult && Object.keys(this.apiResult).length > 0) {//no error
                  //delete the old request
                  this.sendDeleteRequest(this.selectedBorrowingRequestlink + '?remove_request=true');
                }else{
                  this.loading = false;
                }
      */
    })();
  }

  deleteIrrelevantFields(value: JSON) {
    delete value['request_id'];
    delete value['external_id'];
    delete value['created_date'];
    delete value['last_modified_date'];
    delete value['created_time'];
    delete value['last_modified_time'];
    delete value['user_request'];
  }

  changeToArticle(value: any) {
    value['citation_type']['value'] = 'CR';
    value['chapter_title'] = "";
    if( value['chapter_author']){
      value['author'] = value['chapter_author'];
    }
    value['issn'] = value['isbn'];
    value['isbn'] = "";

    //volume & issue split
    if( value['volume'].includes(",")){
      var volume: string[] = value['volume'].split(",");
      value['issue'] = volume.length > 1 ? (volume.slice(-1)+'').trim() : "" ;
      value['volume'] = volume.length > 1 ? volume.slice(0, -1).join(',') : volume+'';
    }
    if( value['part']){
      value['volume'] = value['volume']  + " " + value['part'];
    }
  }


}

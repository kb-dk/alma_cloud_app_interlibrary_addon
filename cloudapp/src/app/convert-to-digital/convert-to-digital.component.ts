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
  bibItemSelected: boolean = false;
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
  toTextArea:string = '';
  selectedBorrowingRequest: string = '';
  tmpItemId: string = '';

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
    this.tmpItemId
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
    this.pageEntities = pageInfo.entities;
    if(!this.borrowingRequestSelected){
      this.initPage(pageInfo);
    }
    const numberOfEntities = this.pageEntities.length;
    console.log('numberOfEntities(): ', numberOfEntities);
    if(numberOfEntities >= 1){
      const typeOfFirstEntity = this.pageEntities[0].type;
      if(typeOfFirstEntity === EntityType.BORROWING_REQUEST) {
        this.handleBorrowingRequest(numberOfEntities, pageInfo);
      }else if(typeOfFirstEntity === EntityType.ITEM){

        const newTmpItemId = this.pageEntities[0].id;
        if(this.tmpItemId!== newTmpItemId){
          this.toastr.success('ItemId updatet from ' + this.tmpItemId + ' to ' + newTmpItemId);
          this.tmpItemId = newTmpItemId;
        }

      // }else if(typeOfFirstEntity === EntityType.BIB_MMS){
      //   this.handleBibData(numberOfEntities, pageInfo);
      }
    }
  }

  private handleBorrowingRequest(numberOfEntities: number, pageInfo: PageInfo) {
    if (numberOfEntities > 1) {
      this.infoText = 'Select Borrowing Request';
      this.showBorrowingRequestSelectbox = true;
    } else {
      this.findBorrowingRequestData(pageInfo.entities[0]);
    }
  }

  private handleBibData(numberOfEntities: number, pageInfo: PageInfo) {
    if (numberOfEntities == 1) {
      console.log('handleBibData: Der er kun fundet en Entity ', );
      this.findBibData(pageInfo.entities[0]);
      this.infoText = 'Ready to convert to digitization';
    } else {
      console.log('handleBibData: Der er fundet flere Entities ', );
      this.showBibSelectbox = true;
      this.infoText = 'Der er fundet entries af typen: ' + pageInfo.entities[0].type;
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
        this.toTextArea= this.selectedBorrowingRequest;
      }else{
        this.infoText = 'Borrowing request with status "'+result['status']['desc'] +'" can\'t be changed';
      }
    });
  }




  convertToDigitizationRequest() {
    var getUserRequestUrl = '/' + this.selectedUserRequestlink.split('/').slice(3).join('/').replace('"','');
    this.restService.call(getUserRequestUrl).subscribe(result => {
      this._resultFromGetUserRequestApiCall = JSON.stringify(result);
      this.toTextArea = this._resultFromGetUserRequestApiCall;
      const digitizationRequestBody = this.createDigitizationRequestBody();
      var createDigitizationUrl:string = '';
      console.log('this.tempText(getUserRequest): ', this.toTextArea);
    });
  }







  findBibData(entity : Entity){
    console.log('findBibData ramt', );
    this.bibItemSelected = true;
    this.selectedBorrowingRequestlink = entity.link;
    this.restService.call(entity.link).subscribe(result => {
      console.log('entity.link(): ', entity.link);
      console.log('JSON.stringify(result)(): ', JSON.stringify(result));
      this.apiResultBorrowingRequestLink = result;
      // this.citationTypeCode = result['citation_type']['value'];
      // if(result['status']['value'] === 'REQUEST_CREATED_BOR'){
        this.updateFormWithBibValues(result);
        this.selectedItemTitle = '<b>Selected item:</b> ' + entity.description;
        this.infoText = 'Find local ressource with "View Local Ressource" for the selected item in Alma';
        this.isChangeable = true;
        this.showBorrowingRequestSelectbox = false;
      // }else{
      //   this.infoText = 'Borrowing request with status "'+result['status']['desc'] +'" can\'t be changed';
      // }
    });
  }

  private updateFormWithRequestValues(result) {
    let userId: string = JSON.stringify(result['requester']['value']);
    let requestId: string = JSON.stringify(result['request_id']);
    this.formConvertHelper.updateFormWithRequestData(userId, requestId);
  }

  private updateFormWithBibValues(result) {
    let recordId: string = JSON.stringify(result['linked_record_id']['value']);
    let itemId: string = 'To be found';//JSON.stringify(result['request_id']);''
    this.formConvertHelper.updateFormWithBibData(recordId, itemId);
  }

  changeType(){
    // this.loading = true;
    this.isChangeable = false;
    const postBody = { ...this.apiResultBorrowingRequestLink }
    console.log('postBody(Før): ', postBody);
    this.deleteIrrelevantFields(postBody);
    if(this.citationTypeCode === 'BK'){//bør kunne fjernes, når der er ryddet op.
      this.changeToArticle(postBody);
    }
    // console.log('postBody(Efter): ', postBody);
   // call post request
   //  console.log('this.selectedBorrowingRequestlink(): ', this.selectedBorrowingRequestlink);// /users/88118796/resource-sharing-requests/22262131590005763
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

  private sendCreateRequest({ url, requestBody }: { url: string; requestBody: any; }) {
    let request: Request = {
      url,
      method: HttpMethod.POST,
      requestBody
    };
    console.log('requestBody(sendCreateRequest (ORIGINAL)): ', requestBody);
/*
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResultBorrowingRequestLink = result;
        // replace new id with request_id
        this.changeLog = this.changeLog.replace('Creating new request ...','Created new request (' + (this.apiResultBorrowingRequestLink['request_id']) + ')<br>');
        this.hasApiResult = true;
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
*/
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

  submit() {
    const message = 'Raw value: ' + JSON.stringify(this.formConvertHelper.getForm().getRawValue());
    console.log('mmsId(): ', this.formConvertHelper.getMmsId());
    // this.toastr.error(message)
    // this.changeType()
    this.toTextArea = message;
    this.convertToDigitizationRequest();

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

  deleteIrrelevantFields(value: JSON) {
    delete value['request_id'];
    delete value['external_id'];
    delete value['created_date'];
    delete value['last_modified_date'];
    delete value['created_time'];
    delete value['last_modified_time'];
    delete value['user_request'];
  }

  createDigitizationRequestBody() {
    var digitizationRequestBody = Object.create(null);
    this.addProperty(digitizationRequestBody, "user_primary_id", this.apiResultBorrowingRequestLink['requester']['value']);
    const lastInterestDate = this.apiResultBorrowingRequestLink['last_interest_date'];
    var date = Object.create(null);
    var defaultDate:Date = new Date("1 1 2099");
    date = lastInterestDate==null ? defaultDate : lastInterestDate;
    this.addProperty(digitizationRequestBody, 'last_interest_date', date);
    this.addProperty(digitizationRequestBody,"request_type","DIGITIZATION");
    var requestSubType = Object.create(null);
    this.addProperty(requestSubType, 'value', 'PHYSICAL_TO_DIGITIZATION');
    this.addProperty(digitizationRequestBody, 'request_sub_type', requestSubType);
    this.addProperty(digitizationRequestBody, 'mms_id', this.formConvertHelper.getMmsId()); //from submittet form
    this.addProperty(digitizationRequestBody, 'item_id',this.formConvertHelper.getItemId()); //from submittet form
    var targetDestinationObject = Object.create(null);
    this.addProperty(targetDestinationObject, '#text', 'DIGI_DEPT_INST');
    this.addProperty(digitizationRequestBody, 'target_destination', targetDestinationObject);
    this.addProperty(digitizationRequestBody, 'partial_digitization', 'true');
    this.addProperty(digitizationRequestBody, 'chapter_or_article_title', this.apiResultBorrowingRequestLink['title']);
    this.addProperty(digitizationRequestBody, 'author', this.apiResultBorrowingRequestLink['author']);
    var requiredPages = Object.create(null);
    var requiredPageRange = Object.create(null);
    this.addProperty(requiredPageRange, 'from_page', this.apiResultBorrowingRequestLink['start_page'])
    this.addProperty(requiredPageRange, 'to_page', this.apiResultBorrowingRequestLink['end_page'])
    this.addProperty(requiredPages, 'required_pages_range', requiredPageRange);
    this.addProperty(digitizationRequestBody,'required_pages', requiredPages);
    this.addProperty(digitizationRequestBody, "date_of_publication", this.apiResultBorrowingRequestLink['year']);
    this.addProperty(digitizationRequestBody, "volume", this.apiResultBorrowingRequestLink['volume']);
    this.addProperty(digitizationRequestBody, "issue", this.apiResultBorrowingRequestLink['issue']);
    this.createCommentWithPublisherAndEditionInfo(digitizationRequestBody);


    /*
        this.addProperty(digitizationRequest, "", this.apiResultBorrowingRequestLink['']);
        this.addProperty(digitizationRequest, "", this.apiResultBorrowingRequestLink['']);
    */
    console.log('digitizationRequest(): ', digitizationRequestBody);
/*
    value["jjrequest"] = requestObject;


    // value["myname"] = "jegsen1";
    var myObj = { "name":"John", "age":30, "car":null };
    var mySecondObject = { "alder": 40, "farve": "sort"}
    myObj["hest"] = mySecondObject;

    value["myobject"] = myObj;
*/
    return digitizationRequestBody;
  }


  private createCommentWithPublisherAndEditionInfo(digitizationRequest) {
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
    this.formConvertHelper.updateFormWithItemData(this.tmpItemId, this.formConvertHelper.getMmsId())
  }
}

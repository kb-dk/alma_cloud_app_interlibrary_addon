import {Subscription} from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  Alert,
  AlertService,
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
import {formatCurrency} from "@angular/common";
import {DigitizationRequestCreater} from "./digitizationRequestCreater";

@Component({
  selector: 'app-convert-to-digital',
  templateUrl: './convert-to-digital.component.html',
  styleUrls: ['./convert-to-digital.component.scss']
})
export class ConvertToDigitalComponent implements OnInit, OnDestroy {
  private pageLoad$: Subscription;
  pageEntities: Entity[];
  private _resultFromGetBorrowingRequestApiCall: any;
  private _resultFromGetUserRequestApiCall: any;

  borrowingRequestSelected: boolean = false;
  showBorrowingRequestSelectbox : boolean = false;
  borrowingRequestIsChangeable :boolean = false;
  selectedBorrowingRequestlink: string;
  userGuideText:string;
  selectedUserRequestlink:string;
  private getBorrowingRequestOk: boolean = false;
  private getUserRequestOk: boolean = false;
  private createDigitizationOk: boolean = false;
  private apiError: boolean = false;
  private deleteRequestOk: boolean = false;
  loading = false;
  selectedTitle: string = '';
  showExample: boolean = false;
  formGroupConvertHelper: FormGroupConvertHelper;
  digitizationRequestCreater: DigitizationRequestCreater;
  toTextArea:any = ''; //for debugging - remove hidden from html-component
  readyToChangeRequestType = false;
  alertMessage: string = '';

  constructor(private appService: AppService,
              private restService: CloudAppRestService,
              private eventsService: CloudAppEventsService,
              private toastr: ToastrService,
              private alert: AlertService,
              private formBuilder: FormBuilder)
  { }

  ngOnInit() {
    this.appService.setTitle('Convert Borrowing Request to Digitization');
    this.formGroupConvertHelper = new FormGroupConvertHelper();
    this.digitizationRequestCreater = new DigitizationRequestCreater();
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
  }

  private updateReadyToChange() {
    this.readyToChangeRequestType = this.borrowingRequestIsChangeable && this.formGroupConvertHelper.isMmsAndItemIdOK();
    if(this.readyToChangeRequestType) {
      this.createAlertMessage('Use this item? Press "Convert to digitization request"', 'info');
    }
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  getResultFromBorrowingRequestApi() {
    return this._resultFromGetBorrowingRequestApiCall;
  }

  setResultFromBorrowingRequestApi(result: any) {
    this._resultFromGetBorrowingRequestApiCall = result;
    // this.getBorrowingRequestOk = result && Object.keys(result).length > 0; TODO: skal dette bringes i spil (igen)??
  }

  getResultFromUserRequestApi() {
    return this._resultFromGetUserRequestApiCall;
  }

  setResultFromUserRequestApi(result: any) {
    this._resultFromGetUserRequestApiCall = result;
    this.getUserRequestOk = result && Object.keys(result).length > 0;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageEntities = pageInfo.entities;
    if(!this.borrowingRequestSelected){
      this.initPage();
    }
    const numberOfEntities = this.pageEntities.length;
    if(numberOfEntities >= 1){
      const entityTypeBorrowing = this.pageEntities[0].type === EntityType.BORROWING_REQUEST;
      const entityTypeItem = this.pageEntities[0].type === EntityType.ITEM;
      if(entityTypeBorrowing) {
        this.handleBorrowingRequestTypeEntities(numberOfEntities, pageInfo);
      }else if(entityTypeItem){
          this.handleItemTypeEntities();
      }
    }
  }

  private createAlertMessage(message:string, alertTypeAsString:string) {
    this.alert.clear();
    switch (alertTypeAsString) {
      case 'error':
        this.alert.error(message, { autoClose: false });
        break;
      case 'success':
        this.alert.success(message, { autoClose: false })
        break;
      default:
        this.alert.info(message, { autoClose: false })
        break;
    }
  }

  private handleItemTypeEntities() {
    const onlyOneEntityOnPage = this.pageEntities.length == 1;
    if(onlyOneEntityOnPage){
    this.findItemData(this.pageEntities[0]);
 /*
      this.addToDebuggingTextArea(JSON.stringify(this.pageEntities[0]));
      const tmpItemId = this.pageEntities[0].id;
      var link = this.pageEntities[0].link;
      var mmsId = link.split("/")[2];
      this.formGroupConvertHelper.updateFormWithMmsId(mmsId);
      this.formGroupConvertHelper.updateFormWithItemId(tmpItemId);
      this.updateReadyToChange();
*/
    }
  }

  private handleBorrowingRequestTypeEntities(numberOfEntities: number, pageInfo: PageInfo) {
    if (numberOfEntities > 1) {
      this.userGuideText = 'Select Borrowing Request';
      this.showBorrowingRequestSelectbox = true;
    } else {
      const firstAndOnlyEntity = pageInfo.entities[0];
      this.borrowingRequestSelected = true;
      this.selectedTitle = '<b>Selected Title:</b> ' + firstAndOnlyEntity.description;
      this.findBorrowingRequestData(firstAndOnlyEntity);
    }
  }

  private initPage() {
    this.alert.clear();
    this.formGroupConvertHelper = new FormGroupConvertHelper();
    this.userGuideText = "";
    this.toTextArea = '';
    this.setResultFromBorrowingRequestApi(null);
    this.setResultFromUserRequestApi(null);
    this.loading = false;
    this.borrowingRequestIsChangeable = false;
    this.showBorrowingRequestSelectbox = false;
    this.borrowingRequestSelected = false;
    this.updateReadyToChange();
  }

  borrowingRequestSelectedByUser(entity: Entity) {
    this.alert.clear();
    this.borrowingRequestSelected = true;
    this.selectedTitle = '<b>Selected item:</b> ' + entity.description;
    this.findBorrowingRequestData(entity)
  }

  findBorrowingRequestData(entity : Entity){
    this.selectedBorrowingRequestlink = entity.link;
    const loggerText = 'BorrowingRequestLink: ' + entity.link.toString();
    this.addToDebuggingTextArea(loggerText);
    this.restService.call(entity.link).subscribe(result => {
      this.setResultFromBorrowingRequestApi(result);
      this.selectedUserRequestlink = JSON.stringify(result ['user_request']['link']);
      if(result['status']['value'] === 'REQUEST_CREATED_BOR'){
        this.updateFormWithSelectedBorrowingRequestValues(result);
        this.userGuideText = 'Locate and view the relevant physical item to use for digitization.';
        this.borrowingRequestIsChangeable = true;
        this.showBorrowingRequestSelectbox = false;
      }else{
        this.createAlertMessage('Borrowing request with status "'+result['status']['desc'] +'" can\'t be changed', 'error');
      }
    });
  }

  findItemData(entity : Entity){
    var loggerText = 'ItemRequestLink: ' + entity.link.toString();
    this.addToDebuggingTextArea(loggerText);
    this.restService.call(entity.link).subscribe(result => {
      loggerText = 'Result from ItemRequest: /n ' + JSON.stringify(result);
      this.addToDebuggingTextArea(loggerText);
      const locationValue = result['item_data']['location']['value'];
      this.addToDebuggingTextArea('LocationValue: ' + locationValue);
    });
  }

  private addToDebuggingTextArea(newText: string) {
    if(this.toTextArea !== ''){
      this.toTextArea = this.toTextArea + '\n'+ '\n';
    }
    this.toTextArea = this.toTextArea + newText;
  }

  private updateFormWithSelectedBorrowingRequestValues(result) {
    let userId: string = JSON.stringify(result['requester']['value']);
    let requestId: string = JSON.stringify(result['request_id']);
    this.formGroupConvertHelper.updateFormWithRequestData(userId, requestId);
  }


  private sendCreateRequest({ url, requestBody }: { url: string; requestBody: any; }) {
    const loggerText = 'DIGITIZATION' + '\n' + url + '\n' + JSON.stringify(requestBody);
    this.addToDebuggingTextArea(loggerText);
    this.apiError = false;
    let request: Request = {
      url,
      method: HttpMethod.POST,
      requestBody
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.createDigitizationRequestSucceeded(result);
      },
      error: (e: RestErrorResponse) => {
        this.createDigitizationRequestFailed(e);
      }
    });
  }

  private createDigitizationRequestFailed(e: RestErrorResponse) {
    this.apiError = true;//TODO: Bruges dette??
    const returnedError = (e.error)['errorCode'] + '  '   + e.message;
    this.createAlertMessage('Failed to create resource sharing request: ' + returnedError, 'error');
    console.log('ErrorMessage from sendCreateRequest API: ', returnedError);
    this.formGroupConvertHelper = new FormGroupConvertHelper();
  }

  private createDigitizationRequestSucceeded(result) {
    this.createDigitizationOk = true;
    console.log('', 'Created new request (' + (result['request_id']));
  }

  sendDeleteRequest(deleteUrl: string) {
    const loggerText = 'DELETE' + '\n' + deleteUrl;
    this.addToDebuggingTextArea(loggerText);
    console.log('Deleting: ', loggerText);
    this.apiError = false;
    this.loading = true;
    let request: Request = {
      url : deleteUrl,
      method: HttpMethod.DELETE,
      requestBody : null
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.deleteRequestSucceeded(result);
      },
      error: (e: RestErrorResponse) => {
        this.deleteRequestFailed(e);
      }
    });
  }

  private deleteRequestFailed(e: RestErrorResponse) {
    this.apiError = true;
    this.loading = false;
    const returnedError = (e.error)['errorCode'] + '  '   + e.message;
    this.createAlertMessage('Digitization request is created, but failed to delete borrowing request!' + returnedError, 'error');
    console.log('ErrorMessage from sendDeleteRequest API: ', returnedError);
    this.formGroupConvertHelper = new FormGroupConvertHelper();
  }

  private deleteRequestSucceeded(result) {
    this.toTextArea = this.toTextArea + '\n' + '\n' + result
    this.deleteRequestOk = true;
    this.loading = false;
    this.createAlertMessage('BorrowingRequest is converted and deleted', 'success');
    console.log('BorrowingRequest is converted and deleted(): ', 'BorrowingRequest is converted and deleted');
    this.refreshPage();
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
    this.convertToDigitizationRequest();
  }
//TODO: Tjek at create ikke fejler, hvorefter delete kører og går godt. Husk Refresh page
  convertToDigitizationRequest() {
    var paramString = "?user_id_type=all_unique&mms_id=" + this.formGroupConvertHelper.getMmsId() + "&item_pid=" + this.formGroupConvertHelper.getItemId();
    var getUserRequestUrl = '/' + this.selectedUserRequestlink.split('/').slice(3).join('/').replace('"','') + paramString;
    this.loading = true;
    this.restService.call(getUserRequestUrl).subscribe({
      next: result => {
        this.getUserRequestSucceeded(result);
      },
      error: (e: RestErrorResponse) => {
        this.getUserRequestFailed(e);
      }
    });
//    this.deleteBorrowingIfCreateOk();TODO: Moved to next-section in subscribe
  }

  private getUserRequestFailed(e: RestErrorResponse) {
    this.apiError = true;
    this.loading = false;
    const returnedError = (e.error)['errorCode'] + '  '   + e.message;
    this.createAlertMessage('Problem retrieving userRequest: ' + returnedError, 'error');
    console.log('ErrorMessage from getUserRequest API: ', returnedError);
  }

  private getUserRequestSucceeded(result) {
    this.loading = false;
    this.setResultFromUserRequestApi(JSON.stringify(result));
    const {requestBody, url} = this.createDigitizationRequest();
    this.sendCreateRequest({url, requestBody});
    this.deleteBorrowingIfCreateOk();
  }

  private deleteBorrowingIfCreateOk() {
    (async () => {
      while (!this.createDigitizationOk || this.apiError) {// wait for post
        await this.delay(1000);
      }
      if (this.createDigitizationOk) {//no error
        const selectedBorrowingRequestId = this.getResultFromBorrowingRequestApi()['request_id'];
        const paramString = '?remove_request=true';
        const url: any = '/almaws/v1/users/' + this.formGroupConvertHelper.getUserId() + '/resource-sharing-requests/' + selectedBorrowingRequestId;
        //delete the old request
        this.sendDeleteRequest(url);
      } else {//NB: alert-message is allready created in sendDeleteRequest()
        this.loading = false;
      }
    })();
  }

  private createDigitizationRequest() {
    const url = this.digitizationRequestCreater.createUrl(this.formGroupConvertHelper);
    const requestBody = {...this.digitizationRequestCreater.createDigitizationRequestBody(this.formGroupConvertHelper, this.getResultFromBorrowingRequestApi(), this.getResultFromUserRequestApi())};
    return {requestBody, url};
  }

  resetForm() {
    this.initPage();
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }

}

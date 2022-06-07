import {Subscription} from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AlertService,
  CloudAppConfigService,
  CloudAppEventsService,
  CloudAppRestService,
  CloudAppSettingsService,
  Entity,
  EntityType,
  HttpMethod,
  PageInfo,
  Request,
  RestErrorResponse
} from '@exlibris/exl-cloudapp-angular-lib';
import {AppService} from "../app.service";
import {DigitizationFields} from "./digitizationFields";
import {ToastrService} from "ngx-toastr";
import {DigitizationRequestCreater} from "./digitizationRequestCreater";
import {Configuration} from "../models/configuration";

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
  userGuideText:string;
  selectedUserRequestlink:string;
  private createDigitizationOk: boolean = false;
  private apiError: boolean = false;
  private deleteRequestOk: boolean = false;
  loading = false;
  selectedTitle: string = '';
  showExample: boolean = false;
  digitizationFields: DigitizationFields;
  digitizationRequestCreater: DigitizationRequestCreater;
  toTextArea:any = ''; //for debugging - set hidden=false in html-component
  readyToChangeRequestType : boolean = false;
  private configuration: Configuration = new Configuration();
  private locationsUsableForDigitization: [string];
  private itemPoliciesUsableForDigitization: [string];
  private itemLocationIsValid: boolean = false;
  private locationCodeOfSelectedItem: string = '';
  private itemPolicyDescriptionOfSelectedItem: string = '';
  private idOfCreatedDigitizationRequest: string = '';
  private useLocationCodesForItemValidation: boolean = false;

  constructor(private appService: AppService,
              private restService: CloudAppRestService,
              private eventsService: CloudAppEventsService,
              private settingsService: CloudAppSettingsService,
              private cloudAppConfigService: CloudAppConfigService,
              private toastr: ToastrService,
              private alert: AlertService)
  { }

  ngOnInit() {
    this.appService.setTitle('Convert Borrowing Request to Digitization Requests');
    this.digitizationFields = new DigitizationFields();
    this.digitizationRequestCreater = new DigitizationRequestCreater();
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
  }

  private updateReadyToChange() {
    this.readyToChangeRequestType = this.borrowingRequestIsChangeable && this.itemLocationIsValid && this.digitizationFields.allFieldsAreSet();
    if(this.readyToChangeRequestType) {
      this.createAlertMessage('Use this item (from location ' + this.locationCodeOfSelectedItem +')? Press "Convert to digitization request".', 'info');
    } else if (this.digitizationFields.allFieldsAreSet()) {
      if(this.useLocationCodesForItemValidation) {
        this.createAlertMessage('Location of the selected item (' + this.locationCodeOfSelectedItem + ') is not valid for digitization requests. The location can be added by the General Administrator.', 'error');
      }else{
        this.createAlertMessage('Item policy of the selected item (' + this.itemPolicyDescriptionOfSelectedItem + ') is not valid for digitization requests. Item policy can be added by the General Administrator.', 'error');
      }
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
  }

  getResultFromUserRequestApi() {
    return this._resultFromGetUserRequestApiCall;
  }

  setResultFromUserRequestApi(result: any) {
    this._resultFromGetUserRequestApiCall = result;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageEntities = pageInfo.entities;
    this.getConfiguration();
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

  private getConfiguration() {
    this.cloudAppConfigService.get().subscribe(result => {
      this.configuration = result;
      const validLocationsInConfig:boolean = result.locationsUsableForDigitization && result.locationsUsableForDigitization.length>0;
      const validItemPoliciesInConfig: boolean = result.itemPoliciesUsableForDigitization && result.itemPoliciesUsableForDigitization.length>0;
      if (!validLocationsInConfig && !validItemPoliciesInConfig) {
        this.createAlertMessage('Converting requests cannot be done since there are no valid locations or item policies configured for digitization. Please contact your Alma system manager!', 'error');
      } else {
        this.locationsUsableForDigitization = result.locationsUsableForDigitization;
        this.useLocationCodesForItemValidation = result.useLocationCodeAsValidationCriteria;
        this.itemPoliciesUsableForDigitization = result.itemPoliciesUsableForDigitization;
      }
    })
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
      this.prepareReadySettingsIfOk();
    } else {
      this.removeUpdateReadySettings();
    }
  }

  private prepareReadySettingsIfOk() {
    const onlyEntityOnAlmaPage = this.pageEntities[0];
    this.addToDebuggingTextArea(JSON.stringify(onlyEntityOnAlmaPage));
    const tmpItemId = onlyEntityOnAlmaPage.id;
    var link = onlyEntityOnAlmaPage.link;
    var mmsId = link.split("/")[2];
    this.digitizationFields.setMmsAndItemId(mmsId,tmpItemId);
    this.findAndValidateItemData(onlyEntityOnAlmaPage);
  }

  private removeUpdateReadySettings() {
    this.itemLocationIsValid = false;
    this.digitizationFields.setItemId('');
    this.updateReadyToChange();
    this.alert.clear();//In this case we override showing alert-message.
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
    this.digitizationFields = new DigitizationFields();
    this.userGuideText = "";
    this.toTextArea = '';
    this.setResultFromBorrowingRequestApi(null);
    this.setResultFromUserRequestApi(null);
    this.loading = false;
    this.borrowingRequestIsChangeable = false;
    this.showBorrowingRequestSelectbox = false;
    this.borrowingRequestSelected = false;
    this.itemLocationIsValid = false;
    this.locationCodeOfSelectedItem = '';
    this.itemPolicyDescriptionOfSelectedItem = '';
    this.idOfCreatedDigitizationRequest = '';
    this.updateReadyToChange();
  }

  borrowingRequestSelectedByUser(entity: Entity) {
    this.alert.clear();
    this.borrowingRequestSelected = true;
    this.selectedTitle = '<b>Selected item:</b> ' + entity.description;
    this.findBorrowingRequestData(entity)
  }

  findBorrowingRequestData(entity : Entity){
    const loggerText = 'BorrowingRequestLink: ' + entity.link.toString();
    this.addToDebuggingTextArea(loggerText);
    this.restService.call(entity.link).subscribe(result => {
      this.setResultFromBorrowingRequestApi(result);
      this.selectedUserRequestlink = JSON.stringify(result ['user_request']['link']);
      if(result['status']['value'] === 'REQUEST_CREATED_BOR'){
        this.storeSelectedBorrowingRequestValues(result);
        this.userGuideText = 'Find and view the relevant physical item to use for digitization in Alma.';
        this.borrowingRequestIsChangeable = true;
        this.showBorrowingRequestSelectbox = false;
      }else{
        this.createAlertMessage('Borrowing request with status "'+result['status']['desc'] +'" can\'t be changed', 'error');
      }
    });
  }

  findAndValidateItemData(entity : Entity){
    var loggerText = 'ItemRequestLink: ' + entity.link.toString();
    this.addToDebuggingTextArea(loggerText);
    this.restService.call(entity.link).subscribe(result => {
      loggerText = 'Result from ItemRequest: /n ' + JSON.stringify(result);
      this.addToDebuggingTextArea(loggerText);
      this.locationCodeOfSelectedItem = result['item_data']['location']['value'];
      this.itemPolicyDescriptionOfSelectedItem = result['item_data']['policy']['desc'];
      this.setItemValidationInfoFromConfig();
      this.updateReadyToChange();
    });
  }

  private setItemValidationInfoFromConfig() {
    if (this.useLocationCodesForItemValidation) {
      if (this.locationsUsableForDigitization.length == 1 && this.locationsUsableForDigitization[0] === '*') {
        this.itemLocationIsValid = true;
      } else {
        this.itemLocationIsValid = this.locationsUsableForDigitization.filter(locationCode => this.locationCodeOfSelectedItem.toUpperCase().trim() === locationCode.toUpperCase().trim()).length > 0;
      }
    } else {
      if (this.itemPoliciesUsableForDigitization.length == 1 && this.itemPoliciesUsableForDigitization[0] === '*') {
        this.itemLocationIsValid = true;
      } else {
        this.itemLocationIsValid = this.itemPoliciesUsableForDigitization.filter(itemPolicyDesciption => this.itemPolicyDescriptionOfSelectedItem.toUpperCase().trim() === itemPolicyDesciption.toUpperCase().trim()).length > 0;
      }
    }
  }

  private addToDebuggingTextArea(newText: string) {
    if(this.toTextArea !== ''){
      this.toTextArea = this.toTextArea + '\n'+ '\n';
    }
    this.toTextArea = this.toTextArea + newText;
  }

  private addToUserGuideText(newText: string) {
    if(this.userGuideText !== ''){
      this.userGuideText = this.userGuideText + '<br>';
    }
    this.userGuideText = this.userGuideText + newText;
  }

  private storeSelectedBorrowingRequestValues(result) {
    let userId: string = JSON.stringify(result['requester']['value']).split('"')[1];
    let requestId: string = JSON.stringify(result['request_id']).split('"')[1];
    this.digitizationFields.setUserAndRequestId(userId, requestId);
  }

  private sendCreateRequest({ url, requestBody }: { url: string; requestBody: any; }) {
    this.addToUserGuideText('Creating Digitization Request...');
    const loggerText = 'DIGITIZATION' + '\n' + url + '\n' + JSON.stringify(requestBody);
    this.addToDebuggingTextArea(loggerText);
    this.apiError = false;
    this.createDigitizationOk = false;
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
    this.apiError = true;
    this.loading = false;
    const returnedError = (e.error)['errorCode'] + '  '   + e.message;
    this.createAlertMessage('Failed to create resource sharing request: ' + returnedError, 'error');
    console.log('ErrorMessage from sendCreateRequest API: ', returnedError);
    this.digitizationFields = new DigitizationFields();
  }

  private createDigitizationRequestSucceeded(result) {
    this.addToUserGuideText('Digitization Request created!');
    this.createDigitizationOk = true;
    this.idOfCreatedDigitizationRequest = result['request_id'];
  }

  sendDeleteRequest(deleteUrl: string) {
    const loggerText = 'DELETE' + '\n' + deleteUrl;
    this.addToDebuggingTextArea(loggerText);
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
    this.digitizationFields = new DigitizationFields();
  }

  private deleteRequestSucceeded(result) {
    this.addToUserGuideText('Done! :-)');
    this.toTextArea = this.toTextArea + '\n' + '\n' + result
    this.deleteRequestOk = true;
    this.loading = false;
    this.createAlertMessage('BorrowingRequest is converted. Id of Digitization Request is: ' + this.idOfCreatedDigitizationRequest + '.', 'success');
    this.addToUserGuideText('');//space
    this.addToUserGuideText('NB: Some of the attributes from the Borrowing Request may be found in the "Note" of the Patron digitization request!')
    this.idOfCreatedDigitizationRequest = '';
    console.log('BorrowingRequest is converted and deleted(): ', 'BorrowingRequest is converted.');
    this.readyToChangeRequestType = false;//shortcut for disabling "Convert to digitization request"-button without creating alert-message.
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

/*
    1. Get userRequest
    2. Create digitizationRequest
    3. Delete borrowingRequest
*/
  convertToDigitizationRequest() {
    this.digitizationFields.consoleLogFields();
    this.apiError = false;
    this.userGuideText = 'Convertion process startet...'
    var paramString = "?user_id_type=all_unique&mms_id=" + this.digitizationFields.getMmsId() + "&item_pid=" + this.digitizationFields.getItemId();
    var userRequestId = this.selectedUserRequestlink.split("/")[6].replace('"','');
    var getUserRequestUrl = '/almaws/v1/users/'+ this.digitizationFields.getUserId() + '/requests/' + userRequestId + paramString;
    this.loading = true;
    this.restService.call(getUserRequestUrl).subscribe({
      next: result => {
        this.getUserRequestSucceeded(result);
      },
      error: (e: RestErrorResponse) => {
        this.getUserRequestFailed(e);
      }
    });
  }

  private getUserRequestFailed(e: RestErrorResponse) {
    this.apiError = true;
    this.loading = false;
    const returnedError = (e.error)['errorCode'] + '  '   + e.message;
    this.createAlertMessage('Problem retrieving userRequest: ' + returnedError, 'error');
    console.log('ErrorMessage from getUserRequest API: ', returnedError);
  }

  private getUserRequestSucceeded(result) {
    this.addToUserGuideText('Data for creating recieved.');
    this.setResultFromUserRequestApi(JSON.stringify(result));
    const {requestBody, url} = this.createDigitizationRequest();
    this.sendCreateRequest({url, requestBody});
    this.deleteBorrowingIfCreateOk();
  }

  private deleteBorrowingIfCreateOk() {
    (async () => {
      while (!this.createDigitizationOk && !this.apiError) {// wait for post
        await this.delay(1000);
      }
      if (this.createDigitizationOk) {//no error
        this.addToUserGuideText("Processing Borrowing Request...");
        const selectedBorrowingRequestId = this.getResultFromBorrowingRequestApi()['request_id'];
        const paramString = '?remove_request=false&notify_user=false';//Not in use, at the moment.
        // const paramString = '?remove_request=true&notify_user=false';//Not in use, at the moment.
        const url: any = '/almaws/v1/users/' + this.digitizationFields.getUserId() + '/resource-sharing-requests/' + selectedBorrowingRequestId+paramString;
        //delete the old request
        this.sendDeleteRequest(url);
      } else {//NB: alert-message is allready created in sendDeleteRequest()
        this.loading = false;
      }
    })();
  }

  private createDigitizationRequest() {
    const url = this.digitizationRequestCreater.createUrl(this.digitizationFields);
    const requestBody = {...this.digitizationRequestCreater.createDigitizationRequestBody(this.digitizationFields, this.getResultFromBorrowingRequestApi())};
    return {requestBody, url};
  }

  reset() {
    this.initPage();
  }

  toggleShowExample() {
    this.showExample = !this.showExample;
  }

}

import {Subscription} from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  CloudAppEventsService,
  CloudAppRestService,
  Entity,
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
  private _apiResult: any;
  citationTypeCode:string;
  hasRSRequest : boolean = false;
  chooseFromList : boolean = false;
  isChangeable :boolean = false;
  changeLog : string;
  link: string;
  title:string;
  hasApiResult: boolean = false;
  loading = false;
  formConvertHelper: FormGroupConvertHelper;

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
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  get apiResult() {
    return this._apiResult;
  }

  set apiResult(result: any) {
    this._apiResult = result;
    this.hasApiResult = result && Object.keys(result).length > 0;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.title = "";
    this.apiResult = {};
    this.loading = false;
    this.isChangeable = false;
    this.chooseFromList = false;
    this.changeLog = "";
    this.pageEntities = pageInfo.entities;
    this.hasRSRequest = false;

    console.log('title' + this.title);
    if ((this.pageEntities || []).length > 1 && this.pageEntities[0].type === 'BORROWING_REQUEST') {
      //list of Borrowing Requests
      this.chooseFromList = true;
    } else if ((this.pageEntities || []).length == 1  && this.pageEntities[0].type === 'BORROWING_REQUEST') {
      this.onLoadEntity(pageInfo.entities[0]);
    }
  }

  onLoadEntity(entity : Entity){
    this.hasRSRequest = true;
    this.link = entity.link;
    this.restService.call(entity.link).subscribe(result => {
      this.apiResult = result;
      let userId:string = JSON.stringify(result['requester']['value']);
      let requestId:string = JSON.stringify(result['request_id']);
      this.formConvertHelper.updateRequest(userId, requestId);
      this.citationTypeCode = result['citation_type']['value'];
      var aOrAn:string = this.citationTypeCode ==='BK' ? 'a' : 'an';
      if(result['status']['value'] === 'READY_TO_SEND' || result['status']['value'] === 'REQUEST_CREATED_BOR'){
        this.title = "Detected request for " + aOrAn +' '+ this.citationTypeMap.get(this.citationTypeCode)+ ' - '+ result['title'];
        this.isChangeable = true;
      }else{
        this.title = 'Resource sharing request status is  <br/> <b>'+result['status']['desc'] +'</b> <br/> can\'t be changed';
      }
    });
  }


  changeType(){
    this.changeLog = "<br>";
    this.loading = true;
    this.isChangeable = false;
    const postBody = { ...this.apiResult }
    this.deleteExtraFields(postBody);
    if(this.citationTypeCode === 'BK'){
      this.changeToArticle(postBody);
    }else if(this.citationTypeCode === 'CR'){
      this.changeToBook(postBody);
    }
    this.changeLog = this.changeLog + "<br>Deleted old request (" + this.apiResult['request_id'] + ")<br>";


    // call post request
    var url = this.link.split('/').slice(0, -1).join('/');
    this.hasApiResult = false;
    this.sendCreateRequest({ url, requestBody: postBody});
    // wait for post
    (async () => {
      while (!this.hasApiResult) { // The loop is not for waiting for post request to end.
        await this.delay(1000);
      }
      if (this.apiResult && Object.keys(this.apiResult).length > 0) {//no error
        //delete the old request
        this.sendDeleteRequest(this.link + '?remove_request=true');
      }else{
        this.loading = false;
      }
    })();
  }

  deleteExtraFields(value: JSON) {
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
    this.changeLog = this.changeLog + "Creating new request ...<br>";
    this.changeLog = this.changeLog + "-BK -> CR<br>";

    this.changeLog = this.changeLog + "-<b>Title:</b> "+value['title']+' -> <b>Article\\Chapter title</b><br>';
    value['chapter_title'] = "";

    if( value['chapter_author']){
      value['author'] = value['chapter_author'];
      this.changeLog = this.changeLog + "-<b>Chapter author:</b> "+value['chapter_author']+' -> <b>Author</b><br>';
    }
    value['issn'] = value['isbn'];
    value['isbn'] = "";
    this.changeLog = this.changeLog + "-<b>ISBN: </b>"+value['issn']+" -> <b>ISSN</b><br>";

    if(value['chapter']){
      this.changeLog = this.changeLog + "-<b>Chapter number:</b> "+value['chapter']+' -> <b>Chapter</b><br>';
    }

    //volume & issue split
    if( value['volume'].includes(",")){
      this.changeLog = this.changeLog + "-<b>volume: </b>"+value['volume']+" -> <b>volume: </b>";
      var volume: string[] = value['volume'].split(",");
      value['issue'] = volume.length > 1 ? (volume.slice(-1)+'').trim() : "" ;
      value['volume'] = volume.length > 1 ? volume.slice(0, -1).join(',') : volume+'';
      this.changeLog = this.changeLog + value['volume'] +" & <b>issue: </b>" + value['issue']+ "<br>";
    }

    if( value['part']){
      value['volume'] = value['volume']  + " " + value['part'];
      this.changeLog = this.changeLog + "-<b>Part: </b>"+value['part']+" -> <b>Volume: </b>" +value['volume']+ "<br>";
    }

  }

  changeToBook(value: any) {
    value['citation_type']['value'] = 'BK';

    this.changeLog = this.changeLog + "Creating new request ...<br>";
    this.changeLog = this.changeLog + "-CR -> BK<br>";
    this.changeLog = this.changeLog + "-<b>Article\\Chapter Title:</b> "+value['title']+' -> <b>Title</b><br>';
    value['journal_title'] = "";
    value['isbn'] = value['issn'];
    value['issn'] = "";
    this.changeLog = this.changeLog + "-<b>ISSN:</b> "+value['isbn']+" -> <b>ISBN</b><br>";

    //volume & issue join
    if( value['issue']){
      this.changeLog = this.changeLog + "-<b>volume: </b>"+value['volume']+" & <b>issue: </b>" + value['issue']+" -> <b>volume: </b>";
      value['volume'] = value['volume'] + ", " + value['issue'];
      this.changeLog = this.changeLog + value['volume'] + "<br>";
    }

    if(value['chapter']){
      this.changeLog = this.changeLog + "-<b>Chapter:</b> "+value['chapter']+' -> <b>Chapter number</b><br>';
    }
  }

  private sendCreateRequest({ url, requestBody }: { url: string; requestBody: any; }) {
    let request: Request = {
      url,
      method: HttpMethod.POST,
      requestBody
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        // replace new id with request_id
        this.changeLog = this.changeLog.replace('Creating new request ...','Created new request (' + (this.apiResult['request_id']) + ')<br>');
        this.hasApiResult = true;
      },
      error: (e: RestErrorResponse) => {
        this.apiResult = {};
        this.changeLog = this.changeLog.replace('Deleted old request','Not deleting old request');
        this.changeLog = this.changeLog.replace('Creating new request ...','<b>' + e.message + '</b><br>');
        this.toastr.error('<b>Failed to create resource sharing request</b>' + this.changeLog);
        this.title ="";
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
        if(this.chooseFromList){
          this.refreshPage();
        }
      },
      error: (e: RestErrorResponse) => {
        this.apiResult = {};
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
    // this.toastr.error(message)
    this.toastr.success(message)
  }

  resetForm() {
    this.ngOnInit();
    //this.onLoadEntity(this.pageEntities[0]); TODO: spiller ikke!!!
    //this.formConvertHelper = new FormGroupConvertHelper();
  }
}

import {DigitizationFields} from "./digitizationFields";

export class DigitizationRequestCreater {
    constructor() {};

    public createUrl(digitizationFields:DigitizationFields) {
        var paramString = "?user_id_type=all_unique&mms_id=" + digitizationFields.getMmsId() + "&item_pid=" + digitizationFields.getItemId();
        const url: any = '/almaws/v1/users/' + digitizationFields.getUserId() + '/requests' + paramString;
        console.log('url(createUrl): ', url);
        return url;
    }


    public createDigitizationRequestBody(digitizationFields:DigitizationFields, resultFromBorrowingRequestApi:any, resultFromUserRequestApi:any) {
        var digitizationRequestBody = Object.create(null);
        this.addProperty(digitizationRequestBody, "user_primary_id", resultFromBorrowingRequestApi['requester']['value']);
        this.setLastInterestDate(digitizationRequestBody, resultFromBorrowingRequestApi);
        this.addProperty(digitizationRequestBody,"request_type","DIGITIZATION");
        this.setRequestSubtype(digitizationRequestBody);
        this.addProperty(digitizationRequestBody, 'mms_id', digitizationFields.getMmsId());
        this.addProperty(digitizationRequestBody, 'item_id',digitizationFields.getItemId());
        this.setTargetDestination(digitizationRequestBody);
        this.addProperty(digitizationRequestBody, 'partial_digitization', 'true');
        this.addProperty(digitizationRequestBody, 'chapter_or_article_title', resultFromBorrowingRequestApi['title']);
        this.addProperty(digitizationRequestBody, 'chapter_or_article_author', resultFromBorrowingRequestApi['author']);
        this.setRequiredPages(digitizationRequestBody, resultFromBorrowingRequestApi);
        this.addProperty(digitizationRequestBody, "date_of_publication", resultFromBorrowingRequestApi['year']);
        const volume = resultFromBorrowingRequestApi['volume'];
        if(typeof volume === 'number') {
            this.addProperty(digitizationRequestBody, "volume", volume);
        } else {
            this.addProperty(digitizationRequestBody, "volume", '');
        }
        const issue = resultFromBorrowingRequestApi['issue'];
        if(typeof issue === 'number') {
            this.addProperty(digitizationRequestBody, "issue", issue);
        }else {
            this.addProperty(digitizationRequestBody, "issue", '');
        }
        this.setCommentWithExtraInfo(digitizationRequestBody, resultFromBorrowingRequestApi, resultFromUserRequestApi);
        return digitizationRequestBody;
    }

    private setRequiredPages(digitizationRequestBody, resultFromBorrowingRequestApi) {
        var requiredPageRangeObject = {
            from_page: resultFromBorrowingRequestApi['start_page'],
            to_page: resultFromBorrowingRequestApi['end_page']
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

    private setLastInterestDate(digitizationRequestBody, resultFromBorrowingRequestApi) {
        const lastInterestDate = resultFromBorrowingRequestApi['last_interest_date'];
        var date = Object.create(null);
        var defaultDate: Date = new Date("1 1 2099");
        date = lastInterestDate == null ? defaultDate : lastInterestDate;
        this.addProperty(digitizationRequestBody, 'last_interest_date', date);
    }

    private setCommentWithExtraInfo(digitizationRequest, resultFromBorrowingRequestApi, resultFromUserRequestApi) {
        var comment = resultFromUserRequestApi['comment']==null ? '' : resultFromUserRequestApi['comment'];
        const publisher = resultFromBorrowingRequestApi['publisher']==null? '' : resultFromBorrowingRequestApi['publisher'];
        const edition = resultFromBorrowingRequestApi['edition']==null? '' : resultFromBorrowingRequestApi['edition'];
        const volume = typeof (resultFromBorrowingRequestApi['volume'])=== 'number'? '' : resultFromBorrowingRequestApi['volume'];
        const issue = typeof (resultFromBorrowingRequestApi['issue'])=== 'number'? '' : resultFromBorrowingRequestApi['issue'];
        comment  = 'Publisher: ' +  publisher + '  Edition: ' + edition + '  Usercomment: ' + comment + '  Volume: ' + volume + '  Issue: ' + issue;
        this.addProperty(digitizationRequest, 'comment', comment == null ? '' : comment);
        }

    private addProperty(requestObject: {}, key:string, value:any) {
        requestObject[key] = value;
    }

}


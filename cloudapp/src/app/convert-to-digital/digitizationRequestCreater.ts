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
        DigitizationRequestCreater.addProperty(digitizationRequestBody, "user_primary_id", resultFromBorrowingRequestApi['requester']['value']);
        DigitizationRequestCreater.setLastInterestDate(digitizationRequestBody, resultFromBorrowingRequestApi);
        DigitizationRequestCreater.addProperty(digitizationRequestBody,"request_type","DIGITIZATION");
        DigitizationRequestCreater.setRequestSubtype(digitizationRequestBody);
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'mms_id', digitizationFields.getMmsId());
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'item_id',digitizationFields.getItemId());
        DigitizationRequestCreater.setTargetDestination(digitizationRequestBody);
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'partial_digitization', 'true');
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'chapter_or_article_title', resultFromBorrowingRequestApi['title']);
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'chapter_or_article_author', resultFromBorrowingRequestApi['author']);
        DigitizationRequestCreater.setRequiredPages(digitizationRequestBody, resultFromBorrowingRequestApi);
        DigitizationRequestCreater.addProperty(digitizationRequestBody, "date_of_publication", resultFromBorrowingRequestApi['year']);
        const volume = resultFromBorrowingRequestApi['volume'];
        if(typeof volume === 'number') {
            DigitizationRequestCreater.addProperty(digitizationRequestBody, "volume", volume);
        } else {
            DigitizationRequestCreater.addProperty(digitizationRequestBody, "volume", '');
        }
        const issue = resultFromBorrowingRequestApi['issue'];
        if(typeof issue === 'number') {
            DigitizationRequestCreater.addProperty(digitizationRequestBody, "issue", issue);
        }else {
            DigitizationRequestCreater.addProperty(digitizationRequestBody, "issue", '');
        }
        DigitizationRequestCreater.setCommentWithExtraInfo(digitizationRequestBody, resultFromBorrowingRequestApi, resultFromUserRequestApi);
        return digitizationRequestBody;
    }

    private static setRequiredPages(digitizationRequestBody, resultFromBorrowingRequestApi) {
        var requiredPageRangeObject = {
            from_page: resultFromBorrowingRequestApi['start_page'],
            to_page: resultFromBorrowingRequestApi['end_page']
        };
        var requiredPageRangeArray = [requiredPageRangeObject];
        DigitizationRequestCreater.addProperty(digitizationRequestBody, "required_pages_range", requiredPageRangeArray);
    }

    private static setTargetDestination(digitizationRequestBody) {
        var targetDestinationObject = Object.create(null);
        DigitizationRequestCreater.addProperty(targetDestinationObject, 'value', 'DIGI_DEPT_INST');
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'target_destination', targetDestinationObject);
    }

    private static setRequestSubtype(digitizationRequestBody) {
        var requestSubType = Object.create(null);
        DigitizationRequestCreater.addProperty(requestSubType, 'value', 'PHYSICAL_TO_DIGITIZATION');
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'request_sub_type', requestSubType);
    }

    private static setLastInterestDate(digitizationRequestBody, resultFromBorrowingRequestApi) {
        const lastInterestDate = resultFromBorrowingRequestApi['last_interest_date'];
        var defaultDate: Date = new Date("1 1 2099");
        const date = lastInterestDate == null ? defaultDate : lastInterestDate;
        DigitizationRequestCreater.addProperty(digitizationRequestBody, 'last_interest_date', date);
    }

    private static setCommentWithExtraInfo(digitizationRequest, resultFromBorrowingRequestApi, resultFromUserRequestApi) {
        var comment = resultFromUserRequestApi['comment']==null ? '' : resultFromUserRequestApi['comment'];
        const cloudAppPrefix = 'Created using Alma Interlibrary Add-on Cloud App! '
        const publisher = resultFromBorrowingRequestApi['publisher']==null? '' : resultFromBorrowingRequestApi['publisher'];
        const edition = resultFromBorrowingRequestApi['edition']==null? '' : resultFromBorrowingRequestApi['edition'];
        const volume = typeof (resultFromBorrowingRequestApi['volume'])=== 'number'? '' : resultFromBorrowingRequestApi['volume'];
        const issue = typeof (resultFromBorrowingRequestApi['issue'])=== 'number'? '' : resultFromBorrowingRequestApi['issue'];
        comment  = cloudAppPrefix + 'Publisher: ' +  publisher + '  Edition: ' + edition + '  Usercomment: ' + comment + '  Volume: ' + volume + '  Issue: ' + issue;
        DigitizationRequestCreater.addProperty(digitizationRequest, 'comment', comment == null ? '' : comment);
        }

    private static addProperty(requestObject: {}, key:string, value:any) {
        requestObject[key] = value;
    }

}


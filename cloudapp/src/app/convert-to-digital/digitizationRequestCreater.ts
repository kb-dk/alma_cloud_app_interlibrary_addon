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
        var comment:string = '';
        comment = DigitizationRequestCreater.startCommentWithExtraInfo(resultFromBorrowingRequestApi, comment)
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
        comment = DigitizationRequestCreater.handlePages(comment, resultFromBorrowingRequestApi, digitizationRequestBody);
        DigitizationRequestCreater.addProperty(digitizationRequestBody, "date_of_publication", resultFromBorrowingRequestApi['year']);
        comment = DigitizationRequestCreater.addValueAsPropertyOrCommentIfNotNumber(resultFromBorrowingRequestApi, digitizationRequestBody, comment, 'volume');
        comment = DigitizationRequestCreater.addValueAsPropertyOrCommentIfNotNumber(resultFromBorrowingRequestApi, digitizationRequestBody, comment, 'issue');
        DigitizationRequestCreater.endCommentWithExtraInfo(digitizationRequestBody, resultFromUserRequestApi, comment);
        return digitizationRequestBody;
    }

    private static handlePages(comment: string, resultFromBorrowingRequestApi: any, digitizationRequestBody) {
        comment = DigitizationRequestCreater.addValueAsCommentIfNotEmpty(resultFromBorrowingRequestApi, comment, 'pages');
        return DigitizationRequestCreater.setRequiredPagesOrAddToCommentIfNotNumbers(digitizationRequestBody, resultFromBorrowingRequestApi, comment);
    }

    private static addValueAsPropertyOrCommentIfNotNumber(resultFromBorrowingRequestApi: any, digitizationRequestBody, comment: string, propertyName:string):string {
        const propertyValue = resultFromBorrowingRequestApi[propertyName];
        if (this.isNumber(propertyValue)) {
            DigitizationRequestCreater.addProperty(digitizationRequestBody, propertyName, propertyValue);
        } else {
            DigitizationRequestCreater.addProperty(digitizationRequestBody, propertyName, '');
            comment = comment.concat(' ').concat(propertyName).concat(': ').concat(propertyValue);
        }
        return comment;
    }

    private static addValueAsCommentIfNotEmpty(resultFromBorrowingRequestApi: any, comment: string, propertyName:string):string {
        const propertyValue = resultFromBorrowingRequestApi[propertyName];
        if (!propertyValue.isEmpty) {
            comment = comment.concat(' ').concat(propertyName).concat(': ').concat(propertyValue);
        }
        return comment;
    }

    private static setRequiredPagesOrAddToCommentIfNotNumbers(digitizationRequestBody, resultFromBorrowingRequestApi, comment:string):string {
        const startPageValue = resultFromBorrowingRequestApi['start_page'];
        const endPageValue = resultFromBorrowingRequestApi['end_page'];
        var requiredPageRangeObject;
        if (this.isNumber(startPageValue) && this.isNumber(endPageValue)) {
            requiredPageRangeObject = {
                from_page: resultFromBorrowingRequestApi['start_page'],
                to_page: resultFromBorrowingRequestApi['end_page']
            };
        } else {
            requiredPageRangeObject = {
                from_page: '',
                to_page: ''
            };
            comment = comment.concat(' Frompage: ').concat(startPageValue).concat(' ToPage: ' ).concat(endPageValue);//API doesn't like not numbers, so we add it in the comment!
        }
        var requiredPageRangeArray = [requiredPageRangeObject];
        DigitizationRequestCreater.addProperty(digitizationRequestBody, "required_pages_range", requiredPageRangeArray);
        return comment;
    }

    private static isNumber(value:string):boolean {
        return !isNaN(Number(value));
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

    private static startCommentWithExtraInfo(resultFromBorrowingRequestApi, comment:string):string {
        const cloudAppPrefix = 'Created using Alma Interlibrary Add-on Cloud App! '
        const publisher = resultFromBorrowingRequestApi['publisher']==null? '' : resultFromBorrowingRequestApi['publisher'];
        const edition = resultFromBorrowingRequestApi['edition']==null? '' : resultFromBorrowingRequestApi['edition'];
        return comment.concat(cloudAppPrefix).concat(' Publisher: ').concat(publisher).concat('  Edition: ').concat(edition);
    }

    private static endCommentWithExtraInfo(digitizationRequest, resultFromUserRequestApi, comment:string) {
        var originalComment = resultFromUserRequestApi['comment']==null ? '' : resultFromUserRequestApi['comment'];
        comment = comment.concat(' Usercomment: ').concat(originalComment);
        DigitizationRequestCreater.addProperty(digitizationRequest, 'comment', comment);
    }

    private static addProperty(requestObject: {}, key:string, value:any) {
        requestObject[key] = value;
    }

}


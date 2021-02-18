export class DigitizationFields {
    private _userId:string;
    private _requestId:string;
    private _mmsId:string;
    private _itemId:string;

    constructor() {
        this._userId='';
        this._requestId='';
        this._mmsId='';
        this._itemId='';
    }

    public getUserId(): string {
        return this._userId;
    }
    public setUserId(value: string) {
        this._userId = value;
    }

    public getRequestId(): string {
        return this._requestId;
    }
    public setRequestId(value: string) {
        this._requestId = value;
    }

    public getMmsId(): string {
        return this._mmsId;
    }
    public setMmsId(value: string) {
        this._mmsId = value;
    }

    public getItemId(): string {
        return this._itemId;
    }
    public setItemId(value: string) {
        this._itemId = value;
    }

    public allFieldsAreSet():boolean {
        return this.getUserId().trim().length>0 && this.getRequestId().trim().length>0 && this.getMmsId().trim().length>0 && this.getItemId().trim().length>0;
    }

    setUserAndRequestId(userId: string, requestId: string) {
        this.setUserId(userId);
        this.setRequestId(requestId);
    }

    public setMmsAndItemId(mmsId:string, itemId:string):void{
        this.setMmsId(mmsId);
        this.setItemId(itemId);
    }

    public consoleLogFields():void{
        console.log('this._userId(): ', this._userId);
        console.log('this._requestId(): ', this._requestId);
        console.log('this._mmsId(): ', this._mmsId);
        console.log('this._itemId(): ', this._itemId);
    }
}

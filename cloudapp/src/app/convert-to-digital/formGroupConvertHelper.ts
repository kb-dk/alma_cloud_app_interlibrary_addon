import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

export interface FormGroupConvertHelperInterface {
    _form: FormGroup;
}

export class FormGroupConvertHelper implements FormGroupConvertHelperInterface{
    _form: FormGroup;

    constructor() {
        let formBuilder: FormBuilder = new FormBuilder();
        this._form = formBuilder.group({
            userId: [{value: '', disabled: false}],
            requestId: [{value: '', disabled: false}],
            recordId: [{value: '', disabled: true}],
            itemId: [{value: '', disabled: true}],
            mmsId:[{value: '', disabled: true}],
            isRequestOk: false,
            isBibOk: false,
        });
    }

    public updateFormWithRequestData (userId: string, requestId: string) {
        let formBuilder: FormBuilder = new FormBuilder();
        const formGroup = formBuilder.group({
            userId: [{value: this.clean(userId), disabled: true}],
            requestId: [{value: this.clean(requestId), disabled: true}],
            recordId: '',
            itemId: '',
            mmsId: '',
            isRequestOk: true,
            isBibOk: false,
        });
        this.setForm(formGroup);
        console.log('updateFormWithRequestData: ', userId + '  ' + requestId);
    }

    public updateFormWithBibData (recordId: string, itemId: string) {
        let formBuilder: FormBuilder = new FormBuilder();
        const formGroup = formBuilder.group({
            userId: [{value: this._form.get('userId').value, disabled: true}],
            requestId: [{value: this._form.get('requestId').value, disabled: true}],
            recordId: [{value: this.clean(recordId), disabled: true}],
            itemId: [{value: this.clean(itemId), disabled: true}],
            isRequestOk: true,
            isBibOk: true,
        });
        this.setForm(formGroup);
        console.log('updateFormWithBibData: ', recordId + '  ' + itemId);
    }

    public updateFormWithItemData (itemId: string, mmsId: string) {
        console.log('this._form.get(mmsId): ', this._form.get('mmsId'));
        let formBuilder: FormBuilder = new FormBuilder();
        const formGroup = formBuilder.group({
            userId: [{value: this._form.get('userId').value, disabled: true}],
            requestId: [{value: this._form.get('requestId').value, disabled: true}],
            recordId: [{value: this._form.get('recordId'), disabled: true}],
            itemId: [{value: this.clean(itemId), disabled: true}],
            mmsId: [{value: this.clean(mmsId), disabled: true}],
            isRequestOk: true,
            isBibOk: true,
        });
        this.setForm(formGroup);
        console.log('updateFormWithItem: ' + itemId);
    }

    public getForm(): FormGroup { return this._form;}
    public setForm(formGroup : FormGroup) { this._form = formGroup; }
    public isRequestSelected(): boolean{
        return !this._form.get('isRequestOk').value;
    }
    public isBibSelected(): boolean{
        return !this._form.get('isBibOk').value;
    }

    private clean(stringToBeCleaned: string) {
        return stringToBeCleaned.replace(new RegExp('"', 'g'), '');
    }

    public getRequestId():string {
        return this.getValue('requestId')
    }

    public getUserId():string {
        return this.getValue('userId')
    }

    public getMmsId():string {
        return this.getValue('mmsId')
    }

    public getItemId():string {
        return this.getValue('itemId')
    }

    private getValue(controlName:string):string{
        return this._form.controls[controlName].value;
    }

}

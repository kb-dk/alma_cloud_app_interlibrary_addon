import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

export interface FormGroupConvertHelperInterface {
    _form: FormGroup;
/*
    userId: FormControl;
    requestId: FormControl;
    recordId: FormControl;
    itemId: FormControl;
*/
}

export class FormGroupConvertHelper implements FormGroupConvertHelperInterface{
    public getForm(): FormGroup {
        return this._form;
    }

    public setForm(formGroup : FormGroup) {
        this._form = formGroup;
    }

    _form: FormGroup;

    public isRequestSelected(): boolean{
      return this._form['isRequestOk'].value;
    }
/*
    userId: FormControl;
    requestId: FormControl;
    recordId: FormControl;
    itemId: FormControl;
*/

    constructor() {
        let formBuilder: FormBuilder = new FormBuilder();
        this._form = formBuilder.group({
            userId: [{value: 'newUseddasrId', disabled: false}],
            requestId: [{value: 'newRequestId', disabled: false}],
            recordId: [{value: 'newRecordId', disabled: true}],
            itemId: [{value: 'newItemId', disabled: true}],
            isRequestOk: true,
        });
        console.log('Oprettet: ' + this._form);
        console.log('Class: FormGroupConvertHelper, Function: constructor, Line 44 this._formisRequestOk(): '
        , this._form.get('isRequestOk').value);
    }

    public updateRequest (userId: string, requestId: string) {
        this._form.addControl('testJJ', new FormControl('hest'));
        let tmpUserId: FormControl = new FormControl([{value: 'Updated: ' + this.clean(userId), disabled: true}])
        let tmpRequestId: FormControl = new FormControl([{value: 'Updated: ' + this.clean(requestId), disabled: true}])
        let formBuilder: FormBuilder = new FormBuilder();
        const formGroup = formBuilder.group({
            userId: [{value: this.clean(userId), disabled: true}],
            requestId: [{value: this.clean(requestId), disabled: true}],
            recordId: [{value: 'newRecordId'}],
            itemId: [{value: 'newItemId'}],
            isRequestOk: true,
        });
        this.setForm(formGroup);/*
        let formBuilder: FormBuilder = new FormBuilder();
        this._form = formBuilder.group({
            userId: tmpUserId,
            requestId: tmpRequestId,
            recordId: [{value: 'newRecordId'}],
            itemId: [{value: 'newItemId'}],
        });
*/
/*
        this._form.setValue({
            userId: tmpUserId,
            requestId: tmpRequestId,
            recordId: [{value: 'newRecordId'}],
            itemId: [{value: 'newItemId'}],
        });
*/
    }

    public updateRequestNew (userId: string, requestId: string) {
        console.log('opdaterer med request: ' + userId + '  ' + requestId + '  ' +this._form.value)
        let tmpUserId: FormControl = new FormControl([{value: 'Updated: ' + this.clean(userId), disabled: true}])
        this._form.setControl('userId', tmpUserId);
        let tmpRequestId: FormControl = new FormControl([{value: 'Updated: ' + this.clean(requestId), disabled: true}])
        this._form.setControl('requestId', tmpRequestId);
        this._form.setControl('recordId', new FormControl([{value: 'newRecordId'}]));
        this._form.setControl('itemId', new FormControl([{value: 'newItemId'}]));
    }

    private clean(stringToBeCleaned: string) {
        return stringToBeCleaned.replace(new RegExp('"', 'g'), '');
    }

    /*
        public toString(): string {
            return JSON.stringify(this);
        }
    */

}

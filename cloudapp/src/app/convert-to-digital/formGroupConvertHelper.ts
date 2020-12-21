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
            isRequestOk: false,
        });
    }

    public updateRequest (userId: string, requestId: string) {
        let tmpUserId: FormControl = new FormControl([{value: 'Updated: ' + this.clean(userId), disabled: true}])
        let tmpRequestId: FormControl = new FormControl([{value: 'Updated: ' + this.clean(requestId), disabled: true}])
        let formBuilder: FormBuilder = new FormBuilder();
        const formGroup = formBuilder.group({
            userId: [{value: this.clean(userId), disabled: true}],
            requestId: [{value: this.clean(requestId), disabled: true}],
            recordId: '',
            itemId: '',
            isRequestOk: true,
        });
        this.setForm(formGroup);
    }

    public getForm(): FormGroup { return this._form;}
    public setForm(formGroup : FormGroup) { this._form = formGroup; }
    public isRequestSelected(): boolean{
        return !this._form.get('isRequestOk').value;
    }

    private clean(stringToBeCleaned: string) {
        return stringToBeCleaned.replace(new RegExp('"', 'g'), '');
    }

}

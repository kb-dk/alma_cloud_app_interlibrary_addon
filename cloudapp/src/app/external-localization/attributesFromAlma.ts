import {ExternalLinkAttributes} from "../models/external-link-attributes";

export class AttributesFromAlma implements ExternalLinkAttributes{
    id: number;
    title: string;
    mms_id: string;
    isbn: string;
    author: string;

    constructor(id: number, title: string, mms_id:string, isbn:string,  author:string) {
        console.log('Oprettet id: ' + id + '  Title: ' + title + '  MmsId: ' + mms_id +  ' isbn:  '  + isbn + '   Author: ' + author);
        this.id = id;
        this.title = title;
        this.mms_id = mms_id;
        this.isbn = isbn;
        this.author = author;
    }

    public getEntryNo = () => {
        return this.id+1;
    }
}

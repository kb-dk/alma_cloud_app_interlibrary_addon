export interface ExternalLinkAttributes {
    id: number;
    title: string;
    mms_id: string;
    isbn: string;
    author: string;
}

export class  ExternalLinkAttributesImpl implements  ExternalLinkAttributes{
    id: number;
    isbn: string;
    mms_id: string;
    title: string;
    author: string;

    constructor(index: number, title?:string, mms_id?:string, isbn?:string, author?:string) {
        this.id = index;
        this.title = title || '';
        this.mms_id = mms_id || '';
        this.isbn = isbn || '';
        this.author = author || '';
    }

    public toString(): string {
        return 'id: ' + this.id
            + ' title: ' + this.title
            + ' mmsIs: ' + this.mms_id
            + ' isbn: ' + this.isbn
            + ' author ' + this.author
            ;
    }

}

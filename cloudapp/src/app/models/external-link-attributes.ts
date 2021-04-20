
export interface ExternalLinkAttributes {
    id: number;
    title: string;
    isbn: string;
    author: string;
    issn: string;
}

export class  ExternalLinkAttributesImpl implements  ExternalLinkAttributes{
    id: number;
    isbn: string;
    title: string;
    author: string;
    issn: string;

    constructor(index: number, title?:string, isbn?:string, author?:string, issn?:string) {
        this.id = index+1;
        this.title = title || '';
        this.isbn = isbn || '';
        this.author = author || '';
        this.issn = issn || '';
    }

    public getEncodedTitle():string {
       return encodeURIComponent(this.title);
    }

    public toString(): string {
        return 'id: ' + this.id
            + ' title: |' + this.title +'|'
            + ' isbn: ' + this.isbn
            + ' author ' + this.author
            + ' issn ' + this.issn
            ;
    }
}

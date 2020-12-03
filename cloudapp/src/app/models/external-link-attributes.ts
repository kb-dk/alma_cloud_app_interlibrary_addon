
export interface ExternalLinkAttributes {
    id: number;
    title: string;
    isbn: string;
    author: string;
}

export class  ExternalLinkAttributesImpl implements  ExternalLinkAttributes{
    id: number;
    isbn: string;
    title: string;
    author: string;

    constructor(index: number, title?:string, isbn?:string, author?:string) {
        this.id = index+1;
        this.title = title || '';
        this.isbn = isbn || '';
        this.author = author || '';
    }

    public getEncodedTitle():string {
       return encodeURIComponent(this.title);
    }

    public toString(): string {
        return 'id: ' + this.id
            + ' title: |' + this.title +'|'
            + ' isbn: ' + this.isbn
            + ' author ' + this.author
            ;
    }
}

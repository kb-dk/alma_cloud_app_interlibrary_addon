export interface ExternalLinkAttributes {
    id: number;
    title: string;
    mms_id: string;
    isbn: string;
}

export class  ExternalLinkAttributesImpl implements  ExternalLinkAttributes{
    id: number;
    isbn: string;
    mms_id: string;
    title: string;
}

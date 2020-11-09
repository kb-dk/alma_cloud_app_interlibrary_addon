export class NetpunktEntry {
    index: number;
    title: string;
    mms_id: string;
    isbn: string;
    titleLink: string;
    mmsidLink: string;
    kvkPart1: string = 'https://kvk.bibliothek.kit.edu/hylib-bin/kvk/nph-kvk2.cgi?maske=kvk-redesign&lang=de&title=KIT-Bibliothek%3A+Karlsruher+Virtueller+Katalog+KVK+%3A+Ergebnisanzeige&head=%2F%2Fkvk.bibliothek.kit.edu%2Fasset%2Fhtml%2Fhead.html&header=%2F%2Fkvk.bibliothek.kit.edu%2Fasset%2Fhtml%2Fheader.html&spacer=%2F%2Fkvk.bibliothek.kit.edu%2Fasset%2Fhtml%2Fspacer.html&footer=%2F%2Fkvk.bibliothek.kit.edu%2Fasset%2Fhtml%2Ffooter.html&css=none&input-charset=utf-8&ALL=';
    kvkPart2: string = '&TI=&AU=&CI=&ST=&PY=&SB=&SS=&PU=&kataloge=K10PLUS&kataloge=BVB&kataloge=NRW&kataloge=HEBIS&kataloge=HEBIS_RETRO&kataloge=KOBV_SOLR&kataloge=DDB&kataloge=STABI_BERLIN&kataloge=ABES&kataloge=EDIT16&kataloge=ITALIEN_VERBUND&kataloge=ITALIEN_SERIALS&kataloge=BNE&kataloge=REBIUN&ref=direct&client-js=yes';


    constructor(index: number, title: string, mms_id:string, titleLink:string, mmsidLink: string) {
        console.log('Oprettet: ' + index);
        this.index = index;
        this.title = title;
        this.mms_id = mms_id;
        this.titleLink = titleLink;
        this.mmsidLink = mmsidLink;
    }
    public setIsbn = (isbn: string) => {
        console.log('Tilføjer isbn:' + isbn + ' Til index ' + this.index);
        this.isbn = isbn;
    }

    public getLink = (linkType: string) => {
        return this.kvkPart1 + this.isbn + this.kvkPart2;
    }

    public getEntryNo = () => {
        return this.index+1;
    }
}

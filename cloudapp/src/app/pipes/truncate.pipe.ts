import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate'
})

export class TruncatePipe implements PipeTransform {

    transform(stringToBeTruncated: string, maxNoOfCaracters:number): string {
        return stringToBeTruncated.substr(0, maxNoOfCaracters) + '...';
    }

}

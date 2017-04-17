import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

let rhymesBaseUrl = "https://api.datamuse.com/words?rel_rhy=";
/*
  Generated class for the Data provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Data {

  constructor(public http: Http) {
    console.log('Hello Data Provider');
  }

  getRhymeSuggestions(word) {
    return this.http.get(rhymesBaseUrl + word).map((res) => res.json());
  }

}//Data
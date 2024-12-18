// import { Loader } from './../../../node_modules/@googlemaps/js-api-loader/src/index';
// import { Loader } from '@angular/js-api-loader';
import { Loader } from '@googlemaps/js-api-loader';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private loader!: Loader;

  constructor() {
    this.loader = new Loader({
      apiKey: environment.MAPS_KEY,
      version: 'weekly',
    });
  }

  async load(): Promise<void> {
    await this.loader.importLibrary('maps');
  }

  getMarker() {}
}

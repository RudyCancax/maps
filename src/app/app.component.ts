import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleMapsService } from './services/google-maps.service';

const mapOptions: google.maps.MapOptions = {
  center: {
    lat: 14.662677506662494,
    lng: -90.82125349432482,
  },
  zoom: 12,
  mapId: 'my-custom-map',
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  map!: google.maps.Map;
  infoWindow!: google.maps.InfoWindow;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  thirdMarker!: google.maps.marker.AdvancedMarkerElement;

  // Connect markers with line
  polyline!: google.maps.Polyline;

  myGuias = [
    {
      truck: 1,
      fo: 1,
      position: {
        lat: 14,
        lng: -90,
      },
      stops: [
        {
          title: 'PARQUE CHIMAL',
          description: 'centro chimal',
          position: {
            lat: 14.661172296213385,
            lng: -90.8193122573641,
          },
        },
        {
          title: 'PARRAMOS',
          description: 'Descripción Parramos',
          position: {
            lat: 14.612404041359053,
            lng: -90.80267828810923,
          },
        },
      ],
    },
    {
      truck: 2,
      fo: 2,
      position: {},
      stops: [
        {
          title: 'TRUCK NO. 2',
          description: 'FO no 2',

          position: {
            lat: 14.664823452458831,
            lng: -90.82722604293322,
          },
        },
        {
          title: 'TRUCK NO. 2',
          description: 'FO no 2',
          position: {
            lat: 14.664823452458831,
            lng: -90.82722604293322,
          },
        },
      ],
    },
  ];

  title = 'maps';

  constructor(private googleMapsService: GoogleMapsService) {}

  async ngOnInit() {
    await this.googleMapsService.load();
    await this.initMap();
    // this.addCustomMarker();
    await this.addMultipleMarkers();
    await this.drawLines();
  }

  async initMap() {
    const { Map } = (await google.maps.importLibrary(
      'maps'
    )) as google.maps.MapsLibrary;
    this.map = new Map(
      document.getElementById('map') as HTMLElement,
      mapOptions
    );
  }

  async addCustomMarker() {
    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
      'marker'
    )) as google.maps.MarkerLibrary;

    const marker = new AdvancedMarkerElement({
      map: this.map,
      position: { lat: 14.662677506662494, lng: -90.82125349432482 },
      title: 'CUSTOM MARKER',
    });

    console.log('CUSTOM MARKER ADDED: ', marker);

    const infoWindow = new google.maps.InfoWindow({
      content:
        '<div><h1>Custom marker</h1><p>This is custom info of the marker</p></div>',
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  async addMultipleMarkers() {
    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
      'marker'
    )) as google.maps.MarkerLibrary;

    this.myGuias.forEach((guia, guiaId) => {
      guia.stops.forEach((location, idx) => {
        console.log('MAPS locations: ', location, idx);
        // Add marker only if it is truck

        const customMarkerIcon = document.createElement('img');
        customMarkerIcon.src = 'assets/truck.png';
        customMarkerIcon.className = 'truck-marker';

        const priceTag = document.createElement('div');
        priceTag.className = 'price-tag';
        priceTag.textContent = location.title;

        const marker = new AdvancedMarkerElement({
          map: this.map,
          position: { lat: location.position.lat, lng: location.position.lng },
          title: location.title,
          gmpClickable: true,
          content: customMarkerIcon,
        });

        this.infoWindow = new google.maps.InfoWindow({
          content: `<div><h1>${location.title}</h1><p>${location.description}</p></div>`,
          headerContent: 'MAPS FIFCO',
        });

        marker.addListener('click', () => {
          this.infoWindow.close();
          this.infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
      });
      this.addTruckMarker(guiaId);
    });
  }

  drawLines() {
    const path = this.markers.map(
      (marker) => marker.position as google.maps.LatLng
    );

    const symbolTwo = {
      path: 'M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 0 3,0 1,1 0 0 0 1,0M -3,3 Q 0,5 3,3',
      strokeColor: '#00F',
      rotation: 45,
    };

    this.polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      icons: [
        {
          icon: symbolTwo,
          offset: '50%',
        },
      ],
    });
    this.polyline.setMap(this.map);
    console.log('POLILYNE DRAWN: ', this.polyline);
  }

  addTruckMarker(guia: number) {
    const firstMarkerPosition = this.markers[0].position as google.maps.LatLng;
    const secondMarkerPosition = this.markers[1].position as google.maps.LatLng;
    const midPoint = this.calculateMidPoint(
      firstMarkerPosition,
      secondMarkerPosition
    );

    const truckMarker = document.createElement('img');
    truckMarker.src = 'assets/truck.png';

    this.thirdMarker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: { lat: midPoint.lat, lng: midPoint.lng },
      title: 'RUTA NO: ' + this.myGuias[guia].fo,
      gmpClickable: true,
      content: truckMarker,
    });
  }

  animateCircle(line: google.maps.Polyline) {
    let count = 0;

    window.setInterval(() => {
      count = (count + 1) % 200;

      const icons = line.get('icons');

      icons[0].offset = count / 2 + '%';
      line.set('icons', icons);
    }, 20);
  }

  // Not working
  calculateMidPoint(p1: google.maps.LatLng, p2: google.maps.LatLng) {
    const lat = (Number(p1.lat) * Number(p2.lat)) / 2;
    const lng = (Number(p1.lng) * Number(p2.lng)) / 2;
    return { lat, lng };
  }

  removeMarker() {}

  updateMarker() {}
}

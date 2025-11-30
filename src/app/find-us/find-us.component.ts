import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-find-us',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './find-us.component.html',
})
export class FindUsComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;

  // Sfax, Tunisia coordinates
  private readonly storeLocation: L.LatLngExpression = [34.7406, 10.7603];

  contactInfo = {
    address: '123 Avenue Habib Bourguiba, Sfax 3000, Tunisia',
    phone: '+216 74 123 456',
    email: 'contact@sfaxstore.tn',
    hours: [
      { days: 'Monday - Friday', time: '9:00 AM - 8:00 PM' },
      { days: 'Saturday', time: '10:00 AM - 6:00 PM' },
      { days: 'Sunday', time: 'Closed' },
    ],
  };

  quickLinks = [
    { name: 'About Us', url: '/about' },
    { name: 'FAQ', url: '/faq' },
    { name: 'Shipping Policy', url: '/shipping' },
    { name: 'Return Policy', url: '/returns' },
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Terms of Service', url: '/terms' },
  ];

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com' },
  ];

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Fix Leaflet default icon path issue
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';

    // Use CDN for marker icons
    const defaultIcon = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    this.map = L.map('map', {
      center: this.storeLocation,
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker(this.storeLocation)
      .addTo(this.map)
      .bindPopup('<strong>Sfax Store</strong><br>Visit us here!')
      .openPopup();
  }
}

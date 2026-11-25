import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  shortcuts = [
    ['bi-calendar2-plus', 'Agendar cita', '/citas/agendar'],
    ['bi-bag-heart', 'Productos', '/tienda'],
    ['bi-cart3', 'Carrito', '/carrito'],
    ['bi-geo-alt', 'Sucursales', '/sucursales'],
  ];
}

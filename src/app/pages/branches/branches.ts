import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branches.html',
})
export class Branches {
  encodeURIComponent = encodeURIComponent;
  q = '';
  selected: any = null;
  branches = [
    {
      name: 'Sucursal Potrero',
      address: 'Potrero, Veracruz',
      distance: 'Potrero',
      hours: 'Lun–Vie · 9:00–18:00 · Sáb · 9:00–15:30',
    },
    {
      name: 'Sucursal Córdoba',
      address: 'Córdoba, Veracruz',
      distance: 'Córdoba',
      hours: 'Lun–Vie · 9:00–18:00 · Sáb · 9:00–15:30',
    },
    {
      name: 'Sucursal Cuitláhuac',
      address: 'Cuitláhuac, Veracruz',
      distance: 'Cuitláhuac',
      hours: 'Lun–Vie · 9:00–18:00 · Sáb · 9:00–15:30',
    },
  ];
  get filtered() {
    return this.branches.filter((b) =>
      (b.name + ' ' + b.address).toLowerCase().includes(this.q.toLowerCase()),
    );
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pets.html',
})
export class Pets {
  pets = [
    { name: 'Luna', type: 'Perro', breed: 'Mestiza', age: '4 años' },
    { name: 'Milo', type: 'Gato', breed: 'Doméstico', age: '2 años' },
  ];
  name = '';
  type = 'Perro';
  add() {
    const n = this.name.trim();
    if (!n) return;
    this.pets.push({ name: n, type: this.type, breed: 'Sin especificar', age: 'Sin especificar' });
    this.name = '';
  }
}

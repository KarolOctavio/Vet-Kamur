import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService, Appointment } from '../../services/appointment.service';
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './appointments.html',
})
export class Appointments {
  svc = inject(AppointmentService);
  tab: 'upcoming' | 'history' = 'upcoming';
  get items() {
    return this.svc
      .list()
      .filter((a) => (this.tab === 'upcoming' ? a.status === 'Próxima' : a.status !== 'Próxima'));
  }
}

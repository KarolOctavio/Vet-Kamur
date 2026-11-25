import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
@Component({
  selector: 'app-appointment-success',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './appointment-success.html',
})
export class AppointmentSuccess {
  appointment = inject(AppointmentService).last();
}

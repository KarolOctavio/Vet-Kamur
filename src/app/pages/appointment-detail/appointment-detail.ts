import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './appointment-detail.html',
})
export class AppointmentDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  svc = inject(AppointmentService);
  appointment = this.svc.get(Number(this.route.snapshot.paramMap.get('id')));
  cancel() {
    if (!this.appointment) return;
    this.svc.cancel(this.appointment.id);
    this.appointment = this.svc.get(this.appointment.id);
  }
  reprogram() {
    if (!this.appointment) return;
    localStorage.setItem('vetkamur_reprogram_id', String(this.appointment.id));
    this.router.navigateByUrl('/citas/agendar');
  }
}

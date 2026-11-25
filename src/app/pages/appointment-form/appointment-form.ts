import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function appointmentDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '');
  if (!value) return null;
  if (value < localDateString()) return { pastDate: true };
  const [year, month, day] = value.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  if (selected.getDay() === 0) return { sunday: true };
  return null;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './appointment-form.html',
})
export class AppointmentForm implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(AppointmentService);
  private router = inject(Router);
  minDate = localDateString();
  times: string[] = [];
  reprogramId: number | null = null;
  scheduleMessage = 'Selecciona una fecha para consultar los horarios disponibles.';

  form = this.fb.nonNullable.group({
    pet: ['', Validators.required],
    service: ['', Validators.required],
    date: ['', [Validators.required, appointmentDateValidator]],
    time: ['', Validators.required],
    notes: ['', Validators.maxLength(500)],
  });

  ngOnInit() {
    this.form.controls.date.valueChanges.subscribe(() => this.updateAvailableTimes());

    const raw = localStorage.getItem('vetkamur_reprogram_id');
    if (raw) {
      const id = Number(raw);
      const a = this.svc.get(id);
      if (a) {
        this.reprogramId = id;
        this.form.patchValue({
          pet: a.pet,
          service: a.service,
          date: a.date,
          time: a.time,
          notes: a.notes,
        });
      }
    }
    this.updateAvailableTimes(false);
  }

  private makeSlots(lastHour: number, lastMinute = 0) {
    const slots: string[] = [];
    for (let hour = 9; hour <= lastHour; hour++) {
      for (const minute of [0, 30]) {
        if (hour === lastHour && minute > lastMinute) continue;
        slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      }
    }
    return slots;
  }

  updateAvailableTimes(clearInvalid = true) {
    const date = this.form.controls.date.value;
    if (!date) {
      this.times = [];
      this.scheduleMessage = 'Selecciona una fecha para consultar los horarios disponibles.';
      return;
    }

    if (this.form.controls.date.hasError('pastDate')) {
      this.times = [];
      this.scheduleMessage = 'La fecha no puede ser anterior al día de hoy.';
      if (clearInvalid) this.form.controls.time.setValue('');
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    const weekday = selected.getDay();

    if (weekday === 0) {
      this.times = [];
      this.scheduleMessage = 'Los domingos la veterinaria permanece cerrada.';
      if (clearInvalid) this.form.controls.time.setValue('');
      return;
    }

    this.times = weekday === 6 ? this.makeSlots(15, 30) : this.makeSlots(18, 0);
    this.scheduleMessage =
      weekday === 6
        ? 'Horario de sábado: 9:00 a.m. a 3:30 p.m.'
        : 'Horario de lunes a viernes: 9:00 a.m. a 6:00 p.m.';

    // Si se agenda para hoy, se ocultan horarios que ya pasaron.
    if (date === this.minDate) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      this.times = this.times.filter((time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m > currentMinutes;
      });
      if (!this.times.length) {
        this.scheduleMessage = 'Ya no hay horarios disponibles para hoy. Selecciona otra fecha.';
      }
    }

    const selectedTime = this.form.controls.time.value;
    if (clearInvalid && selectedTime && !this.times.includes(selectedTime)) {
      this.form.controls.time.setValue('');
    }
  }

  submit() {
    this.updateAvailableTimes(false);
    const value = this.form.getRawValue();
    const timeIsValid = this.times.includes(value.time);

    if (this.form.invalid || !timeIsValid) {
      this.form.markAllAsTouched();
      if (!timeIsValid) this.form.controls.time.setErrors({ unavailable: true });
      return;
    }

    if (this.reprogramId) {
      this.svc.update(this.reprogramId, value);
      localStorage.removeItem('vetkamur_reprogram_id');
    } else {
      this.svc.add(value);
    }
    this.router.navigateByUrl('/citas/exito');
  }
}

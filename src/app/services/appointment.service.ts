import { Injectable } from '@angular/core';

export interface Appointment {
  id: number;
  pet: string;
  petType: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  vet: string;
  status: 'Próxima' | 'Completada' | 'Cancelada';
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly key = 'vetkamur_appointments';

  list(): Appointment[] {
    const saved = this.read();
    if (saved.length) return saved;
    const seed: Appointment[] = [
      {
        id: 1,
        pet: 'Luna',
        petType: 'Perro',
        service: 'Consulta general',
        date: '2026-10-15',
        time: '10:00',
        notes: 'Ninguna',
        vet: 'Dr. Juan Pérez',
        status: 'Próxima',
      },
      {
        id: 2,
        pet: 'Milo',
        petType: 'Gato',
        service: 'Vacunación',
        date: '2026-10-28',
        time: '16:00',
        notes: 'Refuerzo anual',
        vet: 'Dra. Andrea Ruiz',
        status: 'Próxima',
      },
      {
        id: 3,
        pet: 'Luna',
        petType: 'Perro',
        service: 'Control de peso',
        date: '2026-08-12',
        time: '12:30',
        notes: 'Seguimiento',
        vet: 'Dr. Juan Pérez',
        status: 'Completada',
      },
    ];
    this.save(seed);
    return seed;
  }

  add(
    data: Omit<Appointment, 'id' | 'vet' | 'status' | 'petType'> & { petType?: string },
  ): Appointment {
    const items = this.list();
    const appointment: Appointment = {
      ...data,
      id: Date.now(),
      petType: data.petType || (data.pet === 'Milo' ? 'Gato' : 'Perro'),
      vet: 'Dr. Juan Pérez',
      status: 'Próxima',
    };
    items.push(appointment);
    this.save(items);
    localStorage.setItem('vetkamur_last_appointment', JSON.stringify(appointment));
    return appointment;
  }

  get(id: number) {
    return this.list().find((a) => a.id === id);
  }

  update(
    id: number,
    data: Pick<Appointment, 'pet' | 'service' | 'date' | 'time' | 'notes'>,
  ): Appointment | null {
    let updated: Appointment | null = null;
    const items = this.list().map((a) => {
      if (a.id !== id) return a;
      updated = {
        ...a,
        ...data,
        petType: data.pet === 'Milo' ? 'Gato' : 'Perro',
        status: 'Próxima',
      };
      return updated;
    });
    this.save(items);
    if (updated) localStorage.setItem('vetkamur_last_appointment', JSON.stringify(updated));
    return updated;
  }

  setStatus(id: number, status: Appointment['status']) {
    this.save(this.list().map((a) => (a.id === id ? { ...a, status } : a)));
  }

  cancel(id: number) {
    this.setStatus(id, 'Cancelada');
  }

  last(): Appointment | null {
    const raw = localStorage.getItem('vetkamur_last_appointment');
    return raw ? JSON.parse(raw) : null;
  }

  private read(): Appointment[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  }

  private save(items: Appointment[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

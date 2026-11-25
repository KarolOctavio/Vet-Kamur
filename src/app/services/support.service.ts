import { Injectable } from '@angular/core';

export interface SupportRequest {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  details: string;
  status: 'Nueva' | 'Atendida';
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly key = 'vetkamur_support_requests';

  list(): SupportRequest[] {
    try {
      const value = JSON.parse(localStorage.getItem(this.key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  add(data: Pick<SupportRequest, 'name' | 'email' | 'phone' | 'subject' | 'details'>) {
    const request: SupportRequest = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Nueva',
    };
    const items = this.list();
    items.unshift(request);
    this.save(items);
    return request;
  }

  setStatus(id: number, status: SupportRequest['status']) {
    this.save(this.list().map((request) => (request.id === id ? { ...request, status } : request)));
  }

  private save(items: SupportRequest[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

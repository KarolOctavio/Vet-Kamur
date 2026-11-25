import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
})
export class Home {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private support = inject(SupportService);

  // Recomendaciones de los pacientes
  recomendaciones = [
    {
      nombre: 'Luna',
      imagen: 'imagenes/recomendacion-luna.jpg',
      calificacion: 5.0,
      comentario: 'La atención fue muy clara y cuidadosa. Nos explicaron qué revisar en casa y cómo continuar con sus cuidados.'
    },
    {
      nombre: 'Milo',
      imagen: 'imagenes/recomendacion-milo.jpg',
      calificacion: 4.5,
      comentario: 'Fue sencillo agendar y recibimos una atención amable. El seguimiento y las recomendaciones fueron fáciles de entender.'
    },
    {
      nombre: 'Rocky',
      imagen: 'imagenes/recomendacion-rocky.jpg',
      calificacion: 5.0,
      comentario: 'Excelente servicio, mi perrito recibió una atención increíble y siempre estuvieron pendientes de su salud.'
    },
    {
      nombre: 'Bella',
      imagen: 'imagenes/recomendacion-bella.jpg',
      calificacion: 4.5,
      comentario: 'Me encantó el trato que recibió mi mascota. El personal fue muy amable y profesional.'
    },
    {
      nombre: 'Toby',
      imagen: 'imagenes/recomendacion-toby.jpg',
      calificacion: 5.0,
      comentario: 'Encontré todo lo que necesitaba para el cuidado de mi mascota. Sin duda volveremos.'
    },
    {
      nombre: 'Nala',
      imagen: 'imagenes/recomendacion-nala.jpg',
      calificacion: 5.0,
      comentario: 'La experiencia fue muy buena. Me explicaron cómo cuidar su alimentación y mantenerla saludable.'
    },
    {
      nombre: 'Bruno',
      imagen: 'imagenes/recomendacion-bruno.jpg',
      calificacion: 4.5,
      comentario: 'Muy buena atención y excelentes instalaciones. Me sentí tranquilo al dejar a mi mascota en sus manos.'
    },
    {
      nombre: 'Coco',
      imagen: 'imagenes/recomendacion-coco.jpg',
      calificacion: 5.0,
      comentario: 'Me gustó mucho la atención y las recomendaciones que nos dieron para cuidar mejor a Coco.'
    },
    {
      nombre: 'Simba',
      imagen: 'imagenes/recomendacion-simba.jpg',
      calificacion: 5.0,
      comentario: 'Llevar a mi gatito fue una gran experiencia. Lo trataron con mucho cuidado y paciencia.'
    }
  ];

  indiceRecomendacion = 0;

  get recomendacionActual() {
    return this.recomendaciones[this.indiceRecomendacion];
  }

  get recomendacionAnterior() {
    const anterior =
      (this.indiceRecomendacion - 1 + this.recomendaciones.length)
      % this.recomendaciones.length;

    return this.recomendaciones[anterior];
  }

  get recomendacionSiguiente() {
    const siguiente =
      (this.indiceRecomendacion + 1) % this.recomendaciones.length;

    return this.recomendaciones[siguiente];
  }

  cambiarRecomendacion(paso: number) {
    this.indiceRecomendacion =
      (this.indiceRecomendacion + paso + this.recomendaciones.length)
      % this.recomendaciones.length;
  }


  readonly supportEmail = 'soporte@vetkamur.mx';
  readonly supportPhoneDisplay = '271 123 4567';
  readonly supportPhoneLink = '+522711234567';
  contactMessage = '';

  contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.maxLength(20), Validators.pattern(/^[0-9+()\-\s]*$/)]],
    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    details: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  sendContactRequest() {
    this.contactMessage = '';
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const value = this.contactForm.getRawValue();
    this.support.add(value);
    const subject = encodeURIComponent(`[Ayuda Vet-Kamur] ${value.subject}`);
    const body = encodeURIComponent(
      `Nombre: ${value.name}\nCorreo: ${value.email}\nTeléfono: ${value.phone || 'No proporcionado'}\n\nMensaje:\n${value.details}`,
    );
    this.contactMessage = 'Tu solicitud fue registrada y se preparó un correo para enviarlo a Vet-Kamur.';
    window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
    this.contactForm.reset({ name: '', email: '', phone: '', subject: '', details: '' });
  }
}

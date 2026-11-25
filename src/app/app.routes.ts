import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Address } from './pages/address/address';
import { Dashboard } from './pages/dashboard/dashboard';
import { AppointmentForm } from './pages/appointment-form/appointment-form';
import { AppointmentSuccess } from './pages/appointment-success/appointment-success';
import { Appointments } from './pages/appointments/appointments';
import { AppointmentDetail } from './pages/appointment-detail/appointment-detail';
import { Branches } from './pages/branches/branches';
import { Store } from './pages/store/store';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { PaymentCard } from './pages/payment-card/payment-card';
import { PaymentTransfer } from './pages/payment-transfer/payment-transfer';
import { PaymentCash } from './pages/payment-cash/payment-cash';
import { Pets } from './pages/pets/pets';
import { Account } from './pages/account/account';
import { Admin } from './pages/admin/admin';
import { Support } from './pages/support/support';
import { adminGuard, guestGuard, registrationDraftGuard, userGuard } from './guards/auth.guards';

export const routes: Routes = [
  // Información pública: se puede consultar sin crear cuenta.
  { path: '', component: Home },
  { path: 'sucursales', component: Branches },
  { path: 'tienda', component: Store },
  { path: 'tienda/producto/:id', component: ProductDetail },
  { path: 'soporte', component: Support },

  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'registro', component: Register, canActivate: [guestGuard] },
  { path: 'registro/direccion', component: Address, canActivate: [registrationDraftGuard] },

  // Funciones privadas: requieren una cuenta de cliente iniciada.
  { path: 'inicio', component: Home, canActivate: [userGuard] },
  { path: 'citas/agendar', component: AppointmentForm, canActivate: [userGuard] },
  { path: 'citas/exito', component: AppointmentSuccess, canActivate: [userGuard] },
  { path: 'citas', component: Appointments, canActivate: [userGuard] },
  { path: 'citas/:id', component: AppointmentDetail, canActivate: [userGuard] },
  { path: 'historial-medico', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'historial-medico/:id', redirectTo: 'inicio' },
  { path: 'carrito', component: Cart, canActivate: [userGuard] },
  { path: 'pago', component: Checkout, canActivate: [userGuard] },
  { path: 'pago/tarjeta', component: PaymentCard, canActivate: [userGuard] },
  { path: 'pago/transferencia', component: PaymentTransfer, canActivate: [userGuard] },
  { path: 'pago/efectivo', component: PaymentCash, canActivate: [userGuard] },
  { path: 'mascotas', component: Pets, canActivate: [userGuard] },
  { path: 'cuenta', component: Account, canActivate: [userGuard] },

  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];

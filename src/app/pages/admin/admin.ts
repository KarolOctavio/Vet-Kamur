import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { AuthService, VetUser } from '../../services/auth.service'; import { Appointment, AppointmentService } from '../../services/appointment.service';
import { CatalogService, Product } from '../../services/catalog.service';
import { SupportRequest, SupportService } from '../../services/support.service';

type AppointmentFilter = 'Todas' | Appointment['status'];

interface ProductDraft {
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './admin.html',
})
export class Admin {
  private salesService = inject(SalesService);
  private auth = inject(AuthService);
  private appointmentsService = inject(AppointmentService);
  catalog = inject(CatalogService);
  private supportService = inject(SupportService);

  sales = this.salesService.list();
  appointments = this.appointmentsService.list();

  users: VetUser[] = [];

  usersError = '';

  ngOnInit() {

    this.auth.getApiProfile().subscribe({

      next: (usuarios) => {

        this.users = usuarios
          .filter(u =>
            u.username === 'johnd' ||
            u.username === 'kevinryan'
          )
          .map(u => ({
            firstName: u.name.firstname,
            lastName: u.name.lastname,
            email: u.email,
            password: '',
            phone: u.phone,
            address: {
              postalCode: u.address.zipcode,
              city: u.address.city,
              neighborhood: '',
              street: u.address.street,
              exterior: String(u.address.number)
            }
          }));

      },

      error: () => {
        this.usersError = 'No se pudieron cargar los usuarios de la API.';
      }

    });

  }

  get products() { return this.catalog.products; }
  supportRequests = this.supportService.list();

  appointmentFilter: AppointmentFilter = 'Todas';
  editingProductId: number | null = null;
  productMessage = '';

  productDraft: ProductDraft = this.emptyProductDraft();
  get categories() { return [...new Set(this.catalog.products.map(p => p.category))]; }

  get totalRevenue() {
    return this.sales.reduce((sum, sale) => sum + sale.total, 0);
  }

  get averageTicket() {
    return this.sales.length ? this.totalRevenue / this.sales.length : 0;
  }

  get registeredUsers() {
    return this.users.length;
  }

  get attendedAppointments() {
    return this.appointments.filter((a) => a.status === 'Completada').length;
  }

  get pendingAppointments() {
    return this.appointments.filter((a) => a.status === 'Próxima').length;
  }

  get cancelledAppointments() {
    return this.appointments.filter((a) => a.status === 'Cancelada').length;
  }

  get lowStockProducts() {
    return this.products.filter((product) => product.stock <= 5).length;
  }

  get inventoryValue() {
    return this.products.reduce((sum, product) => sum + product.price * product.stock, 0);
  }

  get newSupportRequests() {
    return this.supportRequests.filter((request) => request.status === 'Nueva').length;
  }

  get filteredAppointments() {
    if (this.appointmentFilter === 'Todas') return this.appointments;
    return this.appointments.filter((appointment) => appointment.status === this.appointmentFilter);
  }

  get paymentStats() {
    const methods = ['Tarjeta', 'Transferencia', 'Efectivo'] as const;
    return methods.map((method) => {
      const amount = this.sales
        .filter((sale) => sale.method === method)
        .reduce((sum, sale) => sum + sale.total, 0);
      return {
        method,
        amount,
        percent: this.totalRevenue ? Math.round((amount / this.totalRevenue) * 100) : 0,
      };
    });
  }

  get topProducts() {
    const map = new Map<string, { name: string; units: number; amount: number }>();
    for (const sale of this.sales) {
      for (const item of sale.items) {
        const current = map.get(item.name) || { name: item.name, units: 0, amount: 0 };
        current.units += item.quantity;
        current.amount += item.price * item.quantity;
        map.set(item.name, current);
      }
    }
    return [...map.values()].sort((a, b) => b.units - a.units).slice(0, 8);
  }

  saveProduct() {
    this.productMessage = '';
    const draft = {
      ...this.productDraft,
      name: this.productDraft.name.trim(),
      image: this.productDraft.image.trim(),
      description: this.productDraft.description.trim(),
      price: Number(this.productDraft.price),
      stock: Math.max(0, Math.floor(Number(this.productDraft.stock))),
    };

    if (!draft.name || !draft.category || !draft.description || draft.price < 0 || !Number.isFinite(draft.price)) {
      this.productMessage = 'Completa correctamente los datos del producto.';
      return;
    }

    const fallback = this.fallbackFor(draft.category);
    const image = draft.image || fallback;

    if (this.editingProductId !== null) {
      this.catalog.update(this.editingProductId, { ...draft, image, fallback });
      this.productMessage = 'Producto actualizado correctamente.';
    } else {
      this.catalog.add({ ...draft, image, fallback });
      this.productMessage = 'Producto agregado al inventario.';
    }


    this.cancelProductEdit(false);
  }

  editProduct(product: Product) {
    this.editingProductId = product.id;
    this.productDraft = {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image.startsWith('http') ? product.image : '',
      description: product.description,
    };
    this.productMessage = '';
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  deleteProduct(product: Product) {
    if (!window.confirm(`¿Eliminar ${product.name} del catálogo?`)) return;
    this.catalog.remove(product.id);

    if (this.editingProductId === product.id) this.cancelProductEdit();
    this.productMessage = 'Producto eliminado del catálogo.';
  }

  cancelProductEdit(clearMessage = true) {
    this.editingProductId = null;
    this.productDraft = this.emptyProductDraft();
    if (clearMessage) this.productMessage = '';
  }

  setAppointmentStatus(id: number, status: Appointment['status']) {
    this.appointmentsService.setStatus(id, status);
    this.appointments = this.appointmentsService.list();
  }

  setSupportStatus(request: SupportRequest, status: SupportRequest['status']) {
    this.supportService.setStatus(request.id, status);
    this.supportRequests = this.supportService.list();
  }

  appointmentLabel(status: Appointment['status']) {
    if (status === 'Completada') return 'Atendida';
    if (status === 'Próxima') return 'Pendiente';
    return 'Cancelada';
  }

  appointmentBadgeClass(status: Appointment['status']) {
    if (status === 'Completada') return 'text-bg-success';
    if (status === 'Cancelada') return 'text-bg-danger';
    return 'text-bg-warning';
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private emptyProductDraft(): ProductDraft {
    return {
      name: '',
      category: 'Medicamentos',
      price: 0,
      stock: 0,
      image: '',
      description: '',
    };
  }

  private fallbackFor(category: string) {
    if (category === 'Medicamentos') return 'imagenes/producto-desparasitante.svg';
    if (category === 'Higiene') return 'imagenes/producto-shampoo.svg';
    if (category === 'Accesorios') return 'imagenes/producto-paseo.svg';
    return 'imagenes/producto-alimento.svg';
  }
}

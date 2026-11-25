# Vet-Kamur - Angular + TypeScript

Proyecto web para la veterinaria Vet-Kamur desarrollado con Angular, TypeScript y Bootstrap.

## Ejecutar en Visual Studio Code

1. Abre esta carpeta en Visual Studio Code.
2. Abre una terminal en la raíz del proyecto.
3. Ejecuta:

```bash
npm install
npm start
```

Para mostrarlo a otros equipos dentro de la misma red local:

```bash
npm run start:lan
```

## Accesos de prueba

Usuario:
- Correo: `demo@vetkamur.mx`
- Contraseña: `123456`

Administrador:
- Correo: `admin1@gmail.com`
- Contraseña: `4DM1N`

## Acceso público

Sin iniciar sesión se puede:
- Ver la página Nosotros, misión, visión y valores.
- Consultar productos y detalles de la tienda.
- Consultar las sucursales.
- Entrar al centro de contacto y soporte.
- Enviar una solicitud de ayuda por el formulario público.
- Consultar correo, teléfono y horarios de Vet-Kamur.

Para agendar citas, administrar mascotas, usar el carrito, comprar o pagar es necesario iniciar sesión como cliente.

## Panel administrativo

El administrador puede:
- Consultar ventas, ingresos y productos vendidos.
- Agregar productos o medicamentos.
- Eliminar productos.
- Modificar precio, cantidad disponible, imagen y descripción.
- Revisar citas atendidas, pendientes y canceladas.
- Cambiar el estado de las citas.
- Consultar información general de usuarios registrados sin mostrar contraseñas.
- Revisar solicitudes enviadas desde el formulario público de contacto.

## Tecnologías

- Angular 22
- TypeScript
- Bootstrap 5
- Bootstrap Icons
- Angular Router
- Reactive Forms y FormsModule
- LocalStorage para la persistencia del prototipo

## Nota de funcionamiento

Los datos del prototipo se guardan en `localStorage`. Para usar el sistema en producción con varios clientes conectados desde dispositivos distintos, se requiere sustituir este almacenamiento local por una base de datos y autenticación en servidor/Firebase/Supabase u otra solución equivalente.

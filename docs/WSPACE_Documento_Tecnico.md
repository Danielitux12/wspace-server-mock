# Documento Técnico — WSPACE

Proyecto Integrador · CodeUp Riwi: Beyond Limits · Ruta Básica

---

## 1. Nombre del proyecto

**WSPACE** — Plataforma de alquiler de espacios físicos por horas.

---

## 2. Objetivo general

Diseñar, desarrollar y presentar una aplicación web funcional que permita a personas y empresas (**WSpacer+**) publicar espacios físicos disponibles por horas, y a otras personas (**WSpacer**) buscarlos, reservarlos y pagarlos, integrando frontend, backend y persistencia de datos bajo una lógica de negocio real de intermediación (comisiones, aprobación de reservas, disponibilidad y responsabilidad tributaria diferenciada).

---

## 3. Objetivos específicos

1. Implementar una interfaz SPA en JavaScript Vanilla, sin frameworks, con navegación fluida, diseño responsive (mobile-first) y validaciones de formulario en tiempo real.
2. Modelar y persistir en base de datos relacional la información de usuarios, espacios, reservas, fotos, bloqueos de disponibilidad y amenidades, normalizada hasta 3FN.
3. Implementar lógica de negocio real: cálculo de comisiones e IVA diferenciado, aprobación de reservas con plazo de respuesta, control de disponibilidad cruzada, y penalizaciones por incumplimiento.
4. Aplicar metodología SCRUM durante todo el desarrollo, con evidencia de Product Backlog, Sprint Backlog y tablero de seguimiento.
5. Integrar servicios de terceros reales: carga de archivos (Cloudinary) y simulación de pasarela de pagos.
6. Documentar el proyecto de forma que sea sustentable individualmente por cada integrante del equipo, incluyendo las decisiones tomadas y su justificación.

---

## 4. Problema identificado

Freelancers, equipos de trabajo remoto y músicos que necesitan un espacio físico por un rango corto de horas (una entrevista, una reunión puntual, un ensayo musical) no cuentan con una plataforma centralizada y confiable para encontrarlo y reservarlo. Las alternativas actuales están fragmentadas: coworkings con planes mensuales rígidos, alquiler de salas gestionado manualmente por WhatsApp o redes sociales, y ausencia casi total de oferta organizada para nichos específicos como salas de ensayo musical.

---

## 5. Alcance

### Incluido en el MVP
- Registro y autenticación con correo/contraseña.
- Publicación de espacios por parte de WSpacer+, con fotos, precio, ubicación, tipo y amenidades.
- Búsqueda y filtrado de espacios por ubicación, tipo, fecha y horario, respetando disponibilidad real.
- Flujo completo de reserva: solicitud → aprobación/rechazo del anfitrión con plazo → pago simulado → confirmación.
- Cálculo y visualización de comisiones e IVA diferenciado (WSpacer 12% + IVA, WSpacer+ 6% + IVA).
- Panel de anfitrión (dashboard, mis espacios, reservas recibidas).
- Panel de usuario (mis reservas, perfil).
- Plataforma bilingüe (español/inglés).
- Documentos legales (Términos y Condiciones, Política de Datos) integrados a la plataforma.

### Fuera del alcance del MVP (mejoras futuras documentadas)
- Integración real con pasarela de pago (ePayco sandbox).
- Autenticación con Google (OAuth).
- Recuperación de contraseña por correo.
- Notificaciones en tiempo real (WebSockets).
- Motor tributario completo (retenciones, facturación electrónica DIAN).
- Sistema de favoritos y reseñas completamente implementado (documentado, scaffoldeado, pendiente de conectar a un backend real).

---

## 6. Historias de usuario

El detalle completo (27 historias con criterios de aceptación, organizadas por bloque funcional) está en el archivo `WSPACE_Historias_de_Usuario.md`. Resumen por bloque:

| Bloque | Cantidad de historias |
|---|---|
| Cuenta y autenticación | 6 |
| Búsqueda y descubrimiento | 4 |
| Reservas | 6 |
| Publicación y gestión de espacios | 6 |
| Comunicación (notificaciones, chat) | 2 |
| Transversales (legales, perfil, bienvenida) | 3 |

---

## 7. Arquitectura de la solución

### 7.1 Visión general
Arquitectura cliente-servidor clásica, con un frontend SPA que consume una API REST.

```
┌─────────────────────┐        HTTP / JSON        ┌──────────────────────┐
│   FRONTEND (SPA)     │ ─────────────────────────>│   BACKEND (API REST)  │
│  HTML + CSS + JS      │ <───────────────────────── │  Flask/FastAPI o      │
│  Vanilla, sin          │                            │  Express.js           │
│  frameworks            │                            └───────────┬──────────┘
└──────────┬────────────┘                                        │
           │                                                       │
           │ (llamada directa,                          ┌─────────▼─────────┐
           │  sin pasar por el backend)                  │  Base de datos      │
           ▼                                              │  MySQL / PostgreSQL │
┌─────────────────────┐                                  │  (o MongoDB)        │
│  Cloudinary           │                                  └────────────────────┘
│  (fotos y documentos) │
└─────────────────────┘
```

### 7.2 Frontend
- **Patrón:** SPA construida a mano (sin framework), con enrutamiento propio basado en `history.pushState` y un listener de `popstate`.
- **Estructura modular:** separación clara entre `router`, `auth`, `api` (comunicación con backend), `i18n` (idiomas), `upload` (Cloudinary), componentes reutilizables (navbar, modales, tarjetas) y vistas por pantalla.
- **Autenticación:** JWT recibido del backend, almacenado en `localStorage` (permite sesión compartida entre pestañas, necesario para el switch de modo WSpacer/WSpacer+).
- **Diseño:** mobile-first, con variables CSS centralizadas para la identidad de marca (tipografía Montserrat, colores teal/coral).

### 7.3 Backend
Construido por el equipo en Python (Flask/FastAPI) o Express.js, según el modelo entidad-relación ya definido (ver sección 8). Expone una API REST consumida por el frontend. Mientras el backend real está en construcción, el equipo cuenta con un **backend mock** (Node/Express, datos en memoria) que replica el mismo contrato de rutas, permitiendo desarrollar y probar el frontend de forma independiente (ver `GUIDE.md`, sección 4.1, para el detalle de cómo se reemplaza por el backend real).

### 7.4 Persistencia de datos
Base de datos relacional (MySQL/PostgreSQL), normalizada hasta 3FN, o alternativamente MongoDB si el equipo lo justifica técnicamente. Ver modelo de datos en la sección 8.

### 7.5 Servicios de terceros integrados
- **Cloudinary:** carga de fotos de espacios y documentos de verificación, llamado directamente desde el frontend.
- **Pasarela de pagos:** simulada en el backend (mock propio), con arquitectura preparada para integrar el sandbox real de ePayco como mejora futura.

---

## 8. Modelo de datos

Diseñado por el equipo de backend. Entidades principales:

- **USERS** — datos de identificación, rol (WSpacer / WSpacer+), estado de cuenta.
- **SPACES** — espacios publicados, con tipo/subtipo, ubicación, capacidad, precios y horarios.
- **BOOKINGS** — reservas, con estado, precios, comisiones y plazos de respuesta.
- **BOOKING_PENALTIES** — penalizaciones asociadas a una reserva.
- **SPACE_PHOTOS** — fotos de cada espacio.
- **SPACE_BLOCKS** — bloqueos de disponibilidad definidos por el anfitrión.
- **AMENITIES** — catálogo de amenidades, relacionado con SPACES mediante una tabla intermedia (relación M:N).

**Relaciones principales:** USERS *publica* SPACES (1:N) · USERS *reserva* BOOKINGS (1:N) · SPACES *recibe* BOOKINGS (1:N) · BOOKINGS *genera* BOOKING_PENALTIES (1:1) · SPACES *tiene* SPACE_PHOTOS y SPACE_BLOCKS (1:N) · SPACES *posee* AMENITIES (M:N).

**Justificación de lógica de negocio en el modelo:** campos como `comision_usuario`, `comision_propietario`, `fue_comision_gratis` (en BOOKINGS) y `fecha_limite_respuesta` evidencian que el modelo no se limita a operaciones CRUD, sino que soporta reglas de negocio reales de comisión, aprobación con plazo y penalización.

---

## 9. Evidencias Scrum

- **Product Backlog:** construido a partir de las 27 historias de usuario documentadas en `WSPACE_Historias_de_Usuario.md`.
- **Sprint Backlog:** a definir por el equipo distribuyendo las historias en los sprints según el cronograma general del proyecto (Semana 1: planeación y diseño; Semanas 2-3: desarrollo; Semanas 4-5: integración y sustentación).
- **Tablero de seguimiento:** gestionado en la herramienta que el equipo elija (Trello, Jira, GitHub Projects), con evidencia de tareas movidas entre columnas durante el desarrollo.
- **Roles Scrum:** Scrum Master/Líder, Backend Developer, Frontend Developer, Product Owner (roles de referencia, todos los integrantes participan activamente en el desarrollo).

---

## 10. Justificación tecnológica

| Decisión | Justificación |
|---|---|
| JavaScript Vanilla + SPA hecha a mano | Requisito obligatorio del enunciado (no se admiten frameworks); demuestra comprensión real de cómo funciona el enrutamiento y el manejo de estado que normalmente ofrece un framework. |
| Base de datos relacional (MySQL/PostgreSQL) | El dominio del negocio tiene relaciones claras y estables entre entidades (usuarios, espacios, reservas), lo que se beneficia de integridad referencial y consultas relacionales. |
| JWT + localStorage | Permite proteger rutas del SPA sin recargar la página, y habilita el patrón de sesión compartida entre pestañas necesario para el switch de modo WSpacer/WSpacer+. |
| Cloudinary | Evita depender de almacenamiento de archivos en el propio servidor, poco confiable en entornos de despliegue serverless/estáticos como Vercel o GitHub Pages. |
| Pasarela de pago simulada | Alcance académico: permite demostrar el flujo de negocio completo sin la complejidad y el riesgo de manejar transacciones reales; la arquitectura queda preparada para una integración real futura. |
| Comisión combinada 18% (12% + 6%) | Calculada considerando el costo real de una pasarela de pago (~4,5%) y comparada contra el competidor directo más cercano (Peerspace, con comisiones combinadas de 25-35%), garantizando competitividad de mercado. |

---

## 11. MVP definido

El Producto Mínimo Viable de WSPACE permite a un WSpacer+ publicar un espacio con información completa (fotos, precio, ubicación, amenidades), y a un WSpacer encontrarlo mediante búsqueda filtrada, solicitar una reserva, recibir aprobación o rechazo del anfitrión dentro de un plazo, pagarla (de forma simulada) y ver el desglose completo de comisiones e IVA en cada paso. La evaluación del proyecto prioriza funcionalidad, estabilidad y valor real para el usuario por encima de la cantidad de funcionalidades desarrolladas, conforme a los criterios del enunciado.

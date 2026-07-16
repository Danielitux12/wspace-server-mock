# WSPACE — Resumen Ejecutivo del Proyecto

Proyecto Integrador · CodeUp Riwi: Beyond Limits · Ruta Básica

---

## 1. Concepto del negocio

**WSPACE** es una plataforma de alquiler de espacios físicos por horas (oficinas, salas de juntas, coworking, espacios creativos y salas de ensayo musical), bajo un modelo **multi-anfitrión** inspirado en el funcionamiento de Airbnb, pero adaptado específicamente a necesidades de trabajo y creación, no de hospedaje.

**Propuesta de valor:** *"El espacio que necesitas, cuando lo necesitas."*

### Por qué este enfoque
A diferencia de una plataforma de alojamiento, WSPACE resuelve una necesidad de **corto plazo y alta frecuencia** (horas, no noches), lo que obliga a un modelo de disponibilidad más granular (bloqueos por hora, no por día) y a una lógica de negocio distinta en aprobación, cancelación y pagos.

---

## 2. Identidad de marca

| Elemento | Definición | Justificación |
|---|---|---|
| Personalidad | Facilitador Ágil | Equilibrio entre seriedad (público empresarial) y cercanía (freelancers), sin caer en lo corporativo-frío ni en lo excesivamente informal |
| Tono de voz | Directo, verbos de acción, sin jerga corporativa | Refuerza la percepción de "resolver rápido" |
| Tipografía | Montserrat | Geométrica, legible en pantalla, moderna sin perder seriedad |
| Color primario | Teal / Azul petróleo `#0F6E56` | Confianza y seriedad — equilibra el lado B2B del negocio |
| Color secundario | Coral `#D85A30` | Calidez y cercanía — equilibra el lado freelancer/creativo |

### Naming de roles: WSpacer / WSpacer+
Se descartaron términos tipo "anfitrión/huésped" (metáfora doméstica que no aplica a un contexto de trabajo) en favor de un término de marca propio, corto, sin necesidad de traducción entre español e inglés, y con lógica de "nivel adicional" (el símbolo `+`) que refuerza la posibilidad de que cualquier WSpacer se convierta en WSpacer+ sin fricción conceptual.

---

## 3. Categorías de producto (diferenciador clave)

| Categoría | Elemento diferenciador |
|---|---|
| Oficina privada | Estándar del mercado |
| Sala de juntas | Estándar del mercado |
| Coworking / escritorio compartido | Estándar del mercado |
| Espacio creativo (estudio/podcast/foto) | Nicho poco atendido por plataformas generalistas |
| **Sala de ensayo musical** | **Diferenciador principal** — nicho sin plataforma centralizada y confiable en el mercado local, con alta frecuencia de uso por horas (encaja perfecto con el modelo de negocio) |

Las **amenidades son contextuales por categoría** (ej. "punto de hidratación" para oficinas vs. "batería incluida" para salas de ensayo), presentadas con un patrón visual tipo Booking.com (grid de íconos + check + "ver todas"), consumiendo la relación M:N ya existente entre `SPACES` y `AMENITIES` sin requerir cambios estructurales al modelo de datos.

---

## 4. Estructura del frontend (SPA en JavaScript Vanilla)

### 4.1 Mapa de rutas
```
/                          Home
/login                     Modal de login/registro (no es ruta de página completa)
/espacios                  Listado con filtros (query params)
/espacio/:id               Detalle del espacio
/espacio/:id/reservar      Checkout de reserva
/mis-reservas              Panel WSpacer
/favoritos                 Panel WSpacer
/perfil                    Compartida
/notificaciones            Compartida
/dashboard                 Panel WSpacer+
/mis-espacios               Panel WSpacer+
/mis-espacios/nuevo         Formulario de publicación
/mis-espacios/:id/disponibilidad   Gestión de bloqueos
/mis-espacios/reservas      Aprobación de solicitudes
/mis-espacios/resenas       Reseñas recibidas
/terminos, /politica-datos  Vistas legales estáticas
```

### 4.2 Por qué JS Vanilla con este enfoque de routing
Al no permitirse frameworks, el ruteo se implementa manejando el estado de navegación con `history.pushState` y un listener de `popstate`, renderizando dinámicamente el contenido en un contenedor principal — el patrón estándar de SPA "hecho a mano", que demuestra comprensión real de cómo funcionan los frameworks por debajo (argumento fuerte para la sustentación individual).

### 4.3 Sistema de internacionalización (i18n)
Diccionarios JSON (`es.json` / `en.json`) + atributos `data-i18n` en el HTML + función de reemplazo de texto, con persistencia de preferencia en `localStorage`. Justificado por el requisito del pitch comercial en inglés — tener la plataforma bilingüe refuerza esa narrativa de producto listo para un contexto internacional.

### 4.4 Autenticación y seguridad
- JWT emitido por el backend, almacenado en `localStorage` (permite sesión compartida entre pestañas, necesario para el switch de modo anfitrión).
- Protección de rutas del SPA antes de renderizar vistas privadas (`requiereAuth`, `requiereRol`).
- Wrapper de `fetch` que adjunta el token automáticamente y maneja expiración de sesión (401 → limpiar sesión y redirigir).
- Validación de formularios en dos capas: frontend (experiencia inmediata) y backend (integridad real de los datos).

### 4.5 Carga de archivos
Integración con **Cloudinary** (servicio de terceros) para fotos de espacios y documentos de verificación de WSpacer+, devolviendo URLs que se almacenan en los campos correspondientes del modelo de datos (`SPACE_PHOTOS.url`, `cedula_doc_url`, `certificado_bancario_url`). Se descartó el almacenamiento propio en servidor por la naturaleza efímera de los entornos de despliegue considerados (Vercel, GitHub Pages).

### 4.6 Pagos (simulados)
Pasarela de pago simulada en el backend (mock de ePayco), dado el alcance académico del proyecto. La arquitectura queda documentada para una eventual integración real con el ambiente sandbox de ePayco como mejora futura.

---

## 5. Lógica de negocio implementada (más allá de CRUD)

Este es el punto que responde directamente a la regla del enunciado: *"El proyecto no podrá limitarse exclusivamente a operaciones CRUD básicas"*.

1. **Disponibilidad real cruzada:** el buscador excluye espacios con reservas confirmadas o bloqueos que se solapen con el rango horario buscado.
2. **Aprobación con plazo:** el WSpacer+ tiene un tiempo límite para responder una solicitud; su vencimiento cancela automáticamente la reserva.
3. **Comisiones diferenciadas:** 12% al WSpacer + IVA sobre la comisión, 6% al WSpacer+ + IVA sobre la comisión — estructura calculada considerando el costo real de la pasarela de pagos (~4,5%) y comparada contra el competidor directo (Peerspace, 25-35% combinado) para garantizar competitividad.
4. **Responsabilidad tributaria diferenciada:** WSPACE solo declara IVA sobre su propia comisión de intermediación; el IVA del arriendo del espacio es responsabilidad del WSpacer+, con avisos explícitos tanto en el formulario de publicación como en el checkout.
5. **Verificación escalonada:** los datos sensibles (cédula, certificado bancario) solo se solicitan al momento de convertirse en WSpacer+, no en el registro general — minimiza fricción inicial y solo pide lo necesario cuando hay responsabilidad de dinero de por medio.
6. **Penalizaciones:** cancelaciones tardías o incumplimientos generan un registro en `BOOKING_PENALTIES`, con lógica propia de negocio.
7. **Banner de conversión de rol dinámico:** el CTA de "publicar tu espacio" cambia según el estado del usuario (no logueado / WSpacer / WSpacer+), evidenciando lógica condicional real en el frontend.

---

## 6. Elementos diferenciadores frente a la competencia

| Elemento | Por qué es novedoso |
|---|---|
| Salas de ensayo musical como categoría propia | Nicho no cubierto por Airbnb, WeWork ni Peerspace |
| Comisión combinada (18%) muy por debajo del comparable directo (Peerspace ~25-35%) | Argumento de venta concreto para el pitch comercial |
| Transparencia fiscal explícita en checkout y publicación | Poco común incluso en plataformas reales; refuerza confianza |
| Modo dual WSpacer/WSpacer+ con apertura en pestaña nueva | Resuelve un problema real de UX (no mezclar audiencias) con una solución simple y técnicamente elegante |
| Sistema de amenidades contextuales por categoría | Evita un catálogo genérico y poco relevante para nichos como música o fotografía |

---

## 7. Alcance del MVP (lo que sí y lo que queda como mejora futura)

**En el MVP:**
Registro/login (correo y contraseña), búsqueda con disponibilidad real, flujo completo de reserva con aprobación, pagos simulados, comisiones e IVA calculados y mostrados, notificaciones in-app, carga real de archivos vía Cloudinary, plataforma bilingüe, chat asociado a reservas (vía polling).

**Como mejoras futuras (documentadas, no implementadas):**
Login con Google (OAuth), recuperación de contraseña por correo, integración real con sandbox de ePayco, notificaciones en tiempo real vía WebSockets, motor tributario completo (retenciones, facturación electrónica DIAN).

---

## 8. Documentos legales

Términos y Condiciones y Política de Tratamiento de Datos Personales redactados conforme al marco normativo colombiano (Ley 1581 de 2012, Decreto 1074 de 2015, Ley 1480 de 2011), disponibles en el archivo `WSPACE_Terminos_y_Politica_Datos.md`.

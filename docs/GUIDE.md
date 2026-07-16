# WSPACE — Guía de continuidad del proyecto

**Para Claude en una conversación futura:** este archivo resume todo lo decidido y construido hasta ahora, para que puedas retomar el trabajo sin que María Clara tenga que volver a explicar todo desde cero. Léelo completo antes de responder si te lo comparten.

**Para María Clara:** si este chat llega a su límite, abre uno nuevo, sube este archivo (o pégalo) y dile a Claude "continuemos con WSPACE, aquí está el contexto".

---

## 1. Qué es el proyecto

WSPACE — plataforma de alquiler de espacios físicos por horas (oficinas, salas de juntas, coworking, espacios creativos, salas de ensayo musical), modelo multi-anfitrión inspirado en Airbnb. Proyecto Integrador de Riwi (CodeUp: Beyond Limits, Ruta Básica). María Clara es parte del equipo de **frontend**.

## 2. Restricciones técnicas obligatorias (del enunciado oficial)
- Frontend: **HTML5, CSS3, JavaScript Vanilla, SPA. NO se admiten frameworks** (nada de React/Vue/Angular).
- Backend permitido: Python (Flask/FastAPI) o Express.js — lo construye otro equipo/compañero.
- Base de datos permitida: MySQL, PostgreSQL o MongoDB.
- Debe tener lógica de negocio real, no solo CRUD.
- Metodología SCRUM obligatoria, Git/GitHub obligatorio con GitFlow.

## 3. Decisiones creativas y de negocio ya cerradas
Ver el archivo `WSPACE_Resumen_Ejecutivo_Proyecto.md` para el detalle completo. Resumen rápido:

- **Roles:** WSpacer (reserva) / WSpacer+ (publica espacios). Cualquiera puede subir de WSpacer a WSpacer+.
- **Categorías:** oficina_privada, sala_juntas, coworking, espacio_creativo, sala_ensayo (diferenciador clave del proyecto).
- **Marca:** personalidad "Facilitador Ágil", tagline *"El espacio que necesitas, cuando lo necesitas"*, tipografía Montserrat, colores: primario teal `#0F6E56`, secundario coral `#D85A30`.
- **Comisiones:** 12% + IVA (19% sobre la comisión) al WSpacer, 6% + IVA al WSpacer+. WSPACE NO es agente retenedor del IVA del arriendo — eso es responsabilidad del host. Se muestran avisos de esto tanto en el checkout como en el formulario de publicación.
- **Pagos:** simulados (mock propio en el backend), no hay integración real con ninguna pasarela. Se documenta la opción de ePayco sandbox como mejora futura.
- **Carga de archivos:** vía Cloudinary (fotos de espacios y documentos de verificación), llamado directo desde el frontend, sin pasar por el backend.
- **Login:** solo correo/contraseña por ahora. Google OAuth queda como mejora futura.
- **Recuperación de contraseña:** NO incluida en el MVP, queda como mejora futura.
- **Modo dual:** el switch entre modo WSpacer y modo WSpacer+ abre una **pestaña nueva del navegador** (target="_blank"), no navega dentro de la misma pestaña. La sesión viaja porque el token vive en `localStorage`, compartido entre pestañas del mismo dominio.
- **Documentos legales:** Términos y Condiciones + Política de Datos ya redactados en `WSPACE_Terminos_y_Politica_Datos.md`.
- **Historias de usuario:** 27 historias ya redactadas en `WSPACE_Historias_de_Usuario.md`.

## 4. Estructura del código ya construido

```
wspace/
├── README.md                    (punto de partida del repositorio)
├── docs/                         (TODA la documentación del proyecto vive aquí)
│   ├── GUIDE.md                        (este archivo)
│   ├── WSPACE_Documento_Tecnico.md     (entregable oficial del enunciado)
│   ├── WSPACE_Resumen_Ejecutivo_Proyecto.md
│   ├── WSPACE_Terminos_y_Politica_Datos.md
│   └── WSPACE_Historias_de_Usuario.md
├── frontend/
│   ├── index.html               (punto de entrada, carga todos los <script> en orden)
│   ├── css/
│   │   ├── variables.css        (colores, tipografía — único archivo a tocar para cambiar la marca)
│   │   └── styles.css           (estilos generales, mobile-first)
│   ├── i18n/
│   │   ├── es.json
│   │   └── en.json
│   └── js/
│       ├── core/                (los "cimientos" de la aplicación — se cargan primero)
│       │   ├── i18n.js          (sistema de cambio de idioma)
│       │   ├── utils.js         (formatPrice, showToast, validaciones, categorías, amenidades)
│       │   ├── auth.js          (login, registro, JWT, protección de rutas)
│       │   ├── api.js           (todas las llamadas al backend)
│       │   ├── upload.js        (carga de archivos a Cloudinary)
│       │   ├── router.js        (router SPA hecho a mano, con history.pushState)
│       │   └── app.js           (registra las rutas y arranca todo — se carga AL FINAL)
│       ├── components/          (piezas reutilizables en varias pantallas)
│       │   ├── navbar.js        (cambia según login/rol)
│       │   ├── footer.js
│       │   ├── welcomeModal.js  (pop-up de bienvenida con descuento)
│       │   ├── loginModal.js    (modal con tabs login/registro)
│       │   └── spaceCard.js
│       └── views/                (una pantalla completa por archivo)
│           ├── home.js                 ✅ completa
│           ├── spacesList.js           ✅ completa (con filtros por query params)
│           ├── spaceDetail.js          ✅ completa (galería, amenidades, calculadora de precio)
│           ├── myBookings.js           ✅ completa
│           ├── publishSpace.js         ✅ completa (con calculadora de IVA en vivo)
│           ├── dashboard.js            ✅ completa (métricas básicas)
│           ├── mySpaces.js             ✅ completa
│           ├── hostBookings.js         ✅ completa (aprobar/rechazar)
│           ├── profile.js              ⚠️ funcional pero el guardado es simulado (falta endpoint PATCH /users/me real)
│           ├── favorites.js            ⚠️ solo estado vacío, falta implementar de verdad
│           ├── notifications.js        ⚠️ solo estado vacío, falta implementar de verdad
│           ├── spaceAvailability.js    ⚠️ solo placeholder, falta el calendario de bloqueos
│           ├── hostReviews.js          ⚠️ solo estado vacío
│           └── legalPages.js           ✅ completa (versión resumida; pueden pegar el texto completo del .md)
└── backend-mock/                 (backend de prueba TEMPORAL, YA FUNCIONA, probado end-to-end — ver sección 4.1)
    ├── server.js
    ├── package.json
    ├── data/mockData.js          (usuarios y espacios de prueba, en memoria)
    ├── middleware/authMiddleware.js
    └── routes/
        ├── auth.js               (POST /register, POST /login)
        ├── spaces.js             (GET /, GET /mine, GET /:id, POST /)
        ├── bookings.js           (POST /, GET /mine, GET /host, PATCH /:id/respond, PATCH /:id/cancel)
        └── payments.js           (POST /simulate)
```

**Nota sobre la reorganización:** los archivos "núcleo" (`i18n.js`, `utils.js`, `auth.js`, `api.js`, `upload.js`, `router.js`, `app.js`) ahora viven en `frontend/js/core/` en vez de directamente en `frontend/js/`. Esto es solo un cambio de carpeta — el contenido y el funcionamiento de cada archivo sigue siendo exactamente el mismo. Si agregan un archivo nuevo a `core/`, recuerden también agregar su `<script src="js/core/...">` correspondiente en `index.html`, respetando el orden (core primero, luego components, luego views, y `app.js` siempre al final).

## 4.1 Sobre el backend mock — es temporal, no es parte del entregable final

`backend-mock/` es una **herramienta de apoyo para desarrollar el frontend**, no el backend oficial del proyecto. Se creó para que quien trabaje en el frontend pueda probar todas las pantallas sin depender de que el backend real (Flask/Express + MySQL/PostgreSQL, construido por el resto del equipo) ya esté listo.

**Cómo se reemplaza cuando el backend real esté disponible:**
1. Abrir `frontend/js/api.js`.
2. Cambiar la línea `const API_BASE_URL = 'http://localhost:3000/api';` por la URL real del backend del equipo.
3. Confirmar que el backend real responda con el mismo "formato" que espera el frontend (mismos nombres de rutas: `/auth/login`, `/spaces`, `/bookings`, etc., y mismo formato de respuesta JSON). Si el backend real usa nombres distintos, es más fácil ajustar `api.js` (un solo archivo) que cambiar cada vista.
4. A partir de ahí, `backend-mock/` ya no se necesita — puede quedar en el repositorio solo como referencia de cómo se probó el frontend durante el desarrollo, aclarado en el README para que el equipo no piense que es el backend oficial del proyecto.

**En resumen:** no es obligatorio usarlo, pero si el backend real todavía está en construcción, tenerlo evita quedar bloqueada esperando a que otra persona termine su parte.

## 5. Cómo correr el proyecto

**Backend mock:**
```bash
cd backend-mock
npm install
npm start
# queda corriendo en http://localhost:3000
```

**Frontend:** como es HTML/CSS/JS puro, no necesita build. Basta con abrirlo con un servidor local simple, por ejemplo:
```bash
cd frontend
npx serve .
# o con la extensión "Live Server" de VS Code
```
⚠️ No abran `index.html` haciendo doble clic (protocolo `file://`) porque el `fetch()` a los JSON de idioma y a la API puede fallar por políticas del navegador. Siempre usar un servidor local.

**Usuarios de prueba ya cargados en el backend mock:**
- `ana@example.com` / `password123` (rol: wspacer)
- `carlos@example.com` / `password123` (rol: wspacer_plus, dueño de 2 espacios de ejemplo)

## 6. Lo que falta por hacer (pendientes explícitos)

1. **Conectar con el backend real** (Flask/Express + MySQL/PostgreSQL) que construya el compañero de backend, usando el modelo entidad-relación ya definido (USERS, SPACES, BOOKINGS, BOOKING_PENALTIES, SPACE_PHOTOS, SPACE_BLOCKS, AMENITIES). El contrato de rutas (`/api/auth/...`, `/api/spaces/...`, `/api/bookings/...`) debería mantenerse igual para no tener que tocar el frontend.
2. Completar las vistas marcadas con ⚠️ arriba: favoritos, notificaciones reales, calendario de disponibilidad (bloqueos), reseñas, edición real de perfil.
3. Implementar el **chat asociado a reservas** (se definió hacerlo con polling simple, `fetch` periódico a un endpoint `/api/messages/:bookingId`, ver conversación original para el detalle del modelo `MESSAGES`).
4. Configurar Cloudinary de verdad: crear cuenta gratis, generar un "upload preset" en modo unsigned, y reemplazar `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET` en `frontend/js/upload.js`.
5. Configurar el despliegue (Vercel o GitHub Pages) con **fallback de rutas** para que las URLs "reales" del SPA (ej. `/espacio/123`) funcionen si alguien entra directo por esa URL, no solo navegando desde el Home. En Vercel esto se resuelve con un `vercel.json` con un rewrite hacia `index.html`; en GitHub Pages se resuelve con el truco del archivo `404.html` que redirige a `index.html`.
6. Revisar si quieren pegar el texto legal completo (de `WSPACE_Terminos_y_Politica_Datos.md`) dentro de `legalPages.js`, actualmente solo muestra un resumen corto.
7. Casilla `acepta_tratamiento_datos` — ya está en el formulario de registro (`loginModal.js`) y se valida en `auth.js`, pero confirmar que el backend real la guarde en la tabla `USERS`.
8. Sistema de favoritos, calificación de espacios (reseñas), y penalizaciones por cancelación (`BOOKING_PENALTIES`) están documentados en las historias de usuario pero no implementados aún en el mock ni en las vistas.

## 7. Nivel de inglés del usuario
María Clara tiene nivel A2 de inglés. Las variables y nombres de funciones del código están en inglés simple y comprensible a propósito (ej. `fetchSpaces`, `renderNavbar`, `isAuthenticated`). Los comentarios del código están en español para que los pueda entender fácilmente. Si le agregas código nuevo, sigue ese mismo patrón: nombres en inglés claro, comentarios explicativos en español.

## 8. Estilo de trabajo con María Clara
- Le gusta avanzar de forma **incremental y secuencial**, confirmando cada pieza antes de seguir con la siguiente.
- Prefiere que se le expliquen las razones detrás de cada decisión técnica (no solo el "qué", también el "por qué").
- Aprecia que se le den opciones para elegir en vez de que se le impongan decisiones.
- Ya tiene experiencia con SQL, Python, HTML, CSS, JS básico (viene de Riwi) y background en marketing digital — no es principiante total, pero tampoco asumas nivel experto en JS avanzado.

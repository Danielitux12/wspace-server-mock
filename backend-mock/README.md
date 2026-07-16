# Wspace - Plataforma de Reserva de Espacios de Trabajo

Wspace es una aplicación web moderna (SPA) diseñada para la gestión, búsqueda y reserva de espacios de trabajo, oficinas privadas y salas de ensayo. El proyecto implementa una arquitectura desacoplada con un Frontend interactivo y un Backend robusto desarrollado en TypeScript nativo utilizando las últimas capacidades de Node.js 22.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Arquitectura:** Single Page Application (SPA) nativa con enrutamiento dinámico en el cliente.
- **Estilos y Estructura:** HTML5, CSS3 moderno con variables globales y JavaScript (ESM).
- **Comunicación:** Cliente HTTP centralizado (`api.js`) conectado al puerto del servidor.

### Backend
- **Entorno de Ejecución:** Node.js 22 (Ejecución nativa de TypeScript vía `--experimental-strip-types`).
- **Framework:** Express.js bajo el estándar de módulos modernos (ESM).
- **Seguridad:** Cifrado simétrico criptográfico (`aes-256-gcm`), Hashing de contraseñas con `bcryptjs` y tokens de sesión basados en `jsonwebtoken` (JWT).
- **Validaciones:** Capa dual de validación. Control estructural intermedio con `express-validator` y esquemas rígidos de datos listos para persistencia mediante `Zod`.
- **Base de Datos:** Inicialización y tipado estructurado utilizando Prisma ORM.

---

## 📂 Estructura del Proyecto

```text
Wspace/
├── frontend/                # Aplicación cliente (Puerto 3000)
│   ├── css/                 # Estilos globales y componentes
│   └── js/
│       ├── core/            # Enrutador dinámico (router.js) y cliente (api.js)
│       └── views/           # Vistas renderizadas dinámicamente
└── backend-mock/            # Servidor API TypeScript (Puerto 5000)
    ├── prisma/              # Esquema de persistencia de datos (schema.prisma)
    └── src/
        ├── config/          # Inicialización de servicios (db.ts)
        ├── data/            # Almacenamiento en memoria temporal (mockData.ts)
        ├── middleware/      # Filtros de autenticación, validación y errorHandler global
        ├── routes/          # Endpoints segmentados (auth, spaces, bookings, payments)
        ├── validators/      # Reglas rígidas de negocio para el control de entrada
        └── server.ts        # Punto de entrada principal de la API
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
Asegúrate de tener instalado **Node.js 22** o superior en tu máquina de desarrollo.

### 1. Clonar el repositorio e instalar dependencias
```bash
# Instalar dependencias en el servidor
cd backend-mock
npm install

# Instalar dependencias en el cliente (si aplica)
cd ../frontend
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` dentro de la carpeta `backend-mock` con los siguientes parámetros mínimos de seguridad:
```env
PORT=5000
JWT_SECRET=tu_palabra_secreta_de_desarrollo
DATABASE_URL="postgresql://usuario:password@localhost:5432/wspace_db?schema=public"
ENCRYPTION_KEY=6275636b65746c697374656e6372797074696f6e6b6579323032367365637265
```

### 3. Generar el Cliente de Prisma
Antes de encender el backend por primera vez, compila los tipos estrictos del ORM:
```bash
cd backend-mock
npx prisma generate
```

---

## 🏃‍♂️ Ejecución del Proyecto

### Iniciar el Backend
Desde la carpeta `backend-mock`, ejecuta el servidor aprovechando el motor nativo de TypeScript de Node 22:
```bash
node --experimental-strip-types src/server.ts
```
*Confirmación en consola:* `🚀 Servidor TypeScript corriendo en: http://localhost:5000`

### Iniciar el Frontend
Levanta tu servidor local de desarrollo para el cliente (por defecto en el puerto 3000 o mediante tu extensión de Live Server). Asegúrate de que `frontend/js/core/api.js` apunte a la dirección activa de la API:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 🔒 Endpoints Clave de la API (`http://localhost:5000`)

### Autenticación (`/api/auth`)
- `POST /register` -> Registra un usuario procesando validaciones de formato, obligatoriedad y hashes seguros.
- `POST /login` -> Autentica credenciales y emite un Token JWT de acceso seguro con expiración definida.

### Espacios (`/api/spaces`)
- `GET /` -> Consulta pública de espacios disponibles con soporte para filtros dinámicos por ciudad o tipo.
- `GET /mine` -> *(Protegida por JWT)* Devuelve los espacios publicados por el anfitrión autenticado.
- `POST /` -> *(Protegida por JWT)* Publica una nueva locación acoplando validaciones estructurales de datos.

### Reservas y Pagos (`/api/bookings` | `/api/payments`)
- `POST /bookings` -> Crea intenciones de reserva calculando tarifas operacionales e impuestos en tiempo real, bloqueando colisiones de horarios.
- `POST /payments/simulate` -> Simula pasarelas de pago transaccionales bancarias con una tasa estocástica de éxito del 95%.

---

## 🛡️ Gestión de Errores y Seguridad Centralizada
- **Filtro Infranqueable:** La validación se gestiona de forma aislada en la capa del backend (`src/validators/`). Si un cliente altera el código de la vista o evade las restricciones del navegador web, los interceptores del servidor bloquean la ejecución inmediatamente devolviendo una respuesta estructurada **`400 Bad Request`**.
- **Blindaje de Excepciones:** Cuenta con un middleware global de errores (`errorHandler.ts`) capaz de unificar las caídas del sistema, errores relacionales de bases de datos de Prisma (como violaciones de restricciones únicas `P2002`) y fallos estructurales de validación de esquemas Zod en respuestas HTTP JSON estables que evitan congelar el hilo de ejecución del servidor.

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
- **Base de Datos & ORM:** PostgreSQL running on Docker (v15-alpine) & Prisma ORM v7+ con Driver Adapters.

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
    ├── docker-compose.yml   # Contenedor oficial de PostgreSQL (Puerto 5433 local)
    ├── prisma/              # Esquema de persistencia de datos (schema.prisma)
    ├── prisma.config.js     # Configuración central de entorno obligatoria para Prisma 7
    └── src/
        ├── config/          # Inicialización de servicios con Driver Adapter (db.ts)
        ├── data/            # Almacenamiento en memoria temporal (mockData.ts)
        ├── middleware/      # Filtros de autenticación, validación y errorHandler global
        ├── routes/          # Endpoints segmentados en TypeScript puro (Extensiones .ts)
        ├── validators/      # Reglas rígidas de negocio para el control de entrada
        └── server.ts        # Punto de entrada principal de la API
```

---

## 🚀 Guía de Instalación Rápida (Sin Errores)

### Requisitos Previos
Asegúrate de contar con **Node.js v22.14.0 o superior** y **Docker Desktop** instalados y activos.

### Paso 1: Clonar el repositorio e instalar dependencias esenciales
Para que Prisma 7 funcione bajo el motor nativo `"client"` de Node 22, es mandatorio instalar el Driver Adapter de PostgreSQL para evitar el error de inicialización del constructor.
```bash
# Entrar a la carpeta del backend
cd backend-mock
npm install

# Instalar dependencias nativas del Driver Adapter para PostgreSQL
npm install pg @prisma/adapter-pg
npm install --save-dev @types/pg
```

### Paso 2: Levantar la Base de Datos en Docker
El proyecto incluye un contenedor aislado que redirige el puerto de PostgreSQL al puerto externo **`5433`** de tu máquina para evitar colisiones con bases de datos locales preexistentes.
```bash
docker compose up -d
```
*Verifica en Docker Desktop que el contenedor `wspace_postgres` esté corriendo en el puerto 5433.*

### Paso 3: Configurar Variables de Entorno (`.env`)
Crea un archivo `.env` dentro de la carpeta `backend-mock`. **¡Cuidado con la sintaxis de la URL!** Debe mapear exactamente el puerto `5433` y usar el signo `=` para definir el esquema público:
```env
PORT=5000
JWT_SECRET="Mi_ClAvE_SeCrEtA_SuPeR_SeGuRa_PaRa_WSPACE_2026"
ENCRYPTION_KEY="6275636b65746c697374656e6372797074696f6e6b6579323032367365637265"
DATABASE_URL="postgresql://postgres:wspace_secure_password_2026@localhost:5433/wspace_db?schema=public"
```

### Paso 4: Configurar los Archivos del ORM (Reglas Prisma 7)
1. Tu archivo `prisma/schema.prisma` debe contener la propiedad `url` vinculada a la variable de entorno:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Crea un archivo llamado `prisma.config.js` en la raíz de `backend-mock` para inyectar la URL de forma externa si usas herramientas complementarias del ORM:
   ```javascript
   module.exports = {
     schema: 'prisma/schema.prisma',
     datasource: {
       url: process.env.DATABASE_URL,
     },
   };
   ```

### Paso 5: Sincronizar Base de Datos y Generar Cliente
Ejecuta la migración inyectando la variable en consola para inicializar las tablas físicas y compilar el autocompletado del cliente:
```bash
DATABASE_URL="postgresql://postgres:wspace_secure_password_2026@localhost:5433/wspace_db?schema=public" npx prisma migrate dev --name init_db
DATABASE_URL="postgresql://postgres:wspace_secure_password_2026@localhost:5433/wspace_db?schema=public" npx prisma generate
```

---

## 🏃‍♂️ Ejecución del Proyecto

### ⚠️ Regla de Oro para el Código TypeScript en Node 22 (ESM)
Debido a que `--experimental-strip-types` maneja módulos ESM nativos, los archivos CommonJS (como `express`) no exponen exportaciones con nombre directamente. 
- **Separación de Tipos:** Los tipos de Express deben llamarse usando `import type`.
- **Extensiones Relativas:** Al importar tus propios archivos TypeScript dentro de tus rutas, **mantén las extensiones en `.ts` originales**, ya que la bandera de transformación se encargará de resolver el mapa de módulos en memoria.
  *Ejemplo correcto:* `import prisma from '../config/db.ts';`

### Iniciar el Backend
Desde la carpeta `backend-mock`, ejecuta el servidor inyectando las banderas de interpretación y resolución de TypeScript nativas de Node 22:
```bash
node --experimental-strip-types --experimental-transform-types src/server.ts
```
*Confirmación en consola:* `🚀 Servidor TypeScript corriendo en: http://localhost:5000`

### Iniciar el Frontend
Levanta tu servidor local de desarrollo para el cliente (por defecto en el puerto 3000 o mediante tu extensión de Live Server de VS Code). Asegúrate de que `frontend/js/core/api.js` apunte a la dirección activa de la API:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 🔒 Endpoints Clave de la API (`http://localhost:5000`)

### Autenticación (`/api/auth`)
- `POST /register` -> Registra un usuario procesando validaciones de formato, obligatoriedad y hashes seguros.
- `POST /login` -> Autentica credenciales y emite un Token JWT de acceso seguro con expiración definida.

### Espacios (`/api/spaces`)
- `GET /` -> Consulta pública de espacios disponibles con soporte para filtros dinámicos por ciudad o tipo en PostgreSQL utilizando búsquedas `insensitive`.
- `GET /mine` -> *(Protegida por JWT)* Devuelve los espacios publicados por el anfitrión autenticado.
- `POST /` -> *(Protegida por JWT)* Publica una nueva locación mediante una transacción atómica (`$transaction`) que crea el espacio y asciende el rol del usuario a `wspacer_plus` automáticamente.

### Reservas y Pagos (`/api/bookings` | `/api/payments`)
- `POST /bookings` -> Crea intenciones de reserva calculando tarifas operacionales e impuestos en tiempo real, bloqueando colisiones de horarios.
- `POST /payments/simulate` -> Simula pasarelas de pago transaccionales bancarias con una tasa estocástica de éxito del 95%.

---

## 🛡️ Gestión de Errores y Seguridad Centralizada
- **Filtro Infranqueable:** La validación se gestiona de forma aislada en la capa del backend (`src/validators/`). Si un cliente altera el código de la vista o evade las restricciones del navegador web, los interceptores del servidor bloquean la ejecución inmediatamente devolviendo una respuesta estructurada **`400 Bad Request`**.
- **Blindaje de Excepciones:** Cuenta con un middleware global de errores (`errorHandler.ts`) capaz de unificar las caídas del sistema, errores relacionales de bases de datos de Prisma (como violaciones de restricciones únicas `P2002`) y fallos estructurales de validación de esquemas Zod en respuestas HTTP JSON estables que evitan congelar el hilo de ejecución del servidor.

---

## 🐛 Historial de Errores Manejados y Solucionados

Durante el despliegue y desarrollo del entorno con **Node 22** y **Prisma 7**, se interceptaron y resolvieron los siguientes bloqueos críticos:

1. **`SyntaxError: Named export 'Request' not found`**
   - *Causa:* Node 22 corriendo en modo ESM nativo no puede extraer exportaciones nombradas directamente desde módulos compilados tradicionalmente en CommonJS (como `express`).
   - *Solución:* Se aislaron las firmas separando los tipos mediante `import type { Request, Response } from 'express';`.

2. **`PrismaClientConstructorValidationError (Engine type "client")`**
   - *Causa:* La nueva arquitectura de Prisma 7 en entornos estrictos de TypeScript bloquea el constructor tradicional vacío `new PrismaClient()`. Exige de manera obligatoria un Driver Adapter para comunicarse con bases de datos relacionales en Linux.
   - *Solución:* Se instalaron los módulos `pg` y `@prisma/adapter-pg`, inyectando la configuración mediante un Pool de conexiones activo: `new pkg.PrismaClient({ adapter })`.

3. **`ERR_MODULE_NOT_FOUND (src/routes/auth.js)`**

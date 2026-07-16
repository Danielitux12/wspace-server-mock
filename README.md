# WSPACE

Plataforma de alquiler de espacios físicos por horas — Proyecto Integrador Riwi.

> ⚠️ **`backend-mock/` no es el backend oficial del proyecto.** Es una simulación temporal para poder desarrollar y probar el frontend mientras el backend real (Flask/Express + MySQL/PostgreSQL) del equipo está en construcción. Ver la sección 4.1 de `GUIDE.md` para saber cómo reemplazarlo cuando el backend real esté listo.

## Cómo correr esto localmente

### 1. Backend mock (simulación temporal, para poder probar el frontend ya)
```bash
cd backend-mock
npm install
npm start
```
Queda escuchando en `http://localhost:3000`.

### 2. Frontend
```bash
cd frontend
npx serve .
```
Abre la URL que te indique (usualmente `http://localhost:3000` o `:5000` — si choca con el backend, usa `npx serve . -l 8080`).

### Usuarios de prueba
- `ana@example.com` / `password123` — rol WSpacer
- `carlos@example.com` / `password123` — rol WSpacer+ (ya tiene espacios publicados)

## Documentación del proyecto

Toda la documentación vive en la carpeta `docs/`:

- `docs/GUIDE.md` — guía completa de arquitectura, decisiones y pendientes (léela primero).
- `docs/WSPACE_Documento_Tecnico.md` — documento técnico oficial (entregable del enunciado).
- `docs/WSPACE_Resumen_Ejecutivo_Proyecto.md` — resumen de negocio, marca y justificación técnica.
- `docs/WSPACE_Terminos_y_Politica_Datos.md` — documentos legales.
- `docs/WSPACE_Historias_de_Usuario.md` — historias de usuario para el Product Backlog.

## Estructura del proyecto

```
wspace/
├── docs/            documentación completa (léela primero)
├── frontend/        SPA en HTML/CSS/JS Vanilla
│   └── js/
│       ├── core/       router, autenticación, conexión con la API, idiomas, carga de archivos
│       ├── components/ piezas reutilizables (navbar, modales, tarjetas)
│       └── views/      una pantalla por archivo
└── backend-mock/    backend de prueba temporal (ver docs/GUIDE.md, sección 4.1)
```

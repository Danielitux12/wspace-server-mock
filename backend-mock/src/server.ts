/*
  ARCHIVO: src/server.ts
*/

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.ts';
import bookingRoutes from './routes/bookings.ts';
import spaceRoutes from './routes/spaces.ts';
import paymentRoutes from './routes/payments.ts';
// Importamos el manejador de errores de Prisma/Zod y el de rutas no encontradas
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';

const app = express();

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

// Conectar todas las rutas del backend
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/payments', paymentRoutes);

// 1. Captura cualquier intento de entrar a una dirección que no existe
app.use(notFoundHandler);

// 2. Captura y procesa limpiamente fallos de Zod, Prisma o caídas del servidor
app.use(errorHandler);

// Configurar el puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor TypeScript corriendo en: http://localhost:${PORT}`);
});

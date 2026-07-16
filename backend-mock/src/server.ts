import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.ts';
import bookingRoutes from './routes/bookings.ts';
import spaceRoutes from './routes/spaces.ts';
import paymentRoutes from './routes/payments.ts';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor TypeScript corriendo en: http://localhost:${PORT}`);
});

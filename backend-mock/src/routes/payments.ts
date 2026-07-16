/*
  ARCHIVO: src/routes/payments.ts

  ¿Qué hace este archivo?
  Simula un pago, sin conectarse a ninguna pasarela de pago real (esta
  fue la decisión del equipo para el alcance del proyecto académico).
*/

import express from 'express';
import { bookings } from '../data/mockData.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.post('/simulate', authMiddleware as any, (req: express.Request, res: express.Response): any => {
  const { bookingId } = req.body;

  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });

  // Solo la persona que hizo la reserva puede pagarla
  if (booking.guestId !== (req as any).user.id) {
    return res.status(403).json({ message: 'No tienes permiso sobre esta reserva' });
  }

  if (booking.status !== 'pendiente' && booking.status !== 'confirmada') {
    return res.status(400).json({ message: 'Esta reserva no puede pagarse en su estado actual' });
  }

  // Simulamos que el pago tiene un 95% de probabilidad de salir bien
  const approved = Math.random() > 0.05;

  if (!approved) {
    return res.status(402).json({ message: 'El pago fue rechazado, intenta con otro método' });
  }

  booking.status = 'confirmada';
  booking.paymentReference = `WSP-${Date.now()}`; // número de referencia inventado

  return res.json({ reference: booking.paymentReference, status: 'aprobado' });
});

export default router;

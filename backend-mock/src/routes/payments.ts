import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import prisma from '../config/db.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.post('/simulate', authMiddleware as any, (async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  try {
    const booking = await prisma.reservation.findUnique({
      where: { id: String(bookingId) }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (booking.userId !== String((req as any).user.id)) {
      return res.status(403).json({ message: 'No tienes permiso sobre esta reserva' });
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Esta reserva no puede pagarse en su estado actual' });
    }

    const approved = Math.random() > 0.05;

    if (!approved) {
      return res.status(402).json({ message: 'El pago fue rechazado, intenta con otro método' });
    }

    const updatedBooking = await prisma.reservation.update({
      where: { id: String(bookingId) },
      data: { status: 'CONFIRMED' }
    });

    const paymentReference = `WSP-${Date.now()}`;

    return res.json({ reference: paymentReference, status: 'aprobado' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al procesar la simulación de pago', error });
  }
}) as RequestHandler);

export default router;

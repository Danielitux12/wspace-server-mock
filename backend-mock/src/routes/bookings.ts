import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import prisma from '../config/db.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

function parseTimeToDate(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const baseDate = new Date(dateStr);
  baseDate.setUTCHours(hours, minutes, 0, 0);
  return baseDate;
}

router.post('/', authMiddleware as any, (async (req: Request, res: Response) => {
  const { spaceId, date, startTime, endTime } = req.body;

  try {
    const space = await prisma.space.findUnique({
      where: { id: String(spaceId) }
    });

    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    const startDateTime = parseTimeToDate(date, startTime);
    const endDateTime = parseTimeToDate(date, endTime);

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'El horario seleccionado no es válido' });
    }

    const overlapping = await prisma.reservation.findFirst({
      where: {
        spaceId: String(spaceId),
        reservationDate: new Date(date),
        status: {
          not: 'CANCELLED'
        },
        startTime: {
          lt: endDateTime
        }
      }
    });

    if (overlapping) {
      return res.status(409).json({ message: 'Ese horario ya no está disponible, elige otro' });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        userId: String((req as any).user.id),
        spaceId: String(spaceId),
        reservationDate: new Date(date),
        startTime: startDateTime,
        status: 'PENDING'
      }
    });

    return res.status(201).json(newReservation);
  } catch (error) {
    return res.status(500).json({ message: 'Error al procesar la reserva', error });
  }
}) as RequestHandler);

router.get('/mine', authMiddleware as any, (async (req: Request, res: Response) => {
  try {
    const myBookings = await prisma.reservation.findMany({
      where: { userId: String((req as any).user.id) },
      include: { space: true }
    });
    return res.json(myBookings);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener tus reservas', error });
  }
}) as RequestHandler);

router.get('/host', authMiddleware as any, (async (req: Request, res: Response) => {
  try {
    const hostBookings = await prisma.reservation.findMany({
      where: {
        space: {
          ownerId: String((req as any).user.id)
        }
      },
      include: { space: true }
    });
    return res.json(hostBookings);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las reservas recibidas', error });
  }
}) as RequestHandler);

router.patch('/:id/respond', authMiddleware as any, (async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  try {
    const booking = await prisma.reservation.findUnique({
      where: { id: String(req.params.id) },
      include: { space: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (booking.space.ownerId !== String((req as any).user.id)) {
      return res.status(403).json({ message: 'No tienes permiso sobre esta reserva' });
    }

    const updatedBooking = await prisma.reservation.update({
      where: { id: String(req.params.id) },
      data: { status: status as any }
    });

    return res.json(updatedBooking);
  } catch (error) {
    return res.status(500).json({ message: 'Error al responder a la reserva', error });
  }
}) as RequestHandler);

router.patch('/:id/cancel', authMiddleware as any, (async (req: Request, res: Response) => {
  try {
    const booking = await prisma.reservation.findUnique({
      where: { id: String(req.params.id) }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (booking.userId !== String((req as any).user.id)) {
      return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
    }

    const cancelledBooking = await prisma.reservation.update({
      where: { id: String(req.params.id) },
      data: { status: 'CANCELLED' }
    });

    return res.json(cancelledBooking);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cancelar la reserva', error });
  }
}) as RequestHandler);

export default router;

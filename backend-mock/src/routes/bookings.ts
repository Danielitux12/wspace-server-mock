/*
  ARCHIVO: src/routes/bookings.ts
*/

import express from 'express';
import { bookings, spaces, generateBookingId } from '../data/mockData.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

const GUEST_FEE_RATE = 0.12; 
const HOST_FEE_RATE = 0.06;  
const TAX_RATE = 0.19;       

function calculateHoursBetween(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
}

// Se activa cuando un WSpacer solicita una reserva nueva
router.post('/', authMiddleware as any, (req: express.Request, res: express.Response): any => {
  const { spaceId, date, startTime, endTime } = req.body;

  const space = spaces.find((s: any) => s.id === spaceId);
  if (!space) return res.status(404).json({ message: 'Espacio no encontrado' });

  const hours = calculateHoursBetween(startTime, endTime);
  if (hours <= 0) return res.status(400).json({ message: 'El horario seleccionado no es válido' });

  const overlapping = bookings.find((b: any) =>
    b.spaceId === spaceId &&
    b.date === date &&
    b.status !== 'rechazada' && b.status !== 'cancelada' &&
    startTime < b.endTime && endTime > b.startTime
  );

  if (overlapping) {
    return res.status(409).json({ message: 'Ese horario ya no está disponible, elige otro' });
  }

  const basePrice = space.pricePerHour * hours;
  const guestFee = basePrice * GUEST_FEE_RATE;
  const guestFeeTax = guestFee * TAX_RATE;
  const total = basePrice + guestFee + guestFeeTax;

  const hostFee = basePrice * HOST_FEE_RATE;
  const hostFeeTax = hostFee * TAX_RATE;
  const hostNet = basePrice - hostFee - hostFeeTax;

  const newBooking = {
    id: generateBookingId(),
    spaceId,
    spaceName: space.name,
    guestId: (req as any).user.id,
    guestName: (req as any).user.email,
    hostId: space.ownerId,
    date,
    startTime,
    endTime,
    basePrice,
    guestFee,
    guestFeeTax,
    total,
    hostNet,
    status: 'pendiente',
    responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  bookings.push(newBooking);
  return res.status(201).json(newBooking);
});

// Devuelve las reservas que ha hecho el usuario actual, como WSpacer
router.get('/mine', authMiddleware as any, (req: express.Request, res: express.Response) => {
  const myBookings = bookings.filter((b: any) => b.guestId === (req as any).user.id);
  res.json(myBookings);
});

// Devuelve las reservas que ha recibido el usuario actual
router.get('/host', authMiddleware as any, (req: express.Request, res: express.Response) => {
  const hostBookings = bookings.filter((b: any) => b.hostId === (req as any).user.id);
  res.json(hostBookings);
});

// El anfitrión usa esta ruta para aprobar o rechazar una solicitud
router.patch('/:id/respond', authMiddleware as any, (req: express.Request, res: express.Response): any => {
  const booking: any = bookings.find((b: any) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });

  if (booking.hostId !== (req as any).user.id) {
    return res.status(403).json({ message: 'No tienes permiso sobre esta reserva' });
  }

  const { status } = req.body;
  if (!['confirmada', 'rechazada'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  booking.status = status;
  return res.json(booking);
});

// Ruta para cancelar una reserva hecha por el propio usuario
router.patch('/:id/cancel', authMiddleware as any, (req: express.Request, res: express.Response): any => {
  const booking: any = bookings.find((b: any) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });

  if (booking.guestId !== (req as any).user.id) {
    return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
  }

  booking.status = 'cancelada';
  return res.json(booking);
});

export default router;

import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import prisma from '../config/db.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.get('/', (async (req: Request, res: Response) => {
  const { city, type } = req.query;
  const whereClause: any = {};

  if (city) {
    const cityStr = city.toString();
    whereClause.OR = [
      { city: { contains: cityStr, mode: 'insensitive' } },
      { neighborhood: { contains: cityStr, mode: 'insensitive' } }
    ];
  }

  if (type) {
    whereClause.type = type.toString();
  }

  try {
    const results = await prisma.space.findMany({
      where: whereClause
    });
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar los espacios', error });
  }
}) as RequestHandler);

router.get('/mine', authMiddleware as any, (async (req: Request, res: Response) => {
  try {
    const mySpaces = await prisma.space.findMany({
      where: {
        ownerId: String((req as any).user.id)
      }
    });
    return res.json(mySpaces);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener tus espacios', error });
  }
}) as RequestHandler);

router.get('/:id', (async (req: Request, res: Response) => {
  try {
    const space = await prisma.space.findUnique({
      where: { id: String(req.params.id) }
    });

    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    return res.json(space);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar el detalle del espacio', error });
  }
}) as RequestHandler);

router.post('/', authMiddleware as any, (async (req: Request, res: Response) => {
  const { name, type, city, neighborhood, capacity, pricePerHour, photos, amenities, description } = req.body;

  if (!name || !type || !city || !pricePerHour) {
    return res.status(400).json({ message: 'Faltan campos obligatorios del espacio' });
  }

  const userId = (req as any).user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newSpace = await tx.space.create({
        data: {
          ownerId: String(userId),
          name: String(name),
          type: String(type),
          description: String(description || ''),
          city: String(city),
          neighborhood: String(neighborhood || ''),
          address: String(neighborhood || city || ''),
          pricePerHour: Number(pricePerHour),
          capacity: capacity ? Number(capacity) : 1,
          photos: Array.isArray(photos) ? photos.map(String) : [],
          amenities: Array.isArray(amenities) ? amenities.map(String) : []
        }
      });

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user && String(user.role) !== 'ADMIN') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'ADMIN' }
        });
      }

      return newSpace;
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error transaccional al publicar el espacio', error });
  }
}) as RequestHandler);

export default router;

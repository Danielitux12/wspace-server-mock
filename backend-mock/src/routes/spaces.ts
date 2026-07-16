/*
  ARCHIVO: src/routes/spaces.ts

  ¿Qué hace este archivo?
  Responde a todo lo relacionado con espacios: buscarlos, ver el detalle
  de uno, publicar uno nuevo, y ver los espacios de un usuario en específico.
*/

import express, { Request, Response, RequestHandler } from 'express';
import prisma from '../config/db.ts'; // Conexión a tu PostgreSQL en Docker
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Busca espacios, opcionalmente filtrados por ciudad y/o tipo
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

// Devuelve los espacios que le pertenecen al usuario con sesión iniciada
router.get('/mine', authMiddleware as any, (async (req: Request, res: Response) => {
  try {
    const mySpaces = await prisma.space.findMany({
      where: {
        ownerId: (req as any).user.id
      }
    });
    return res.json(mySpaces);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener tus espacios', error });
  }
}) as RequestHandler);

// Devuelve los datos completos de un espacio, buscándolo por su id
router.get('/:id', (async (req: Request, res: Response) => {
  try {
    // Usamos (prisma.space as any) para saltar el bloqueo de lectura del editor
    const space = await (prisma.space as any).findUnique({
      where: { id: req.params.id }
    });

    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    return res.json(space);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar el detalle del espacio', error });
  }
}) as RequestHandler);

// Crea un espacio nuevo y actualiza el rol del usuario de forma atómica
router.post('/', authMiddleware as any, (async (req: Request, res: Response) => {
  const { name, type, city, neighborhood, capacity, pricePerHour, photos, amenities, description } = req.body;

  if (!name || !type || !city || !pricePerHour) {
    return res.status(400).json({ message: 'Faltan campos obligatorios del espacio' });
  }

  const userId = (req as any).user.id;

  try {
    // Usamos la transacción de Prisma para asegurar que el espacio se cree y el usuario suba de rango de forma segura
    const result = await prisma.$transaction(async (tx) => {
      
      // Creamos el espacio físico forzando el tipado exacto para que calce con tu esquema
      const newSpace = await (tx.space as any).create({
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

      // Buscamos al usuario dueño y actualizamos su rol a wspacer_plus si no lo tiene
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user && user.role !== 'wspacer_plus') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'wspacer_plus' }
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

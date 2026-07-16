/*
  ARCHIVO: src/routes/spaces.ts

  ¿Qué hace este archivo?
  Responde a todo lo relacionado con espacios: buscarlos, ver el detalle
  de uno, publicar uno nuevo, y ver los espacios de un usuario en específico.
*/

import express from 'express';
import { spaces, users, generateSpaceId } from '../data/mockData.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Busca espacios, opcionalmente filtrados por ciudad y/o tipo
router.get('/', (req: express.Request, res: express.Response) => {
  const { city, type } = req.query;

  let results = spaces;

  if (city) {
    const cityStr = city.toString().toLowerCase();
    results = results.filter((s) => s.city.toLowerCase().includes(cityStr) ||
                                     s.neighborhood.toLowerCase().includes(cityStr));
  }

  if (type) {
    results = results.filter((s) => s.type === type.toString());
  }

  return res.json(results);
});

// Devuelve los espacios que le pertenecen al usuario con sesión iniciada
router.get('/mine', authMiddleware as any, (req: express.Request, res: express.Response) => {
  const mySpaces = spaces.filter((s) => s.ownerId === (req as any).user.id);
  return res.json(mySpaces);
});

// Devuelve los datos completos de un espacio, buscándolo por su id
router.get('/:id', (req: express.Request, res: express.Response): any => {
  const space = spaces.find((s) => s.id === req.params.id);
  if (!space) return res.status(404).json({ message: 'Espacio no encontrado' });
  return res.json(space);
});

// Crea un espacio nuevo.
router.post('/', authMiddleware as any, (req: express.Request, res: express.Response): any => {
  const { name, type, city, neighborhood, capacity, pricePerHour, photos, amenities, description } = req.body;

  if (!name || !type || !city || !pricePerHour) {
    return res.status(400).json({ message: 'Faltan campos obligatorios del espacio' });
  }

  const newSpace = {
    id: generateSpaceId(),
    ownerId: (req as any).user.id,
    name,
    type,
    city,
    neighborhood: neighborhood || '',
    capacity: capacity || 1,
    pricePerHour,
    description: description || '',
    photos: photos || [],
    amenities: amenities || [],
    featured: false
  };

  spaces.push(newSpace);

  // Sube de nivel al usuario a wspacer_plus
  const user = users.find((u) => u.id === (req as any).user.id);
  if (user && user.role !== 'wspacer_plus') {
    user.role = 'wspacer_plus';
  }

  return res.status(201).json(newSpace);
});

export default router;

/*
  ARCHIVO: src/config/db.ts
*/

import pkg from '@prisma/client';

// Extraemos el cliente de forma segura desde el paquete base importado
const prisma = new pkg.PrismaClient();

export default prisma;

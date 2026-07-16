/*
  ARCHIVO: src/config/db.ts
*/

import pkg from '@prisma/client';

// Extraemos e inicializamos el cliente inyectando la URL activa de Docker
const prisma = new pkg.PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:wspace_secure_password_2026@localhost:5433/wspace_db?schema=public"
    }
  }
});

export default prisma;

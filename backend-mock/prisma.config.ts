/*
  ARCHIVO: prisma.config.ts / prisma.config.js
*/

import dotenv from 'dotenv';

// Carga las variables del archivo .env de forma explícita
dotenv.config();

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

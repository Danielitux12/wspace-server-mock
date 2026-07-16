/*
  ARCHIVO: src/middleware/errorHandler.ts
*/

import express from 'express';
import pkg from '@prisma/client'; // Importación segura del paquete Prisma para Node 22
import { AppError } from '../utils/AppError.ts';

const { Prisma } = pkg;

// Interfaz local básica para ErrorResponse (puedes mantener tu importación si ya existe)
interface ErrorResponse {
  success: boolean;
  message: string;
  error?: unknown;
}

function handlePrismaError(error: pkg.Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
  details?: unknown;
} {
  switch (error.code) {
    case 'P2002': {
      const target = error.meta?.['target'];
      return {
        statusCode: 409,
        message: `Unique constraint violation on field(s): ${
          Array.isArray(target) ? target.join(', ') : String(target)
        }`,
      };
    }
    case 'P2025':
      return { statusCode: 404, message: 'Resource not found' };
    case 'P2003':
      return {
        statusCode: 400,
        message: 'Invalid reference: related resource does not exist',
      };
    default:
      return { statusCode: 500, message: 'Database error' };
  }
}

export function errorHandler(
  err: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const parsed = handlePrismaError(err);
    statusCode = parsed.statusCode;
    message = parsed.message;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided to the database';
  } else if (err instanceof Error) {
    // Si estás en desarrollo, mostramos el mensaje crudo del sistema
    message = process.env.NODE_ENV === 'development' ? err.message : message;
  }

  if (process.env.NODE_ENV === 'development' && err instanceof Error) {
    console.error(err.stack);
  }

  const body: ErrorResponse = {
    success: false,
    message,
    ...(details !== undefined ? { error: details } : {}),
  };

  res.status(statusCode).json(body);
}

export function notFoundHandler(req: express.Request, res: express.Response): void {
  const body: ErrorResponse = {
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  };
  res.status(404).json(body);
}

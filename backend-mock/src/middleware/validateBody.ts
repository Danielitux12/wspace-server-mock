/*
  ARCHIVO: src/middleware/validateBody.ts
*/
import express from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware genérico para validar el body de la request contra un schema de zod.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: express.Request, _res: express.Response, next: express.NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.badRequest('Validation error', error.flatten()));
        return;
      }
      next(error);
    }
  };
}

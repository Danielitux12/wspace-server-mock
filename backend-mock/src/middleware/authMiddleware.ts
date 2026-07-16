/*
  ARCHIVO: src/middleware/authMiddleware.ts
*/

import express from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'wspace_dev_secret_cambiar_en_produccion';

export interface AuthenticatedRequest extends express.Request {
  user?: any;
}

export function authMiddleware(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): any {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

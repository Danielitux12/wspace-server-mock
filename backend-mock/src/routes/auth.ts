import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../config/db.ts';
import { JWT_SECRET } from '../middleware/authMiddleware.ts';
import { registerValidator, loginValidator } from '../validators/authValidators.ts';

const router = express.Router();

router.post('/register', registerValidator, (async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación en el formulario', 
      errors: errors.array().map(err => err.msg) 
    });
  }

  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role: 'USER'
      }
    });

    return res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno al registrar el usuario', error });
  }
}) as any);

router.post('/login', loginValidator, (async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación en las credenciales', 
      errors: errors.array().map(err => err.msg) 
    });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({ token, user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno al iniciar sesión', error });
  }
}) as any);

export default router;

/*
  ARCHIVO: src/routes/auth.ts
*/

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator'; // 1. Importamos la herramienta de express-validator
import { users, generateUserId } from '../data/mockData.ts';
import { JWT_SECRET } from '../middleware/authMiddleware.ts';
import { registerValidator, loginValidator } from '../validators/authValidators.ts'; // 2. Importamos tus validadores centralizados

const router = express.Router();

// Se activa cuando alguien llena el formulario de "Crear cuenta"
router.post('/register', registerValidator, async (req: express.Request, res: express.Response): Promise<any> => {
  // 3. Capturamos y evaluamos los errores del registerValidator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación en el formulario', 
      errors: errors.array().map(err => err.msg) 
    });
  }

  const { firstName, lastName, email, phone, password, acceptTerms } = req.body;

  // Revisamos que no exista ya alguien registrado con ese mismo correo
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'Este correo ya está registrado' });
  }

  // Convertimos la contraseña en un hash antes de guardarla
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: generateUserId(),
    firstName,
    lastName,
    email,
    phone,
    passwordHash,
    role: 'wspacer', 
    freeBookingsUsed: 0
  };

  users.push(newUser);

  return res.status(201).json({ message: 'Usuario registrado correctamente' });
});

// Se activa cuando alguien llena el formulario de "Iniciar sesion"
router.post('/login', loginValidator, async (req: express.Request, res: express.Response): Promise<any> => {
  // 4. Capturamos y evaluamos los errores del loginValidator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación en las credenciales', 
      errors: errors.array().map(err => err.msg) 
    });
  }

  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }

  // Comparamos la contraseña que escribió con el hash guardado
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const { passwordHash, ...userWithoutPassword } = user;

  return res.json({ token, user: userWithoutPassword });
});

export default router;

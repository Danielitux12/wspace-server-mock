/*
  ARCHIVO: src/routes/auth.ts
*/

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../config/db.ts'; // 1. Importamos la conexión real a PostgreSQL
import { JWT_SECRET } from '../middleware/authMiddleware.ts';
import { registerValidator, loginValidator } from '../validators/authValidators.ts';

const router = express.Router();

// Se activa cuando alguien llena el formulario de "Crear cuenta"
router.post('/register', registerValidator, async (req: express.Request, res: express.Response): Promise<any> => {
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
    // 2. Revisamos si el correo ya existe de forma asíncrona en PostgreSQL
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    // Convertimos la contraseña en un hash antes de guardarla
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insertamos el nuevo usuario físicamente mediante Prisma
    await prisma.user.create({
      data: {
        name: firstName, // Mapeamos firstName al campo 'name' de tu esquema
        lastName,
        email,
        phone,
        passwordHash,
        role: 'wspacer' // Valor por defecto del rol
      }
    });

    return res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno al registrar el usuario', error });
  }
});

// Se activa cuando alguien llena el formulario de "Iniciar sesión"
router.post('/login', loginValidator, async (req: express.Request, res: express.Response): Promise<any> => {
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
    // 4. Consultamos el usuario en la base de datos real
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Comparamos la contraseña recibida con el hash de PostgreSQL
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Emitimos el token JWT usando los datos obtenidos de la BD
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Omitimos la contraseña antes de responderle al cliente
    const { passwordHash, ...userWithoutPassword } = user;

    return res.json({ token, user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno al iniciar sesión', error });
  }
});

export default router;

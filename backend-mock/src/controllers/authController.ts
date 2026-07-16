import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { encrypt, decrypt } from '../utils/cryptoHelper.js';
import prisma from '../config/db.js'; // Importamos Prisma

// 1. REGISTRO (Crear cuenta en BD con Cifrado Total)
export const register = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, lastName, email, phone, password, confirmPassword, acceptTerms } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }
    if (!acceptTerms) {
      return res.status(400).json({ message: "Debe aceptar los términos y condiciones" });
    }

    // Ciframos el email antes de buscar en la BD (para poder hacer match exacto con el registro cifrado)
    const encryptedEmail = encrypt(email.toLowerCase());

    // Prisma busca directamente en la base de datos el correo cifrado
    const userExists = await prisma.user.findUnique({
      where: { email: encryptedEmail }
    });

    if (userExists) {
      return res.status(400).json({ message: "Este correo electrónico ya está registrado" });
    }

    // Hashear contraseña con bcryptjs
    const hashedPassword = await bcrypt.hash(password, 12);

    // Guardar en la base de datos real usando Prisma
    await prisma.user.create({
      data: {
        name: encrypt(name),
        lastName: encrypt(lastName),
        email: encryptedEmail,
        phone: encrypt(phone), // El validador ya garantizó que llegó como entero
        passwordHash: hashedPassword,
        role: "vspacer"
      }
    });

    return res.status(201).json({ message: "¡Usuario creado con éxito en la base de datos!" });

  } catch (error) {
    return res.status(500).json({ message: "Error al registrar el usuario en el servidor" });
  }
};

// 2. LOGIN (Consulta a la BD + Descifrado para el Frontend)
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Ciframos el correo de entrada para buscar su equivalente exacto en la BD
    const encryptedEmail = encrypt(email.toLowerCase());

    // Consulta limpia a la base de datos por el correo único
    const user = await prisma.user.findUnique({
      where: { email: encryptedEmail }
    });

    if (!user) {
      return res.status(401).json({ message: "El correo o la contraseña son incorrectos" });
    }

    // Validar contraseña
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "El correo o la contraseña son incorrectos" });
    }

    // Firmar Token de sesión para el LocalStorage del Frontend
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'firma_secreta_express_prisma',
      { expiresIn: '7d' }
    );

    // Desciframos los datos antes de enviarlos por el canal seguro de la respuesta HTTP
    return res.status(200).json({
      message: "¡Inicio de sesión exitoso!",
      token,
      user: {
        id: user.id,
        name: decrypt(user.name),
        lastName: decrypt(user.lastName),
        email: decrypt(user.email),
        phone: parseInt(decrypt(user.phone)),
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor durante el inicio de sesión" });
  }
};

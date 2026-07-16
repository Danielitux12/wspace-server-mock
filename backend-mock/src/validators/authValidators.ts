/*
  ARCHIVO: src/validators/authValidators.ts
*/
import { body } from 'express-validator';

// 1. REGLAS PARA EL REGISTRO (Crear cuenta)
export const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('lastName').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('Ingresa un correo electrónico válido'),
  body('phone').trim().notEmpty().withMessage('El teléfono es obligatorio'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Las contraseñas ingresadas no coinciden');
    }
    return true;
  }),
  body('acceptTerms').custom((value) => {
    if (value !== true && value !== 'true') {
      throw new Error('Debes aceptar los términos y condiciones');
    }
    return true;
  })
];

// 2. REGLAS PARA EL LOGIN (Iniciar sesión)
export const loginValidator = [
  body('email').isEmail().withMessage('Ingresa un correo electrónico válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

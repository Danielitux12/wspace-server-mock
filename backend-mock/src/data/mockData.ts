/*
  ARCHIVO: src/data/mockData.ts
*/

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
  freeBookingsUsed: number;
}

export interface Space {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  city: string;
  neighborhood: string;
  capacity: number;
  pricePerHour: number;
  description: string;
  photos: string[];
  amenities: string[];
  featured: boolean;
}

export const users: User[] = [
  {
    id: 'u1',
    firstName: 'Ana',
    lastName: 'Torres',
    email: 'ana@example.com',
    phone: '3001234567',
    passwordHash: '$2a$10$Fxvjg5bms53MwF1KyGng2OtEca7aXHuK8UUup4HKGPqwpkxnuVyQ6',
    role: 'wspacer',
    freeBookingsUsed: 0
  },
  {
    id: 'u2',
    firstName: 'Carlos',
    lastName: 'Pérez',
    email: 'carlos@example.com',
    phone: '3007654321',
    passwordHash: '$2a$10$Fxvjg5bms53MwF1KyGng2OtEca7aXHuK8UUup4HKGPqwpkxnuVyQ6',
    role: 'wspacer_plus',
    freeBookingsUsed: 0
  }
];

export const spaces: Space[] = [
  {
    id: 's1',
    ownerId: 'u2',
    name: 'Oficina ejecutiva El Poblado',
    type: 'oficina_privada',
    city: 'Medellín',
    neighborhood: 'El Poblado',
    capacity: 4,
    pricePerHour: 45000,
    description: 'Oficina privada, luminosa, ideal para reuniones de trabajo.',
    photos: ['https://unsplash.com'],
    amenities: ['wifi', 'proyector', 'cafe', 'aire_acondicionado'],
    featured: true
  },
  {
    id: 's2',
    ownerId: 'u2',
    name: 'Sala de ensayo Rock Room',
    type: 'sala_ensayo',
    city: 'Bogotá',
    neighborhood: 'Chapinero',
    capacity: 5,
    pricePerHour: 35000,
    description: 'Sala insonorizada con batería y amplificadores incluidos.',
    photos: ['https://unsplash.com'],
    amenities: ['bateria', 'amplificador', 'microfono', 'insonorizacion'],
    featured: true
  }
];

export const bookings: any[] = [];

let bookingCounter = 1;
export function generateBookingId(): string {
  return `b${bookingCounter++}`;
}

let spaceCounter = spaces.length + 1;
export function generateSpaceId(): string {
  return `s${spaceCounter++}`;
}

let userCounter = users.length + 1;
export function generateUserId(): string {
  return `u${userCounter++}`;
}

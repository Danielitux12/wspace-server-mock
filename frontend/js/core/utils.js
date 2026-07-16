/*
  ARCHIVO: utils.js

  ¿Qué hace este archivo?
  Aquí guardamos "herramientas" pequeñas que se usan en muchas partes distintas
  de la página, para no tener que escribir el mismo código varias veces.
  También aquí están guardadas las listas de categorías de espacio y
  amenidades (wifi, batería, parqueadero, etc.) que se usan en varias vistas.
*/

// Convierte un número (ej: 45000) en un precio bonito para mostrar (ej: $45.000)
function formatPrice(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

// Muestra un mensaje pequeño que aparece abajo de la pantalla por unos segundos y luego desaparece
// (por ejemplo: "Reserva enviada" o "No se pudo guardar")
function showToast(message, duration = 3000) {
  let toastEl = document.getElementById('toast');

  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = message;
  toastEl.classList.add('show');

  setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

// Revisa si un correo electrónico está bien escrito (tiene @ y un punto después, por ejemplo)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Revisa que el teléfono tenga exactamente 10 números
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

// Lee lo que hay despues del "?" en la direccion web (URL) y lo convierte en algo
// facil de usar. Ejemplo: si la direccion es "/espacios?tipo=oficina", esto
// devuelve { tipo: "oficina" }
function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

// Hace lo contrario a la funcion anterior: arma una direccion web con filtros.
// Ejemplo: buildUrlWithParams("/espacios", { tipo: "oficina" }) devuelve "/espacios?tipo=oficina"
function buildUrlWithParams(path, params) {
  const filteredParams = Object.entries(params).filter(([_, value]) => value !== '' && value != null);
  const query = new URLSearchParams(Object.fromEntries(filteredParams)).toString();
  return query ? `${path}?${query}` : path;
}

// Calcula cuantas horas hay entre una hora de inicio y una de fin.
// Ejemplo: calculateHours("14:00", "16:30") devuelve 2.5 (dos horas y media)
function calculateHours(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return Math.max(0, (endMinutes - startMinutes) / 60);
}

// Lista de las 5 categorias de espacio que ofrece WSPACE, con su nombre en
// espanol, en ingles, y un icono para mostrar en pantalla
const CATEGORY_LABELS = {
  oficina_privada: { es: 'Oficina privada', en: 'Private office', icon: '🏢' },
  sala_juntas: { es: 'Sala de juntas', en: 'Meeting room', icon: '🧑\u200d🤝\u200d🧑' },
  coworking: { es: 'Coworking', en: 'Coworking', icon: '💻' },
  espacio_creativo: { es: 'Espacio creativo', en: 'Creative space', icon: '🎨' },
  sala_ensayo: { es: 'Sala de ensayo musical', en: 'Music rehearsal room', icon: '🎸' }
};

// Indica que amenidades (comodidades) tiene sentido mostrar segun el tipo de
// espacio. Por ejemplo, una oficina puede tener "cafe", pero una sala de
// ensayo musical en cambio puede tener "bateria" o "amplificador"
const AMENITIES_BY_CATEGORY = {
  oficina_privada: ['wifi', 'proyector', 'pizarra', 'cafe', 'parqueadero', 'aire_acondicionado'],
  sala_juntas: ['wifi', 'proyector', 'pizarra', 'cafe', 'parqueadero'],
  coworking: ['wifi', 'cafe', 'lockers', 'luz_natural'],
  espacio_creativo: ['insonorizacion', 'iluminacion_pro', 'cabina_vocal', 'fondo_croma'],
  sala_ensayo: ['bateria', 'amplificador', 'microfono', 'insonorizacion', 'consola_mezcla']
};

// Nombre e icono de cada amenidad individual, en espanol e ingles
const AMENITY_LABELS = {
  wifi: { es: 'Wifi', en: 'Wifi', icon: '📶' },
  proyector: { es: 'Proyector', en: 'Projector', icon: '📽️' },
  pizarra: { es: 'Pizarra', en: 'Whiteboard', icon: '🖊️' },
  cafe: { es: 'Punto de café', en: 'Coffee point', icon: '☕' },
  parqueadero: { es: 'Parqueadero', en: 'Parking', icon: '🚗' },
  aire_acondicionado: { es: 'Aire acondicionado', en: 'Air conditioning', icon: '❄️' },
  lockers: { es: 'Lockers', en: 'Lockers', icon: '🔒' },
  luz_natural: { es: 'Luz natural', en: 'Natural light', icon: '☀️' },
  insonorizacion: { es: 'Insonorización', en: 'Soundproofing', icon: '🔇' },
  iluminacion_pro: { es: 'Iluminación profesional', en: 'Professional lighting', icon: '💡' },
  cabina_vocal: { es: 'Cabina vocal', en: 'Vocal booth', icon: '🎙️' },
  fondo_croma: { es: 'Fondo croma', en: 'Green screen', icon: '🟩' },
  bateria: { es: 'Batería incluida', en: 'Drum kit included', icon: '🥁' },
  amplificador: { es: 'Amplificador', en: 'Amplifier', icon: '🔊' },
  microfono: { es: 'Micrófono', en: 'Microphone', icon: '🎤' },
  consola_mezcla: { es: 'Consola de mezcla', en: 'Mixing console', icon: '🎛️' }
};

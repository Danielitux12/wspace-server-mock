/*
  ARCHIVO: api.js

  ¿Qué hace este archivo?
  Es el "mensajero" entre la página y el servidor (backend). Cada vez que
  necesitamos pedir información (por ejemplo, la lista de espacios) o
  enviar información (por ejemplo, crear una reserva), la orden pasa por
  una función de este archivo.

  ¿Por qué juntar todo esto en un solo lugar?
  Porque si el día de mañana el backend real (el que construye el resto
  del equipo) cambia alguna dirección o algún nombre, solo hay que venir
  a corregirlo AQUÍ, en un solo archivo, en vez de buscar y cambiar cada
  pantalla una por una.
*/

// Direccion donde vive el servidor. Hay que cambiar esto cuando conecten
// el backend real del equipo (ver GUIDE.md, seccion 4.1)
// modifique la url en tu frontend  
const API_BASE_URL = 'http://localhost:5000/api';

// ----- Espacios -----

// Pide al servidor la lista de espacios, opcionalmente filtrada
// (por ejemplo, solo los de tipo "coworking" en la ciudad "Cali")
async function fetchSpaces(filters = {}) {
  const url = buildUrlWithParams(`${API_BASE_URL}/spaces`, filters);
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudieron cargar los espacios');
  return response.json();
}

// Pide al servidor los datos completos de un espacio especifico, usando su id
async function fetchSpaceById(id) {
  const response = await fetch(`${API_BASE_URL}/spaces/${id}`);
  if (!response.ok) throw new Error('No se encontró el espacio');
  return response.json();
}

// Envia al servidor los datos de un espacio nuevo que un WSpacer+ quiere publicar
async function createSpace(spaceData) {
  const response = await authFetch('/spaces', {
    method: 'POST',
    body: JSON.stringify(spaceData)
  });
  if (!response.ok) throw new Error('No se pudo publicar el espacio');
  return response.json();
}

// Pide al servidor los espacios que le pertenecen al usuario que tiene la sesion iniciada
async function fetchMySpaces() {
  const response = await authFetch('/spaces/mine');
  if (!response.ok) throw new Error('No se pudieron cargar tus espacios');
  return response.json();
}

// ----- Reservas -----

// Envia al servidor una solicitud de reserva nueva (fecha, hora, que espacio)
async function createBooking(bookingData) {
  const response = await authFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo crear la reserva');
  return data;
}

// Pide al servidor las reservas que ha hecho el usuario actual (como WSpacer)
async function fetchMyBookings() {
  const response = await authFetch('/bookings/mine');
  if (!response.ok) throw new Error('No se pudieron cargar tus reservas');
  return response.json();
}

// Pide al servidor las solicitudes de reserva que ha recibido el usuario
// actual en sus espacios publicados (como WSpacer+)
async function fetchHostBookings() {
  const response = await authFetch('/bookings/host');
  if (!response.ok) throw new Error('No se pudieron cargar las reservas recibidas');
  return response.json();
}

// El anfitrion (WSpacer+) usa esta funcion para aprobar o rechazar una solicitud de reserva
async function respondBooking(bookingId, decision) {
  // decision puede ser "confirmada" o "rechazada"
  const response = await authFetch(`/bookings/${bookingId}/respond`, {
    method: 'PATCH',
    body: JSON.stringify({ status: decision })
  });
  if (!response.ok) throw new Error('No se pudo actualizar la reserva');
  return response.json();
}

// El WSpacer usa esta funcion para cancelar una reserva que ya habia hecho
async function cancelBooking(bookingId) {
  const response = await authFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
  if (!response.ok) throw new Error('No se pudo cancelar la reserva');
  return response.json();
}

// ----- Pagos -----

// Simula el pago de una reserva (el equipo decidio NO conectar una pasarela
// de pago real, ver GUIDE.md). El servidor "hace de cuenta" que cobro y
// devuelve un numero de referencia
async function simulatePayment(bookingId) {
  const response = await authFetch('/payments/simulate', {
    method: 'POST',
    body: JSON.stringify({ bookingId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'El pago no pudo procesarse');
  return data;
}

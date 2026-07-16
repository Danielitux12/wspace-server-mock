/*
  ARCHIVO: auth.js

  ¿Qué hace este archivo?
  Todo lo relacionado con "quién es el usuario y si puede entrar": crear
  cuenta, iniciar sesión, cerrar sesión, y avisar si alguien intenta ver
  una página para la que necesita estar logueado.

  ¿Qué es el "token"?
  Cuando alguien inicia sesión correctamente, el servidor le entrega una
  especie de "carnet digital" (el token). Ese carnet se guarda en la
  memoria del navegador (localStorage) y se lo mostramos al servidor cada
  vez que pedimos algo privado (por ejemplo, "mis reservas"), para que el
  servidor sepa que somos nosotros y no cualquier persona.

  ¿Por qué se guarda en localStorage y no en otro lado?
  Porque localStorage se comparte entre pestañas del navegador. Eso es lo
  que permite que, cuando el usuario abre "modo anfitrión" en una pestaña
  nueva, esa pestaña ya sepa quién es sin pedirle que inicie sesión de nuevo.
*/

const TOKEN_KEY = 'wspace_token';
const USER_KEY = 'wspace_user';

// Envia los datos del formulario de registro al servidor para crear una cuenta nueva
async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar el registro');
  }

  return data;
}

// Envia correo y contrasena al servidor. Si son correctos, guarda el
// "carnet digital" (token) y los datos del usuario en el navegador
async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Correo o contraseña incorrectos');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

// Borra el carnet digital y los datos del usuario, y lo manda de vuelta al Home.
// Esto es lo que pasa cuando alguien hace clic en "Cerrar sesión"
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  navigateTo('/');
  showToast(t('nav.logout'));
}

// Devuelve los datos del usuario que esta actualmente conectado (nombre, correo, rol, etc.)
// sin necesidad de preguntarle al servidor otra vez
function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Responde si o no: ¿hay alguien con sesion iniciada en este momento?
function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// Responde si o no: ¿el usuario actual es un WSpacer+ (puede publicar espacios)?
function isHost() {
  const user = getCurrentUser();
  return user && user.role === 'wspacer_plus';
}

// Actualiza los datos guardados del usuario (por ejemplo, cuando pasa de
// WSpacer a WSpacer+ despues de publicar su primer espacio)
function updateStoredUser(newUserData) {
  localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
}

// Esta funcion reemplaza al "fetch" normal para pedirle cosas al servidor,
// pero automaticamente le agrega el carnet digital (token) del usuario.
// Se usa en TODAS las peticiones que necesitan saber quien es el usuario
// (mis reservas, publicar espacio, aprobar una solicitud, etc.)
async function authFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  // Si el servidor dice "401" significa que el carnet ya vencio o no es valido.
  // En ese caso, cerramos la sesion automaticamente y avisamos al usuario
  if (response.status === 401) {
    logoutUser();
    showToast('Tu sesión expiró, inicia sesión de nuevo');
    throw new Error('No autenticado');
  }

  return response;
}

// Se usa antes de mostrar una pagina privada (ej: "mis reservas").
// Si el usuario NO ha iniciado sesion, en vez de mostrar la pagina,
// le abrimos la ventana de login para que primero inicie sesion
function requireAuth(renderCallback) {
  if (!isAuthenticated()) {
    openLoginModal();
    return;
  }
  renderCallback();
}

// Igual que la funcion anterior, pero ademas exige que el usuario
// tenga el rol de WSpacer+ (por ejemplo, para ver el Dashboard de anfitrion)
function requireHostRole(renderCallback) {
  if (!isAuthenticated() || !isHost()) {
    showToast('Necesitas ser WSpacer+ para acceder a esta sección');
    navigateTo('/');
    return;
  }
  renderCallback();
}

// Revisa que los datos del formulario de registro esten bien completados
// antes de enviarlos al servidor. Si algo esta mal, devuelve el mensaje
// de error exacto para mostrarselo al usuario debajo del campo correspondiente
function validateRegisterForm(data) {
  const errors = {};

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = 'Ingresa tu nombre';
  }
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = 'Ingresa tu apellido';
  }
  if (!isValidEmail(data.email)) {
    errors.email = 'Ingresa un correo válido';
  }
  if (!data.password || data.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  if (!isValidPhone(data.phone)) {
    errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
  }
  if (!data.acceptTerms) {
    errors.acceptTerms = 'Debes aceptar los términos y condiciones';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/*
  ARCHIVO: navbar.js

  ¿Qué hace este archivo?
  Dibuja la barra de navegacion de arriba de la pagina. No siempre se ve
  igual: cambia dependiendo de si hay alguien con sesion iniciada, y si
  esa persona es un WSpacer (busca espacios) o un WSpacer+ (publica espacios).
*/


// Dibuja toda la barra de navegacion desde cero
function renderNavbar() {
  const navbarContainer = document.getElementById('navbar');
  const user = getCurrentUser();

  navbarContainer.innerHTML = `
    <div class="navbar">
      <a href="/" data-link>
        <img src="photos/logo.png" alt="WSPACE" style="height: 35px;">
      </a>

      <div class="navbar-links">
        <a href="/espacios" data-link class="btn btn-outline" style="color: #0B5443;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align: -3px; margin-right: 4px;">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span data-i18n="nav.search" style="text-transform: uppercase;">Buscar espacios</span>
        </a>
        ${user ? renderLoggedLinks(user) : ''}
      </div>

      <div class="navbar-actions">
        <button id="lang-toggle-btn" class="btn btn-outline" style="padding:8px 12px;">
          ${getCurrentLang() === 'es' ? 'EN' : 'ES'}
        </button>

        ${user ? renderProfileMenu(user) : renderGuestActions()}

        <button class="navbar-menu-toggle" id="mobile-menu-btn" aria-label="Menú">☰</button>
      </div>
    </div>
  `;

  attachNavbarEvents();

  // CORRECCION: cada vez que el navbar se vuelve a dibujar (por ejemplo,
  // justo despues de cambiar de idioma), hay que volver a traducir su
  // contenido. Antes esto no pasaba aqui, asi que despues de tocar el
  // boton ES/EN el navbar se quedaba a medio traducir hasta que el
  // usuario navegaba a otra pantalla
  applyTranslations();
}

// Decide que links mostrar cuando hay alguien logueado: si esta en la
// zona de anfitrion, muestra los links de anfitrion; si no, los de buscador
function renderLoggedLinks(user) {
  if (user.role === 'wspacer_plus' && window.location.pathname.startsWith('/dashboard')) {
    return `
      <a href="/dashboard" data-link data-i18n="nav.dashboard">Dashboard</a>
      <a href="/mis-espacios" data-link data-i18n="nav.mySpaces">Mis espacios</a>
      <a href="/mis-espacios/reservas" data-link data-i18n="nav.hostBookings">Reservas recibidas</a>
    `;
  }
  return `
    <a href="/mis-reservas" data-link data-i18n="nav.myBookings">Mis reservas</a>
    <a href="/favoritos" data-link data-i18n="nav.favorites">Favoritos</a>
  `;
}

// Si NADIE ha iniciado sesion, mostramos solo el boton de "Iniciar sesion"
function renderGuestActions() {
  return `<button id="open-login-btn" class="btn btn-primary" style="background: #0f6e56;" data-i18n="nav.login">Iniciar sesión</button>`;
}

// Dibuja el menu que aparece al hacer clic en el nombre del usuario
// (arriba a la derecha), con las opciones de perfil, notificaciones, etc.
function renderProfileMenu(user) {
  const isInHostArea = window.location.pathname.startsWith('/dashboard') ||
                        window.location.pathname.startsWith('/mis-espacios');

  // Este bloque decide que texto y que link mostrar para "cambiar de modo"
  // (de WSpacer a WSpacer+ o viceversa). Ese cambio SIEMPRE abre una
  // pestana nueva del navegador (por eso target="_blank"), en vez de
  // navegar dentro de la misma pantalla, tal como lo pidio el equipo
  let switchLinkHtml = '';

  if (isInHostArea) {
    switchLinkHtml = `<a href="/espacios" target="_blank" rel="noopener" data-i18n="nav.guestMode">Ir a modo WSpacer ↗</a>`;
  } else if (user.role === 'wspacer_plus') {
    switchLinkHtml = `<a href="/dashboard" target="_blank" rel="noopener" data-i18n="nav.hostMode">Ir a modo anfitrión ↗</a>`;
  } else {
    switchLinkHtml = `<a href="/mis-espacios/nuevo" target="_blank" rel="noopener" data-i18n="nav.becomeHost">Convertirme en WSpacer+ ↗</a>`;
  }

  return `
    <div class="profile-menu">
      <button id="profile-menu-btn" class="btn btn-outline">👤 ${user.firstName}</button>
      <div class="profile-dropdown" id="profile-dropdown">
        <a href="/perfil" data-link data-i18n="nav.profile">Mi perfil</a>
        <a href="/notificaciones" data-link data-i18n="nav.notifications">Notificaciones</a>
        <hr>
        ${switchLinkHtml}
        <hr>
        <a href="/terminos" data-link>Términos y condiciones</a>
        <a href="/politica-datos" data-link>Política de datos</a>
        <hr>
        <button id="logout-btn" data-i18n="nav.logout">Cerrar sesión</button>
      </div>
    </div>
  `;
}

// Conecta los botones de la barra de navegacion con lo que deben hacer al hacer clic
function attachNavbarEvents() {
  // Boton de cambiar idioma (ES/EN)
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', async () => {
      await toggleLanguage();
      renderNavbar(); // volvemos a dibujar la barra para que el texto del boton tambien cambie
    });
  }

  // Boton de "Iniciar sesion"
  const loginBtn = document.getElementById('open-login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }

  // Boton con el nombre del usuario, que abre/cierra el menu desplegable
  const profileBtn = document.getElementById('profile-menu-btn');
  const dropdown = document.getElementById('profile-dropdown');
  if (profileBtn && dropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    // Si el usuario hace clic en cualquier otra parte de la pantalla, cerramos el menu
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  // Boton de "Cerrar sesion"
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  // Boton de las 3 lineas (☰): en celular, abre y cierra la lista de links
  // que en pantallas grandes ya se ve siempre. Antes este boton no tenia
  // ninguna accion conectada, por eso no pasaba nada al tocarlo
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.navbar-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('mobile-open');
    });
    // Si el usuario toca cualquier otra parte de la pantalla, cerramos el menu
    document.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
  }
}

// Se llama cada vez que el usuario cambia de pantalla, para que la barra
// de navegacion se actualice (por ejemplo, si entro a la zona de anfitrion)
function updateNavbarState() {
  renderNavbar();
}
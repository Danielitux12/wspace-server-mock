/*
  ARCHIVO: home.js

  ¿Qué hace este archivo?
  Dibuja la pantalla principal (Home) de WSPACE, la primera que ve
  cualquier persona al entrar. De arriba a abajo tiene: el buscador
  grande, un banner de promocion, las categorias de espacio, los
  espacios destacados, los mas reservados, y el banner que invita a
  publicar un espacio.
*/

async function renderHomeView(container) {
  container.innerHTML = `
    <section class="hero">
      <h1 data-i18n="home.tagline">El espacio que necesitas, cuando lo necesitas</h1>
      ${renderSearchBar()}
    </section>

    <div class="container">
      <div class="promo-carousel" id="promo-carousel">
       <img alt="Promoción 1" class="promo-slide active" data-slide="1">
       <img alt="Promoción 2" class="promo-slide" data-slide="2">
       <img alt="Promoción 3" class="promo-slide" data-slide="3">
      </div>

      <section class="section">
        <h2 class="section-title" data-i18n="home.categoriesTitle">Explora por categoría</h2>
        <div class="categories-grid" id="categories-grid"></div>
      </section>

      <section class="section">
        <h2 class="section-title" data-i18n="home.featuredTitle">Espacios destacados</h2>
        <div class="spaces-grid" id="featured-spaces"></div>
      </section>

      <section class="section">
        <h2 class="section-title" data-i18n="home.popularTitle">Más reservados</h2>
        <div class="spaces-grid" id="popular-spaces"></div>
      </section>

      <div id="host-banner-container"></div>
    </div>
  `;

  attachSearchBarEvents();
  renderCategoriesGrid();
  renderHostBanner();
  startPromoCarousel();

  // Le pedimos al servidor la lista de espacios para llenar
  // las secciones de "destacados" y "mas reservados"
  try {
    const allSpaces = await fetchSpaces();
    document.getElementById('featured-spaces').innerHTML =
      allSpaces.filter((s) => s.featured).map(renderSpaceCard).join('') || '<p>Próximamente</p>';
    document.getElementById('popular-spaces').innerHTML =
      allSpaces.slice(0, 6).map(renderSpaceCard).join('');
  } catch (error) {
    console.error(error);
  }
}

// Dibuja la barra de busqueda grande (ubicacion, tipo, fecha, hora).
// Se reutiliza tanto en el Home como en la pantalla de resultados
function renderSearchBar() {
  const categoryOptions = Object.entries(CATEGORY_LABELS)
    .map(([key, labels]) => `<option value="${key}">${labels[getCurrentLang()]}</option>`)
    .join('');

  return `
    <div class="search-bar">
      <div class="form-group">
        <label data-i18n="home.location">Ubicación</label>
        <input type="text" id="search-city" placeholder="Ciudad o barrio">
      </div>
      <div class="form-group">
        <label data-i18n="home.spaceType">Tipo de espacio</label>
        <select id="search-type">
          <option value="">Todos</option>
          ${categoryOptions}
        </select>
      </div>
      <div class="form-group">
        <label data-i18n="home.date">Fecha</label>
        <input type="date" id="search-date">
      </div>
      <div class="form-group">
        <label data-i18n="home.startTime">Hora inicio</label>
        <input type="time" id="search-startTime">
      </div>
      <button class="btn btn-primary" id="search-submit-btn" style="background: #a55086;" data-i18n="home.searchCta">Buscar</button>
    </div>
  `;
}

// Cuando la persona hace clic en "Buscar", tomamos lo que escribio/eligio
// y la mandamos a la pantalla de resultados con esos filtros ya aplicados
function attachSearchBarEvents() {
  const btn = document.getElementById('search-submit-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const filters = {
      city: document.getElementById('search-city').value,
      type: document.getElementById('search-type').value,
      date: document.getElementById('search-date').value,
      startTime: document.getElementById('search-startTime').value
    };
    navigateTo(buildUrlWithParams('/espacios', filters));
  });
}

// Dibuja los 5 cuadros de categorias (oficina, sala de juntas, coworking, etc.)
function renderCategoriesGrid() {
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = Object.entries(CATEGORY_LABELS).map(([key, labels]) => `
    <a href="${buildUrlWithParams('/espacios', { type: key })}" data-link class="category-card">
      <div class="icon">${labels.icon}</div>
      <div class="label">${labels[getCurrentLang()]}</div>
    </a>
  `).join('');
}

// Dibuja el banner de "publica tu espacio" al final del Home.
// El texto y el link cambian dependiendo de quien este mirando la pagina:
// - Si nadie ha iniciado sesion: invita a registrarse
// - Si es un WSpacer que aun no publica nada: invita a subir de nivel a WSpacer+
// - Si ya es WSpacer+: invita a publicar OTRO espacio
function renderHostBanner() {
  const container = document.getElementById('host-banner-container');
  const user = getCurrentUser();

  let title, cta, link;

  if (!user) {
    title = t('home.hostBannerGuestTitle');
    cta = t('home.hostBannerGuestCta');
    link = '/registro-host';
  } else if (user.role === 'wspacer_plus') {
    title = t('home.hostBannerActiveTitle');
    cta = t('home.hostBannerActiveCta');
    link = '/mis-espacios/nuevo';
  } else {
    title = t('home.hostBannerUpgradeTitle');
    cta = t('home.hostBannerUpgradeCta');
    link = '/mis-espacios/nuevo';
  }

  container.innerHTML = `
    <div class="banner banner-host">
      <h3>🏢 ${title}</h3>
      <p data-i18n="home.hostBannerGuestText">Publícalo en WSPACE y empieza a generar ingresos con tus horas libres.</p>
      <a href="${link}" data-link class="btn btn-secondary">${cta}</a>
    </div>
  `;
}

// Hace que las imagenes del carrusel de promociones vayan cambiando solas,
// y elige el set de imagenes correcto segun el idioma activo (es/en)
function startPromoCarousel() {
  const slides = document.querySelectorAll('#promo-carousel .promo-slide');
  if (slides.length === 0) return;

  function updateSlideImages() {
    const lang = getCurrentLang();
    slides.forEach((slide) => {
      const slideNumber = slide.getAttribute('data-slide');
      slide.src = `photos/promo${slideNumber}-${lang}.jpg`;
    });
  }

  updateSlideImages();

  let currentIndex = 0;
  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');
  }, 4500);

  window.addEventListener('wspace:languageChanged', updateSlideImages);
}

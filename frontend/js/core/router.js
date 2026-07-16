/*
  ARCHIVO: router.js

  ¿Qué hace este archivo?
  Es el "cerebro" que hace que la pagina se comporte como una app moderna
  (SPA = Single Page Application), en vez de una pagina web antigua.

  ¿Cual es la diferencia?
  En una pagina web antigua, cada vez que haces clic en un link, el
  navegador recarga TODA la pagina desde cero (se pone blanca un segundo
  y vuelve a aparecer). Eso es lento y se ve anticuado.

  En cambio, aqui interceptamos esos clics: en vez de dejar que el
  navegador recargue todo, nosotros mismos cambiamos solamente el
  contenido de la pantalla (por ejemplo, de "Home" a "Lista de espacios"),
  sin recargar nada. Se ve mucho mas rapido y moderno.

  Nota tecnica para el equipo: como usamos direcciones "reales" (por
  ejemplo /espacios, no #espacios), el servidor donde suban la pagina
  (Vercel, etc.) tiene que estar configurado para que, si alguien entra
  directamente escribiendo una de esas direcciones, igual le muestre la
  pagina principal. Esto se explica en el archivo GUIDE.md.
*/

// Aqui guardamos la lista de "direcciones" que existen en la pagina,
// y que funcion se encarga de dibujar cada una
const routes = {};

// Se usa para avisarle al router: "esta direccion existe, y cuando alguien
// la visite, usa esta funcion para dibujar lo que se debe ver"
function registerRoute(path, renderFunction) {
  routes[path] = renderFunction;
}

// Busca cual de las direcciones registradas coincide con la que el usuario
// esta visitando ahora mismo. Tambien entiende direcciones con partes que
// cambian, como "/espacio/123" (donde el 123 puede ser cualquier numero)
function matchRoute(pathname) {
  for (const routePath in routes) {
    const paramNames = [];
    const regexPattern = routePath.replace(/:[^/]+/g, (match) => {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = pathname.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { renderFunction: routes[routePath], params };
    }
  }
  return null;
}

// Dibuja en pantalla la vista que corresponde a la direccion actual del navegador
async function renderCurrentRoute() {
  // Si alguien abre la pagina como ".../index.html" en vez de solo "/"
  // (pasa seguido con Live Server), lo tratamos exactamente igual que "/"
  let pathname = window.location.pathname;
  if (pathname.endsWith('/index.html')) {
    pathname = pathname.replace('/index.html', '/');
  }

  const matched = matchRoute(pathname);

  const appContainer = document.getElementById('app-view');

  if (!matched) {
    appContainer.innerHTML = '<div class="empty-state"><h2>Página no encontrada</h2></div>';
    return;
  }

  appContainer.innerHTML = '';
  await matched.renderFunction(appContainer, matched.params, getQueryParams());

  // Cada vez que cambiamos de pantalla, hay que volver a aplicar las
  // traducciones, porque el contenido nuevo puede traer textos sin traducir todavia
  applyTranslations();

  window.scrollTo(0, 0);
  updateNavbarState();
}

// Cambia de pantalla SIN recargar la pagina. Esto es lo que se usa
// en todo el codigo cada vez que queremos "ir a otra vista"
function navigateTo(path) {
  window.history.pushState({}, '', path);
  renderCurrentRoute();
}

// "Escucha" los clics en toda la pagina. Si el clic fue en un link marcado
// como interno (data-link), evita que el navegador recargue todo, y en
// cambio navega dentro de la SPA
function setupLinkInterception() {
  document.body.addEventListener('click', (event) => {
    const link = event.target.closest('[data-link]');
    if (link) {
      event.preventDefault();
      navigateTo(link.getAttribute('href'));
    }
  });
}

// Se ejecuta una sola vez, al abrir la pagina por primera vez.
// Prepara todo lo necesario para que el router empiece a funcionar
function initRouter() {
  setupLinkInterception();

  // Esto detecta cuando el usuario usa el boton "atras" o "adelante" del navegador
  window.addEventListener('popstate', renderCurrentRoute);

  renderCurrentRoute();
}

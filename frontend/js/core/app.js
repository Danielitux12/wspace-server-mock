/*
  ARCHIVO: app.js

  ¿Qué hace este archivo?
  Es el punto de partida de toda la pagina. Cuando alguien abre WSPACE,
  este es el primer codigo que se ejecuta, y se encarga de tres cosas:
  1. Avisarle al router cuales direcciones existen y que pantalla mostrar en cada una
  2. Prender el idioma, la barra de navegacion y el router
  3. Mostrar la ventana emergente de bienvenida (si corresponde)
*/

// Aqui registramos TODAS las direcciones (rutas) que tiene la aplicacion,
// y que pantalla (vista) se debe mostrar en cada una
function registerAllRoutes() {
  registerRoute('/', renderHomeView);
  registerRoute('/espacios', renderSpacesListView);
  registerRoute('/espacio/:id', renderSpaceDetailView);
  registerRoute('/mis-reservas', renderMyBookingsView);
  registerRoute('/favoritos', renderFavoritesView);
  registerRoute('/perfil', renderProfileView);
  registerRoute('/notificaciones', renderNotificationsView);
  registerRoute('/dashboard', renderDashboardView);
  registerRoute('/mis-espacios', renderMySpacesView);
  registerRoute('/mis-espacios/nuevo', renderPublishSpaceView);
  registerRoute('/mis-espacios/:id/disponibilidad', renderSpaceAvailabilityView);
  registerRoute('/mis-espacios/reservas', renderHostBookingsView);
  registerRoute('/mis-espacios/resenas', renderHostReviewsView);
  registerRoute('/terminos', renderLegalTermsView);
  registerRoute('/politica-datos', renderLegalPrivacyView);

  // Esta direccion se usa cuando alguien sin cuenta hace clic en "publica tu espacio"
  // desde el Home: le abre directamente la ventana de registro
  registerRoute('/registro-host', (container) => {
    openLoginModal('register');
    renderHomeView(container);
  });
}

// Esta es la funcion principal que arranca todo, en el orden correcto
async function startApp() {
  await initI18n();          // primero cargamos el idioma
  registerAllRoutes();       // luego avisamos que direcciones existen
  renderNavbar();            // dibujamos la barra de navegacion de arriba
  renderFooter();            // dibujamos el pie de pagina
  initRouter();              // prendemos el router (esto dibuja la pantalla inicial)
  maybeShowWelcomeModal();   // si corresponde, mostramos el pop-up de bienvenida
}

// Esta linea le dice al navegador: "cuando termines de cargar toda la
// pagina, ejecuta la funcion startApp"
document.addEventListener('DOMContentLoaded', startApp);

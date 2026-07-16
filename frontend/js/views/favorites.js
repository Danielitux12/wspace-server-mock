/*
  ARCHIVO: favorites.js

  ¿Qué hace este archivo?
  Dibuja la pantalla de espacios favoritos. Todavia falta: el boton de
  "corazon" para marcar un espacio como favorito desde la tarjeta, y el
  endpoint del backend que guarde y devuelva esa lista.
*/

async function renderFavoritesView(container) {
  requireAuth(() => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title" data-i18n="nav.favorites">Favoritos</h1>
        <div class="empty-state">
          <p>Todavía no has guardado espacios favoritos</p>
          <p class="notice-box mt-md">
            NOTA para el equipo: falta el boton de corazon en space-card y el endpoint
            POST/DELETE /api/favorites. Ver GUIDE.md seccion de pendientes.
          </p>
        </div>
      </div>
    `;
  });
}

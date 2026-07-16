/*
  ARCHIVO: hostReviews.js

  ¿Qué hace este archivo?
  Deberia mostrar las calificaciones y comentarios que han dejado los
  WSpacers sobre los espacios del anfitrion. Todavia no esta construido.
*/

async function renderHostReviewsView(container) {
  requireHostRole(() => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title">Reseñas recibidas</h1>
        <div class="empty-state">
          <p>Todavía no tienes reseñas</p>
        </div>
      </div>
    `;
  });
}

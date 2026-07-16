/*
  ARCHIVO: notifications.js

  ¿Qué hace este archivo?
  Dibuja la pantalla de notificaciones (avisos de reservas aprobadas,
  rechazadas, etc.). Por ahora esta pantalla esta vacia: falta construir
  el endpoint del backend que entregue las notificaciones reales de cada usuario.
*/

async function renderNotificationsView(container) {
  requireAuth(() => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title" data-i18n="nav.notifications">Notificaciones</h1>
        <div class="empty-state">
          <p>No tienes notificaciones nuevas</p>
          <p class="notice-box mt-md">
            NOTA para el equipo: esta vista esta lista para conectarse a GET /api/notifications
            cuando el backend real lo implemente. Ver GUIDE.md seccion de pendientes.
          </p>
        </div>
      </div>
    `;
  });
}

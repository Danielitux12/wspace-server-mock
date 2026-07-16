/*
  ARCHIVO: dashboard.js

  ¿Qué hace este archivo?
  Dibuja el panel principal que ve un WSpacer+ apenas entra a "modo
  anfitrion": un resumen rapido de cuantos espacios tiene, cuantas
  solicitudes de reserva estan pendientes, y cuanto ha ganado.
*/

async function renderDashboardView(container) {
  // Solo un WSpacer+ puede ver esta pantalla
  requireHostRole(async () => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title" data-i18n="nav.dashboard">Dashboard</h1>
        <div id="dashboard-metrics" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px;"></div>
        <div class="mt-lg">
          <a href="/mis-espacios/nuevo" data-link class="btn btn-primary">+ Publicar nuevo espacio</a>
        </div>
      </div>
    `;

    try {
      const [spaces, bookings] = await Promise.all([fetchMySpaces(), fetchHostBookings()]);
      const pendingCount = bookings.filter((b) => b.status === 'pendiente').length;
      const monthIncome = bookings
        .filter((b) => b.status === 'completada')
        .reduce((sum, b) => sum + (b.hostNet || 0), 0);

      document.getElementById('dashboard-metrics').innerHTML = `
        <div class="price-breakdown"><strong>${spaces.length}</strong><p>Espacios publicados</p></div>
        <div class="price-breakdown"><strong>${pendingCount}</strong><p>Reservas pendientes</p></div>
        <div class="price-breakdown"><strong>${formatPrice(monthIncome)}</strong><p>Ingresos (histórico simulado)</p></div>
      `;
    } catch (error) {
      showToast(error.message);
    }
  });
}

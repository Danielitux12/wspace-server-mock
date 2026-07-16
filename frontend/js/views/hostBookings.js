/*
  ARCHIVO: hostBookings.js

  ¿Qué hace este archivo?
  Dibuja la lista de solicitudes de reserva que ha recibido el WSpacer+
  en sus espacios, con botones para Aprobar o Rechazar cada una.
*/

async function renderHostBookingsView(container) {
  requireHostRole(async () => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title" data-i18n="nav.hostBookings">Reservas recibidas</h1>
        <div id="host-bookings-list"></div>
      </div>
    `;

    const list = document.getElementById('host-bookings-list');
    try {
      const bookings = await fetchHostBookings();

      if (bookings.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No tienes solicitudes por ahora</p></div>';
        return;
      }

      list.innerHTML = bookings.map((booking) => `
        <div class="price-breakdown mb-md">
          <div class="price-breakdown-row">
            <strong>${booking.spaceName}</strong>
            <span class="badge">${booking.status}</span>
          </div>
          <div class="price-breakdown-row">
            <span>${booking.guestName} · ${booking.date} · ${booking.startTime}-${booking.endTime}</span>
          </div>
          ${booking.status === 'pendiente' ? `
            <div class="mt-md" style="display:flex; gap:8px;">
              <button class="btn btn-primary" data-approve="${booking.id}">Aprobar</button>
              <button class="btn btn-outline" data-reject="${booking.id}">Rechazar</button>
            </div>
          ` : ''}
        </div>
      `).join('');

      // Boton "Aprobar": cambia el estado de la reserva a "confirmada"
      document.querySelectorAll('[data-approve]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await respondBooking(btn.dataset.approve, 'confirmada');
          showToast('Reserva aprobada');
          renderCurrentRoute();
        });
      });

      // Boton "Rechazar": cambia el estado de la reserva a "rechazada"
      document.querySelectorAll('[data-reject]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await respondBooking(btn.dataset.reject, 'rechazada');
          showToast('Reserva rechazada');
          renderCurrentRoute();
        });
      });
    } catch (error) {
      list.innerHTML = `<div class="empty-state"><p>${error.message}</p></div>`;
    }
  });
}

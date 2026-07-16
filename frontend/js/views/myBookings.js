/*
  ARCHIVO: myBookings.js

  ¿Qué hace este archivo?
  Dibuja la pantalla "Mis reservas", donde un WSpacer ve todas las
  reservas que ha hecho, con su estado (pendiente, confirmada, etc.),
  y puede pagar o cancelar segun corresponda.
*/

async function renderMyBookingsView(container) {
  // Si nadie ha iniciado sesion, primero pedimos que inicie sesion
  requireAuth(async () => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title" data-i18n="nav.myBookings">Mis reservas</h1>
        <div id="bookings-list"></div>
      </div>
    `;

    const list = document.getElementById('bookings-list');
    try {
      const bookings = await fetchMyBookings();

      if (bookings.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>Todavía no tienes reservas</p></div>';
        return;
      }

      list.innerHTML = bookings.map(renderBookingRow).join('');
      attachBookingActions();
    } catch (error) {
      list.innerHTML = `<div class="empty-state"><p>${error.message}</p></div>`;
    }
  });
}

// Dibuja una fila con los datos de una reserva: espacio, fecha, precio,
// y los botones que correspondan segun su estado actual
function renderBookingRow(booking) {
  const statusLabels = {
    pendiente: t('booking.pending'),
    confirmada: t('booking.confirmed'),
    rechazada: t('booking.rejected'),
    cancelada: t('booking.cancelled'),
    completada: t('booking.completed')
  };

  return `
    <div class="price-breakdown mb-md">
      <div class="price-breakdown-row">
        <strong>${booking.spaceName}</strong>
        <span class="badge">${statusLabels[booking.status] || booking.status}</span>
      </div>
      <div class="price-breakdown-row">
        <span>${booking.date} · ${booking.startTime} - ${booking.endTime}</span>
        <span>${formatPrice(booking.total)}</span>
      </div>
      ${booking.status === 'confirmada' ? `<button class="btn btn-outline mt-md" data-cancel="${booking.id}">Cancelar reserva</button>` : ''}
      ${booking.status === 'pendiente' ? `<button class="btn btn-primary mt-md" data-pay="${booking.id}" data-i18n="booking.payCta">Confirmar y pagar</button>` : ''}
    </div>
  `;
}

// Conecta los botones "Cancelar" y "Confirmar y pagar" de cada reserva con su accion
function attachBookingActions() {
  document.querySelectorAll('[data-cancel]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await cancelBooking(btn.dataset.cancel);
      showToast('Reserva cancelada');
      renderCurrentRoute(); // volvemos a dibujar la pantalla para que se vea el cambio
    });
  });

  document.querySelectorAll('[data-pay]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const result = await simulatePayment(btn.dataset.pay);
        showToast(`Pago aprobado. Referencia: ${result.reference}`);
        renderCurrentRoute();
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

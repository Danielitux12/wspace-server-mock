/*
  ARCHIVO: spaceDetail.js

  ¿Qué hace este archivo?
  Dibuja la pantalla de detalle de UN espacio en especifico: sus fotos,
  descripcion, amenidades, y el panel donde la persona elige fecha y
  hora para reservar, viendo el precio calculado en vivo mientras elige.
*/

async function renderSpaceDetailView(container, params) {
  container.innerHTML = '<div class="container"><p>Cargando...</p></div>';

  // Le pedimos al servidor los datos de este espacio en especifico (usando su id)
  let space;
  try {
    space = await fetchSpaceById(params.id);
  } catch (error) {
    container.innerHTML = `<div class="container empty-state"><p>${error.message}</p></div>`;
    return;
  }

  const categoryLabel = CATEGORY_LABELS[space.type] ? CATEGORY_LABELS[space.type][getCurrentLang()] : space.type;
  const amenityKeys = space.amenities || [];

  container.innerHTML = `
    <div class="container section">
      <img src="${space.photos[0] || 'https://via.placeholder.com/900x400?text=WSPACE'}"
           style="width:100%; height:280px; object-fit:cover; border-radius:16px;" alt="${space.name}">

      <div class="mt-lg" style="display:grid; grid-template-columns: 1fr; gap:24px;">
        <div>
          <h1>${space.name}</h1>
          <p class="mt-md">${categoryLabel} · ${space.neighborhood}, ${space.city} · Capacidad ${space.capacity}</p>
          <p class="mt-md">${space.description || ''}</p>

          <h3 class="mt-lg mb-md">Amenidades</h3>
          <div id="amenities-preview" style="display:grid; grid-template-columns: repeat(2,1fr); gap:8px;"></div>
          <button class="btn btn-outline mt-md" id="toggle-amenities-btn" data-i18n="spaces.viewAllAmenities">Ver todas las amenidades</button>
        </div>

        <div class="price-breakdown" id="booking-panel"></div>
      </div>
    </div>
  `;

  renderAmenities(amenityKeys);
  renderBookingPanel(space);
}

// Dibuja la lista de amenidades (wifi, bateria, cafe, etc.) con su icono.
// Al principio solo se ven las primeras 6, y con el boton "ver todas" se
// despliegan las demas, para no saturar la pantalla con una lista larga
function renderAmenities(amenityKeys) {
  const preview = document.getElementById('amenities-preview');
  let expanded = false;

  function draw() {
    const visibleKeys = expanded ? amenityKeys : amenityKeys.slice(0, 6);
    preview.innerHTML = visibleKeys.map((key) => {
      const label = AMENITY_LABELS[key];
      if (!label) return '';
      return `<div>✓ ${label.icon} ${label[getCurrentLang()]}</div>`;
    }).join('');
  }

  draw();

  const toggleBtn = document.getElementById('toggle-amenities-btn');
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    draw();
  });
}

// Dibuja el panel donde la persona elige fecha/hora y solicita la reserva,
// mostrando el precio (con comision e impuesto) calculado en vivo
function renderBookingPanel(space) {
  const panel = document.getElementById('booking-panel');

  panel.innerHTML = `
    <h3 class="mb-md">${formatPrice(space.pricePerHour)} <span data-i18n="spaces.perHour">/ hora</span></h3>
    <div class="form-group">
      <label data-i18n="home.date">Fecha</label>
      <input type="date" id="booking-date">
    </div>
    <div class="form-group">
      <label data-i18n="home.startTime">Hora inicio</label>
      <input type="time" id="booking-startTime">
    </div>
    <div class="form-group">
      <label data-i18n="home.endTime">Hora fin</label>
      <input type="time" id="booking-endTime">
    </div>
    <div id="booking-price-preview"></div>
    <div class="form-error hidden" id="booking-error"></div>
    <button class="btn btn-primary btn-block mt-md" id="request-booking-btn" data-i18n="booking.requestCta">Solicitar reserva</button>
  `;
  applyTranslations();

  const startInput = document.getElementById('booking-startTime');
  const endInput = document.getElementById('booking-endTime');

  // Cada vez que la persona cambia la hora de inicio o fin, recalculamos
  // el precio total al instante, para que vea cuanto va a pagar antes de confirmar
  function updatePricePreview() {
    const hours = calculateHours(startInput.value || '00:00', endInput.value || '00:00');
    const preview = document.getElementById('booking-price-preview');

    if (hours <= 0) {
      preview.innerHTML = '';
      return;
    }

    const breakdown = calculateBookingPrice(space.pricePerHour, hours);
    preview.innerHTML = `
      <div class="notice-box">
        <div class="price-breakdown-row"><span data-i18n="booking.basePrice">Precio del espacio</span><span>${formatPrice(breakdown.basePrice)}</span></div>
        <div class="price-breakdown-row"><span data-i18n="booking.serviceFee">Comisión de servicio WSPACE</span><span>${formatPrice(breakdown.serviceFee)}</span></div>
        <div class="price-breakdown-row"><span data-i18n="booking.iva">IVA sobre la comisión (19%)</span><span>${formatPrice(breakdown.taxOnFee)}</span></div>
        <div class="price-breakdown-row total"><span data-i18n="booking.total">Total a pagar</span><span>${formatPrice(breakdown.total)}</span></div>
      </div>
    `;
    applyTranslations();
  }

  startInput.addEventListener('input', updatePricePreview);
  endInput.addEventListener('input', updatePricePreview);

  // Que pasa cuando la persona hace clic en "Solicitar reserva"
  document.getElementById('request-booking-btn').addEventListener('click', () => {
    // Si no ha iniciado sesion, primero le pedimos que inicie sesion o se registre
    requireAuth(async () => {
      const date = document.getElementById('booking-date').value;
      const startTime = startInput.value;
      const endTime = endInput.value;
      const errorBox = document.getElementById('booking-error');

      if (!date || !startTime || !endTime || calculateHours(startTime, endTime) <= 0) {
        errorBox.textContent = 'Revisa la fecha y el horario seleccionado';
        errorBox.classList.remove('hidden');
        return;
      }

      try {
        const booking = await createBooking({
          spaceId: space.id,
          date,
          startTime,
          endTime
        });
        showToast('Solicitud enviada. El anfitrión debe confirmarla.');
        navigateTo(`/mis-reservas`);
      } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove('hidden');
      }
    });
  });
}

// Calcula cuanto va a pagar el WSpacer: precio base + comision del 12% +
// el 19% de impuesto sobre esa comision (NO sobre el precio completo,
// solo sobre la comision que le corresponde a WSPACE)
function calculateBookingPrice(pricePerHour, hours) {
  const basePrice = pricePerHour * hours;
  const serviceFee = basePrice * 0.12;
  const taxOnFee = serviceFee * 0.19;
  const total = basePrice + serviceFee + taxOnFee;
  return { basePrice, serviceFee, taxOnFee, total };
}

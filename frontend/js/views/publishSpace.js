/*
  ARCHIVO: publishSpace.js

  ¿Qué hace este archivo?
  Dibuja el formulario para publicar un espacio nuevo. Tiene una
  "calculadora" que se actualiza sola mientras el WSpacer+ escribe el
  precio por hora, mostrandole cuanto pagara quien reserve (con comision
  e impuesto incluidos) y cuanto va a recibir el mismo de forma neta.
*/

async function renderPublishSpaceView(container) {
  requireAuth(() => {
    const categoryOptions = Object.entries(CATEGORY_LABELS)
      .map(([key, labels]) => `<option value="${key}">${labels[getCurrentLang()]}</option>`)
      .join('');

    container.innerHTML = `
      <div class="container section" style="max-width:600px;">
        <h1 class="section-title" data-i18n="publish.title">Publicar espacio</h1>
        <form id="publish-form">
          <div class="form-group">
            <label data-i18n="publish.name">Nombre del espacio</label>
            <input type="text" id="pub-name" required>
          </div>
          <div class="form-group">
            <label data-i18n="publish.type">Tipo de espacio</label>
            <select id="pub-type" required>${categoryOptions}</select>
          </div>
          <div class="form-group">
            <label>Ciudad</label>
            <input type="text" id="pub-city" required>
          </div>
          <div class="form-group">
            <label>Barrio</label>
            <input type="text" id="pub-neighborhood" required>
          </div>
          <div class="form-group">
            <label>Capacidad</label>
            <input type="number" id="pub-capacity" min="1" required>
          </div>
          <div class="form-group">
            <label data-i18n="publish.pricePerHour">Precio por hora</label>
            <input type="number" id="pub-price" min="1000" required>
          </div>

          <div id="price-calculator" class="notice-box hidden"></div>

          <div class="form-group mt-md">
            <label>Fotos del espacio</label>
            <input type="file" id="pub-photos" accept="image/*" multiple>
            <div id="photos-preview" class="mt-md" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
          </div>

          <div class="form-group">
            <label>Amenidades</label>
            <div id="amenities-checkboxes"></div>
          </div>

          <button type="submit" class="btn btn-primary btn-block mt-md">Publicar espacio</button>
        </form>
      </div>
    `;

    // Aqui guardamos los links de las fotos a medida que se van subiendo a Cloudinary
    const uploadedPhotoUrls = [];

    // Cada vez que cambia el precio, actualizamos la calculadora que se ve debajo
    document.getElementById('pub-price').addEventListener('input', updatePriceCalculator);

    // Cada vez que cambia el tipo de espacio, cambiamos que amenidades se pueden elegir
    // (por ejemplo, "sala de ensayo" muestra bateria y microfono, no punto de cafe)
    document.getElementById('pub-type').addEventListener('change', updateAmenitiesCheckboxes);
    updateAmenitiesCheckboxes();

    // Conectamos el campo de "elegir fotos" con la subida automatica a Cloudinary
    attachFileUploader(document.getElementById('pub-photos'), (url) => {
      uploadedPhotoUrls.push(url);
      const preview = document.getElementById('photos-preview');
      preview.innerHTML += `<img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">`;
    });

    // Que pasa al hacer clic en "Publicar espacio"
    document.getElementById('publish-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectedAmenities = Array.from(document.querySelectorAll('#amenities-checkboxes input:checked'))
        .map((input) => input.value);

      try {
        await createSpace({
          name: document.getElementById('pub-name').value,
          type: document.getElementById('pub-type').value,
          city: document.getElementById('pub-city').value,
          neighborhood: document.getElementById('pub-neighborhood').value,
          capacity: Number(document.getElementById('pub-capacity').value),
          pricePerHour: Number(document.getElementById('pub-price').value),
          photos: uploadedPhotoUrls,
          amenities: selectedAmenities
        });
        showToast('Espacio publicado con éxito');
        navigateTo('/mis-espacios');
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

// Calcula y muestra en vivo, mientras el usuario escribe el precio:
// - Cuanto pagaria quien reserve (precio + comision del 12% + impuesto)
// - Cuanto recibiria el anfitrion, ya con su comision del 6% descontada
function updatePriceCalculator() {
  const basePrice = Number(document.getElementById('pub-price').value) || 0;
  const box = document.getElementById('price-calculator');

  if (basePrice <= 0) {
    box.classList.add('hidden');
    return;
  }

  // Lo que le cobrariamos al WSpacer que reserve (comision del 12% + su impuesto)
  const guestFee = basePrice * 0.12;
  const guestFeeTax = guestFee * 0.19;
  const guestTotal = basePrice + guestFee + guestFeeTax;

  // Lo que se le descuenta al anfitrion (comision del 6% + su impuesto)
  const hostFee = basePrice * 0.06;
  const hostFeeTax = hostFee * 0.19;
  const netForHost = basePrice - hostFee - hostFeeTax;

  box.classList.remove('hidden');
  box.innerHTML = `
    <strong data-i18n="publish.calcTitle">Así lo verá quien reserve</strong>
    <div class="price-breakdown-row mt-md"><span data-i18n="booking.basePrice">Precio del espacio</span><span>${formatPrice(basePrice)}</span></div>
    <div class="price-breakdown-row"><span data-i18n="booking.serviceFee">Comisión de servicio WSPACE</span><span>${formatPrice(guestFee)}</span></div>
    <div class="price-breakdown-row"><span data-i18n="booking.iva">IVA sobre la comisión (19%)</span><span>${formatPrice(guestFeeTax)}</span></div>
    <div class="price-breakdown-row total"><span data-i18n="booking.total">Total a pagar</span><span>${formatPrice(guestTotal)}</span></div>
    <div class="price-breakdown-row mt-md"><span data-i18n="publish.calcYouReceive">Tú recibirás (neto)</span><strong>${formatPrice(netForHost)}</strong></div>
    <p class="mt-md" data-i18n="publish.taxNotice">${t('publish.taxNotice')}</p>
  `;
  applyTranslations();
}

// Cambia la lista de amenidades disponibles para marcar, segun el tipo
// de espacio que se haya elegido en el formulario
function updateAmenitiesCheckboxes() {
  const type = document.getElementById('pub-type').value;
  const relevantKeys = AMENITIES_BY_CATEGORY[type] || [];
  const container = document.getElementById('amenities-checkboxes');

  container.innerHTML = relevantKeys.map((key) => {
    const label = AMENITY_LABELS[key];
    return `
      <label style="display:flex; align-items:center; gap:8px; font-weight:400; margin-bottom:6px;">
        <input type="checkbox" value="${key}" style="width:auto;">
        ${label.icon} ${label[getCurrentLang()]}
      </label>
    `;
  }).join('');
}

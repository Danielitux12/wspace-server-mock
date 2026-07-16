/*
  ARCHIVO: spacesList.js

  ¿Qué hace este archivo?
  Dibuja la pantalla de resultados de busqueda: la lista de espacios que
  coinciden con lo que la persona busco. Los filtros (ciudad, tipo, fecha,
  hora) se leen directamente de la direccion web (URL), para que la
  busqueda se pueda compartir o guardar como link.
*/

async function renderSpacesListView(container, params, query) {
  container.innerHTML = `
    <div class="container">
      <div class="section">
        ${renderSearchBar()}
      </div>
      <div id="spaces-results" class="spaces-grid"></div>
    </div>
  `;

  attachSearchBarEvents();
  prefillSearchBar(query); // dejamos la barra de busqueda con lo que ya se habia buscado

  const resultsContainer = document.getElementById('spaces-results');
  resultsContainer.innerHTML = '<p>Cargando...</p>';

  try {
    const spaces = await fetchSpaces(query);

    if (spaces.length === 0) {
      resultsContainer.innerHTML = `<div class="empty-state"><p data-i18n="spaces.noResults">${t('spaces.noResults')}</p></div>`;
      return;
    }

    resultsContainer.innerHTML = spaces.map(renderSpaceCard).join('');
  } catch (error) {
    resultsContainer.innerHTML = `<div class="empty-state"><p>${error.message}</p></div>`;
  }
}

// Rellena los campos de la barra de busqueda con los filtros que venian
// en la direccion web, para que la persona vea que fue lo que busco
function prefillSearchBar(query) {
  if (query.city) document.getElementById('search-city').value = query.city;
  if (query.type) document.getElementById('search-type').value = query.type;
  if (query.date) document.getElementById('search-date').value = query.date;
  if (query.startTime) document.getElementById('search-startTime').value = query.startTime;
}

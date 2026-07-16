/*
  ARCHIVO: spaceCard.js

  ¿Qué hace este archivo?
  Dibuja la "tarjetita" que representa un espacio (con su foto, nombre,
  ubicacion y precio). Esta misma tarjeta se reutiliza en varios lugares:
  en los resultados de busqueda, en "destacados", en "mas reservados", etc.
  Asi evitamos repetir el mismo codigo cinco veces.
*/

function renderSpaceCard(space) {
  const photo = space.photos && space.photos[0] ? space.photos[0] : 'https://via.placeholder.com/400x260?text=WSPACE';
  const categoryLabel = CATEGORY_LABELS[space.type] ? CATEGORY_LABELS[space.type][getCurrentLang()] : space.type;

  return `
    <a href="/espacio/${space.id}" data-link class="space-card">
      <img src="${photo}" alt="${space.name}">
      <div class="space-card-body">
        ${space.featured ? '<span class="badge">Destacado</span>' : ''}
        <div class="space-card-title">${space.name}</div>
        <div class="space-card-location">${categoryLabel} · ${space.neighborhood}, ${space.city}</div>
        <div class="space-card-price">${formatPrice(space.pricePerHour)} <span data-i18n="spaces.perHour">/ hora</span></div>
      </div>
    </a>
  `;
}

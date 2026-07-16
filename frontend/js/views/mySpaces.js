/*
  ARCHIVO: mySpaces.js

  ¿Qué hace este archivo?
  Dibuja la lista de todos los espacios que ha publicado el WSpacer+
  actual, con un boton para publicar uno nuevo.
*/

async function renderMySpacesView(container) {
  requireHostRole(async () => {
    container.innerHTML = `
      <div class="container section">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h1 class="section-title" data-i18n="nav.mySpaces">Mis espacios</h1>
          <a href="/mis-espacios/nuevo" data-link class="btn btn-primary">+ Publicar</a>
        </div>
        <div id="my-spaces-list" class="spaces-grid mt-md"></div>
      </div>
    `;

    try {
      const spaces = await fetchMySpaces();
      const list = document.getElementById('my-spaces-list');
      list.innerHTML = spaces.length
        ? spaces.map(renderSpaceCard).join('')
        : '<div class="empty-state"><p>Todavía no has publicado ningún espacio</p></div>';
    } catch (error) {
      showToast(error.message);
    }
  });
}

/*
  ARCHIVO: profile.js

  ¿Qué hace este archivo?
  Dibuja la pantalla "Mi perfil" donde el usuario puede ver y editar sus
  datos personales (nombre, apellido, telefono).

  PENDIENTE: por ahora, al guardar cambios solo se muestra un mensaje de
  exito, pero no se guarda de verdad en ningun lado. Falta crear en el
  backend un endpoint tipo PATCH /users/me para guardar los cambios reales.
*/

async function renderProfileView(container) {
  requireAuth(() => {
    const user = getCurrentUser();
    container.innerHTML = `
      <div class="container section" style="max-width:480px;">
        <h1 class="section-title" data-i18n="nav.profile">Mi perfil</h1>
        <form id="profile-form">
          <div class="form-group">
            <label data-i18n="auth.firstName">Nombre</label>
            <input type="text" id="profile-firstName" value="${user.firstName}">
          </div>
          <div class="form-group">
            <label data-i18n="auth.lastName">Apellido</label>
            <input type="text" id="profile-lastName" value="${user.lastName}">
          </div>
          <div class="form-group">
            <label data-i18n="auth.email">Correo electrónico</label>
            <input type="email" id="profile-email" value="${user.email}" disabled>
          </div>
          <div class="form-group">
            <label data-i18n="auth.phone">Teléfono</label>
            <input type="tel" id="profile-phone" value="${user.phone || ''}">
          </div>
          <button type="submit" class="btn btn-primary">Guardar cambios</button>
        </form>
      </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      // Todavia no hay un lugar real donde guardar esto (ver nota arriba)
      showToast('Perfil actualizado (simulado, falta conectar backend real)');
    });
  });
}

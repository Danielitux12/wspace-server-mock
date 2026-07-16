/*
  ARCHIVO: footer.js

  ¿Qué hace este archivo?
  Dibuja el pie de pagina (la franja de abajo del todo) que aparece en
  cualquier pantalla, con los links a los documentos legales.
*/

function renderFooter() {
  const footerContainer = document.getElementById('footer');
  footerContainer.innerHTML = `
    <div class="footer">
      <p>© 2026 WSPACE — Proyecto Integrador Riwi</p>
      <div class="mt-md">
        <a href="/terminos" data-link data-i18n="footer.terms">Términos y condiciones</a>
        <a href="/politica-datos" data-link data-i18n="footer.privacy">Política de datos</a>
      </div>
    </div>
  `;
}

/*
  ARCHIVO: welcomeModal.js

  ¿Qué hace este archivo?
  Muestra la ventana emergente que le da la bienvenida a quien visita la
  pagina por primera vez, ofreciendole un descuento en su primera reserva.

  Reglas para que NO sea molesta:
  - Solo aparece una vez por visita (si cierras y vuelves a entrar en la
    misma sesion, no vuelve a salir)
  - Nunca aparece si el usuario ya uso su reserva gratis anteriormente
*/

const WELCOME_SHOWN_KEY = 'wspace_welcome_shown';

// Revisa si corresponde mostrar el pop-up, y si es asi, lo muestra
// despues de un segundo y medio (para que no se sienta invasivo apenas entra)
function maybeShowWelcomeModal() {
  const alreadyShown = sessionStorage.getItem(WELCOME_SHOWN_KEY);
  const user = getCurrentUser();
  const alreadyUsedFreeBooking = user && user.freeBookingsUsed > 0;

  if (alreadyShown || alreadyUsedFreeBooking) return;

  setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'welcome-modal';
    overlay.innerHTML = `
      <div class="modal-box text-center">
        <button class="modal-close" id="welcome-close-btn">✕</button>
        <h2 data-i18n="welcome.title">¡Bienvenido a WSPACE!</h2>
        <p class="mt-md" data-i18n="welcome.text">Reserva hoy y obtén tu primera hora gratis.</p>
        <button class="btn btn-secondary btn-block mt-lg" id="welcome-cta-btn" data-i18n="welcome.cta">Reservar ahora</button>
      </div>
    `;
    document.body.appendChild(overlay);
    applyTranslations();

    document.getElementById('welcome-close-btn').addEventListener('click', closeWelcomeModal);
    document.getElementById('welcome-cta-btn').addEventListener('click', () => {
      closeWelcomeModal();
      navigateTo('/espacios');
    });

    // Guardamos que ya se mostro, para no volver a molestar en esta misma visita
    sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
  }, 1500);
}

// Cierra (quita de la pantalla) la ventana de bienvenida
function closeWelcomeModal() {
  const modal = document.getElementById('welcome-modal');
  if (modal) modal.remove();
}

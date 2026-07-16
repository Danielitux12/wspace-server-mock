/*
  ARCHIVO: loginModal.js

  ¿Qué hace este archivo?
  Dibuja la ventana emergente (modal) para iniciar sesion o crear una
  cuenta nueva. Es una ventana flotante, no una pantalla completa nueva,
  para que la persona no pierda de vista donde estaba antes de abrirla
  (por ejemplo, si estaba viendo resultados de busqueda, al cerrar la
  ventana sigue viendo esos mismos resultados).
*/

// Abre la ventana de login/registro. "initialTab" decide si abre mostrando
// primero el formulario de inicio de sesion o el de crear cuenta
function openLoginModal(initialTab = 'login') {
  closeLoginModal(); // por si ya habia una ventana abierta de antes, la cerramos primero

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'login-modal';
  overlay.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" id="login-close-btn">✕</button>
      <div class="tabs">
        <div class="tab" id="tab-login" data-i18n="auth.loginCta">Iniciar sesión</div>
        <div class="tab" id="tab-register" data-i18n="auth.registerCta">Crear cuenta</div>
      </div>
      <div id="login-form-container"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('login-close-btn').addEventListener('click', closeLoginModal);
  document.getElementById('tab-login').addEventListener('click', () => renderLoginTab());
  document.getElementById('tab-register').addEventListener('click', () => renderRegisterTab());

  initialTab === 'login' ? renderLoginTab() : renderRegisterTab();
}

// Cierra (quita de la pantalla) la ventana de login/registro
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.remove();
}

// Dibuja el formulario de "Iniciar sesion" (correo + contrasena)
function renderLoginTab() {
  document.getElementById('tab-login').classList.add('active');
  document.getElementById('tab-register').classList.remove('active');

  const container = document.getElementById('login-form-container');
  container.innerHTML = `
    <form id="login-form">
      <div class="form-group">
        <label data-i18n="auth.email">Correo electrónico</label>
        <input type="email" id="login-email" required>
      </div>
      <div class="form-group">
        <label data-i18n="auth.password">Contraseña</label>
        <input type="password" id="login-password" required>
      </div>
      <div class="form-error hidden" id="login-error"></div>
      <button type="submit" class="btn btn-primary btn-block" data-i18n="auth.loginCta">Iniciar sesión</button>
    </form>
  `;
  applyTranslations();

  // Que pasa cuando la persona hace clic en "Iniciar sesion"
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // evita que el formulario recargue la pagina, como hacen los formularios antiguos
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorBox = document.getElementById('login-error');

    try {
      await loginUser(email, password);
      closeLoginModal();
      renderNavbar();
      showToast('¡Bienvenido de nuevo!');
      renderCurrentRoute();
    } catch (error) {
      // Si el correo o la contrasena estan mal, mostramos el mensaje de error aqui
      errorBox.textContent = error.message;
      errorBox.classList.remove('hidden');
    }
  });
}

// Dibuja el formulario de "Crear cuenta" (nombre, correo, telefono, contrasena, etc.)
function renderRegisterTab() {
  document.getElementById('tab-register').classList.add('active');
  document.getElementById('tab-login').classList.remove('active');

  const container = document.getElementById('login-form-container');
  container.innerHTML = `
    <form id="register-form">
      <div class="form-group" data-field="firstName">
        <label data-i18n="auth.firstName">Nombre</label>
        <input type="text" id="reg-firstName">
        <div class="form-error hidden"></div>
      </div>
      <div class="form-group" data-field="lastName">
        <label data-i18n="auth.lastName">Apellido</label>
        <input type="text" id="reg-lastName">
        <div class="form-error hidden"></div>
      </div>
      <div class="form-group" data-field="email">
        <label data-i18n="auth.email">Correo electrónico</label>
        <input type="email" id="reg-email">
        <div class="form-error hidden"></div>
      </div>
      <div class="form-group" data-field="phone">
        <label data-i18n="auth.phone">Teléfono</label>
        <input type="tel" id="reg-phone" placeholder="3001234567">
        <div class="form-error hidden"></div>
      </div>
      <div class="form-group" data-field="password">
        <label data-i18n="auth.password">Contraseña</label>
        <input type="password" id="reg-password">
        <div class="form-error hidden"></div>
      </div>
      <div class="form-group" data-field="confirmPassword">
        <label data-i18n="auth.confirmPassword">Confirmar contraseña</label>
        <input type="password" id="reg-confirmPassword">
        <div class="form-error hidden"></div>
      </div>
      <div class="form-group" data-field="acceptTerms">
        <label style="display:flex; align-items:center; gap:8px; font-weight:400;">
          <input type="checkbox" id="reg-acceptTerms" style="width:auto;">
          <span data-i18n="auth.acceptTerms">Acepto los Términos y Condiciones y la Política de Datos</span>
        </label>
        <div class="form-error hidden"></div>
      </div>
      <button type="submit" class="btn btn-primary btn-block" data-i18n="auth.registerCta">Crear cuenta</button>
    </form>
  `;
  applyTranslations();

  document.getElementById('register-form').addEventListener('submit', handleRegisterSubmit);
}

// Se ejecuta cuando la persona hace clic en "Crear cuenta".
// Primero revisa que todos los campos esten bien llenados (validacion),
// y solo si todo esta correcto, envia los datos al servidor
async function handleRegisterSubmit(e) {
  e.preventDefault();

  const formData = {
    firstName: document.getElementById('reg-firstName').value,
    lastName: document.getElementById('reg-lastName').value,
    email: document.getElementById('reg-email').value,
    phone: document.getElementById('reg-phone').value,
    password: document.getElementById('reg-password').value,
    confirmPassword: document.getElementById('reg-confirmPassword').value,
    acceptTerms: document.getElementById('reg-acceptTerms').checked
  };

  // Antes de revisar de nuevo, limpiamos cualquier mensaje de error que haya quedado de un intento anterior
  document.querySelectorAll('#register-form .form-group').forEach((group) => {
    group.classList.remove('has-error');
    group.querySelector('.form-error').classList.add('hidden');
  });

  const { isValid, errors } = validateRegisterForm(formData);

  // Si algun campo esta mal, mostramos el error justo debajo de ese campo y no seguimos
  if (!isValid) {
    Object.entries(errors).forEach(([field, message]) => {
      const group = document.querySelector(`[data-field="${field}"]`);
      if (group) {
        group.classList.add('has-error');
        const errorEl = group.querySelector('.form-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }
    });
    return;
  }

  // Si todo esta bien, mandamos los datos al servidor para crear la cuenta
  try {
    await registerUser(formData);
    showToast('Cuenta creada. Ahora inicia sesión');
    renderLoginTab();
  } catch (error) {
    showToast(error.message);
  }
}

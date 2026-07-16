/*
  ARCHIVO: i18n.js

  ¿Qué hace este archivo?
  Es el que permite que la página cambie de español a inglés (y viceversa)
  sin recargar la pantalla, cuando el usuario hace clic en el botón ES/EN.

  ¿Cómo funciona, en palabras simples?
  Tenemos dos "diccionarios" guardados en archivos separados: uno en español
  (es.json) y otro en inglés (en.json). Cada palabra de la página tiene un
  "código" (por ejemplo "nav.login"). Cuando el usuario cambia de idioma,
  este archivo busca el código de cada texto en el diccionario correspondiente
  y reemplaza lo que se ve en pantalla.
*/

const LANG_STORAGE_KEY = 'wspace_lang';
let currentTranslations = {};
let currentLang = 'es';

// Descarga el diccionario del idioma pedido (es.json o en.json) y lo deja listo para usar
async function loadLanguage(lang) {
  const response = await fetch(`i18n/${lang}.json`);
  currentTranslations = await response.json();
  currentLang = lang;

  // Guardamos el idioma elegido en la memoria del navegador,
  // asi la proxima vez que el usuario entre, la pagina recuerda su preferencia
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.setAttribute('lang', lang);

  applyTranslations();
  window.dispatchEvent(new Event('wspace:languageChanged'));
}

// Busca la traduccion de un solo texto puntual (se usa dentro del codigo JS, no en el HTML)
function t(key) {
  return currentTranslations[key] || key;
}

// Recorre toda la pagina buscando textos marcados para traducir, y los reemplaza
function applyTranslations() {
  // Busca todos los elementos que tengan la marca data-i18n="algo" y cambia su texto
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (currentTranslations[key]) {
      el.textContent = currentTranslations[key];
    }
  });

  // Lo mismo, pero para el texto de ejemplo que aparece dentro de los campos de un formulario
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (currentTranslations[key]) {
      el.setAttribute('placeholder', currentTranslations[key]);
    }
  });
}

// Devuelve cual es el idioma activo en este momento ("es" o "en")
function getCurrentLang() {
  return currentLang;
}

// Se ejecuta una sola vez, cuando la pagina carga por primera vez:
// revisa si el usuario ya habia elegido un idioma antes, y si no, usa espanol por defecto
async function initI18n() {
  const savedLang = localStorage.getItem(LANG_STORAGE_KEY) || 'es';
  await loadLanguage(savedLang);
}

// Se ejecuta cuando el usuario hace clic en el boton de cambiar idioma (ES/EN)
async function toggleLanguage() {
  const nextLang = currentLang === 'es' ? 'en' : 'es';
  await loadLanguage(nextLang);
}

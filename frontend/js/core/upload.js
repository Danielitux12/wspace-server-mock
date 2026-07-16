/*
  ARCHIVO: upload.js

  ¿Qué hace este archivo?
  Se encarga de subir fotos y documentos (por ejemplo, las fotos de un
  espacio, o la cedula al convertirse en WSpacer+) a un servicio externo
  llamado Cloudinary, que es como un "almacen" gratuito de imagenes en
  internet. Cuando la foto ya esta subida ahi, Cloudinary nos devuelve un
  link (una direccion web) que es lo que guardamos en nuestra base de datos,
  en vez de guardar la foto completa.

  ANTES DE USAR ESTO DE VERDAD, hay que hacer 3 pasos:
  1. Crear una cuenta gratis en https://cloudinary.com
  2. Dentro del panel de Cloudinary, ir a Settings > Upload y crear un
     "Upload preset" en modo "Unsigned" (esto le da permiso a la pagina
     para subir archivos sin tener que meter contrasenas secretas aqui)
  3. Reemplazar los dos valores de abajo (CLOUDINARY_CLOUD_NAME y
     CLOUDINARY_UPLOAD_PRESET) con los datos reales de esa cuenta
*/

const CLOUDINARY_CLOUD_NAME = 'TU_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'wspace_uploads';

// Toma un archivo (una foto o un documento) y lo sube a Cloudinary.
// Cuando termina, devuelve el link donde quedo guardado ese archivo
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('No se pudo subir el archivo');
  }

  const data = await response.json();
  return data.secure_url;
}

// Conecta un campo de "elegir archivo" del formulario con la subida a
// Cloudinary. Cada vez que el usuario elige uno o varios archivos, esta
// funcion los sube automaticamente uno por uno y avisa cuando cada uno
// ya esta listo (por medio del "onFileUploaded")
function attachFileUploader(inputElement, onFileUploaded) {
  inputElement.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);

    for (const file of files) {
      try {
        showToast(`Subiendo ${file.name}...`);
        const url = await uploadFile(file);
        onFileUploaded(url, file.name);
      } catch (error) {
        showToast(`No se pudo subir ${file.name}`);
      }
    }
  });
}

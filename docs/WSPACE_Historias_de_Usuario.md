# WSPACE — Historias de Usuario

Proyecto Integrador · CodeUp Riwi: Beyond Limits · Ruta Básica

Formato: *Como [rol], quiero [acción], para [beneficio].* Cada historia incluye sus criterios de aceptación.

---

## 1. Cuenta y autenticación

**HU-01 — Registro como WSpacer**
> Como visitante, quiero registrarme con mi nombre, correo y contraseña, para poder buscar y reservar espacios.
- Valida formato de correo electrónico.
- Contraseña mínima de 8 caracteres, con mayúscula y número.
- Confirma que contraseña y confirmación coincidan.
- Valida formato de teléfono (10 dígitos).
- Exige aceptación explícita de Términos y Condiciones y Política de Datos.
- Muestra error si el correo ya está registrado.

**HU-02 — Inicio de sesión**
> Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder a mi cuenta.
- Muestra mensaje claro si las credenciales son incorrectas.
- Redirige a la sección desde la que se abrió el login tras iniciar sesión (sin perder contexto de navegación).

**HU-03 — Cierre de sesión**
> Como usuario autenticado, quiero cerrar sesión, para proteger el acceso a mi cuenta desde un dispositivo compartido.

**HU-04 — Convertirme en WSpacer+**
> Como WSpacer, quiero solicitar el rol WSpacer+ aportando cédula y certificado bancario, para poder publicar espacios y recibir pagos.
- Exige carga de documento de identidad y certificado bancario antes de habilitar el rol.
- Muestra el estado de verificación (pendiente/aprobado) si el proceso requiere revisión.

**HU-05 — Cambiar entre modo WSpacer y modo WSpacer+**
> Como usuario con ambos roles, quiero cambiar de modo desde el menú de perfil, para gestionar mis reservas o mis espacios publicados según lo que necesite.
- El cambio de modo abre una pestaña nueva del navegador, manteniendo la sesión activa sin cerrar la vista original.

**HU-06 — Cambiar idioma de la plataforma**
> Como usuario, quiero cambiar el idioma entre español e inglés, para usar la plataforma en el idioma de mi preferencia.
- El cambio se aplica sin recargar la página.
- La preferencia de idioma se conserva entre sesiones.

---

## 2. Búsqueda y descubrimiento (WSpacer)

**HU-07 — Buscar espacios disponibles**
> Como WSpacer, quiero filtrar espacios por ubicación, tipo, fecha y horario, para encontrar rápidamente uno disponible que se ajuste a mi necesidad.
- Solo muestra espacios sin solapamiento con reservas confirmadas o bloqueos existentes.
- Respeta el horario de atención configurado por cada espacio.
- Muestra un estado vacío claro y accionable si no hay resultados.
- Cada resultado incluye una foto de portada en miniatura.

**HU-08 — Explorar por categoría**
> Como WSpacer, quiero navegar por categorías de espacio (oficina, sala de juntas, coworking, espacio creativo, sala de ensayo musical), para descubrir opciones sin necesidad de escribir una búsqueda específica.

**HU-09 — Ver detalle de un espacio**
> Como WSpacer, quiero ver galería de fotos, amenidades, calendario de disponibilidad, ubicación y reseñas de un espacio, para decidir si lo reservo.
- Las amenidades mostradas corresponden al tipo/subtipo del espacio.
- Se muestran primero las amenidades principales, con opción de "ver todas".

**HU-10 — Guardar espacios como favoritos**
> Como WSpacer, quiero marcar espacios como favoritos, para encontrarlos fácilmente más adelante sin tener que buscarlos de nuevo.

---

## 3. Reservas (WSpacer)

**HU-11 — Solicitar una reserva**
> Como WSpacer, quiero seleccionar fecha y horario y enviar una solicitud de reserva, para asegurar el uso del espacio.
- No permite seleccionar horarios ya ocupados o bloqueados.
- El precio total se recalcula en vivo según el rango de horas seleccionado.
- Muestra el desglose completo (precio base + comisión + IVA) antes de confirmar.

**HU-12 — Ver el estado de mi solicitud**
> Como WSpacer, quiero ver si mi solicitud está pendiente, aprobada o rechazada, para saber si debo esperar o buscar otra opción.
- Muestra el tiempo restante antes de que venza el plazo de respuesta del anfitrión.

**HU-13 — Pagar una reserva aprobada**
> Como WSpacer, quiero pagar mi reserva una vez sea aprobada por el anfitrión, para confirmar mi acceso al espacio.
- Muestra aviso informativo sobre el IVA y la responsabilidad tributaria del WSpacer+.
- Confirma visualmente el pago exitoso con número de referencia.

**HU-14 — Gestionar mis reservas**
> Como WSpacer, quiero ver mis reservas activas, pasadas y canceladas en un solo lugar, para hacer seguimiento a mis solicitudes.

**HU-15 — Cancelar una reserva**
> Como WSpacer, quiero cancelar una reserva confirmada, para liberar el espacio si ya no lo necesito.
- Informa si la cancelación genera penalización según el tiempo restante para la reserva.

**HU-16 — Calificar un espacio**
> Como WSpacer, quiero dejar una calificación y comentario después de una reserva completada, para compartir mi experiencia con otros usuarios.
- La calificación es opcional, no bloquea el cierre de la reserva.
- Solo puede calificar quien tuvo una reserva efectivamente completada.

---

## 4. Publicación y gestión de espacios (WSpacer+)

**HU-17 — Publicar un nuevo espacio**
> Como WSpacer+, quiero registrar un espacio con nombre, tipo, ubicación, precio, fotos y amenidades, para ofrecerlo en la plataforma.
- Exige al menos una foto cargada antes de publicar.
- Muestra una calculadora de precio con comisión e IVA en tiempo real mientras se ingresa el valor por hora.
- Las amenidades disponibles para seleccionar cambian según el tipo/subtipo de espacio elegido.
- Muestra aviso de responsabilidad tributaria del IVA sobre el precio publicado.

**HU-18 — Editar o desactivar un espacio**
> Como WSpacer+, quiero editar la información de mis espacios publicados o desactivarlos temporalmente, para mantener actualizada mi oferta.

**HU-19 — Gestionar disponibilidad**
> Como WSpacer+, quiero bloquear fechas u horarios específicos de un espacio, para evitar reservas cuando no esté disponible.

**HU-20 — Aprobar o rechazar solicitudes de reserva**
> Como WSpacer+, quiero revisar y responder solicitudes de reserva dentro de un plazo definido, para confirmar el uso de mi espacio.
- Si no responde dentro del plazo, la solicitud se cancela automáticamente sin generar cobro.

**HU-21 — Ver panel de ingresos y reservas**
> Como WSpacer+, quiero ver un resumen de reservas pendientes, ingresos del mes y calificación promedio, para hacer seguimiento a mi actividad como anfitrión.

**HU-22 — Ver reseñas recibidas**
> Como WSpacer+, quiero ver las calificaciones y comentarios que han dejado los WSpacers sobre mis espacios, para conocer la percepción de mi servicio.

---

## 5. Comunicación

**HU-23 — Chatear con la contraparte de una reserva**
> Como WSpacer o WSpacer+, quiero enviar mensajes relacionados con una reserva específica, para coordinar detalles antes o durante el uso del espacio.
- El chat solo está disponible en el contexto de una reserva existente, no como mensajería libre.

**HU-24 — Recibir notificaciones**
> Como usuario, quiero recibir notificaciones sobre el estado de mis solicitudes, reservas y pagos, para estar al tanto sin tener que revisar manualmente cada sección.
- Incluye contador de notificaciones no leídas visible en la barra de navegación.
- Cada notificación redirige a la vista relacionada al hacer clic.

---

## 6. General / transversal

**HU-25 — Consultar información legal**
> Como usuario, quiero acceder fácilmente a los Términos y Condiciones y la Política de Tratamiento de Datos, para conocer mis derechos y responsabilidades dentro de la plataforma.

**HU-26 — Recibir descuento de bienvenida**
> Como nuevo visitante, quiero conocer el beneficio de descuento en mi primera reserva a través de una ventana emergente, para animarme a probar la plataforma.
- Se muestra máximo una vez por sesión.
- No vuelve a aparecer si el usuario ya usó su reserva gratuita (`reservas_gratis_usadas`).

**HU-27 — Editar mi perfil**
> Como usuario, quiero actualizar mis datos personales y contraseña, para mantener mi información al día.

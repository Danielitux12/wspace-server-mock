/*
  ARCHIVO: spaceAvailability.js

  ¿Qué hace este archivo?
  Deberia mostrar un calendario donde el WSpacer+ bloquea fechas u horas
  en las que su espacio NO esta disponible. Todavia no esta construido,
  solo hay un mensaje explicando lo que falta.
*/

async function renderSpaceAvailabilityView(container, params) {
  requireHostRole(() => {
    container.innerHTML = `
      <div class="container section">
        <h1 class="section-title">Disponibilidad del espacio</h1>
        <p class="notice-box">
          NOTA para el equipo: aqui va el calendario para bloquear fechas/horas
          (tabla SPACE_BLOCKS del modelo de datos). Falta implementar el componente
          de calendario y conectarlo a POST/DELETE /api/spaces/${params.id}/blocks.
          Ver GUIDE.md seccion de pendientes.
        </p>
      </div>
    `;
  });
}

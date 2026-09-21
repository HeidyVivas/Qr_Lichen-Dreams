/**
 * App Orchestration
 * ====================
 * Inicializa todos los módulos después de que el DOM esté listo.
 */

document.addEventListener('DOMContentLoaded', async function() {
  try {
    await UI.renderAll();
    AnimationManager.init();
  } catch (err) {
    console.error('[Lichen Dreams] Error al inicializar:', err);
  }
});
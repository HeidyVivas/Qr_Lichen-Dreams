// ─────────────────────────────────────────────────────────
// Edita este array cada vez que publiques una nueva versión.
// La primera entrada (índice 0) es SIEMPRE la más reciente.
// ─────────────────────────────────────────────────────────
const VERSIONS = [
  {
    version: "1.0.0",
    date: "2026-09-16",
    changelog: [
      "Primera versión pública de Lichen Dreams",
      "Análisis de líquenes con IA y visión artificial",
      "Mapa interactivo de calidad del aire",
      "Módulo educativo Liquenpedia"
    ],
    url: "https://drive.google.com/uc?export=download&id=1uuuKhhblH0lGlRF31RnIHOq1qQjv9Lrz",
    size: ""
  }
  // Ejemplo para la siguiente versión:
  // {
  //   version: "1.1.0",
  //   date: "2026-10-02",
  //   changelog: ["Corrige fallo al subir fotos", "Mejora tiempos de análisis"],
  //   url: "https://...",
  //   size: "24 MB"
  // },
];

const DOWNLOAD_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12m0 0 5-5m-5 5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const CHEVRON_ICON = `<svg class="chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderCurrent() {
  const [latest] = VERSIONS;
  const block = document.getElementById('current-block');

  if (!latest) {
    block.innerHTML = '<p class="empty-note">Todavía no hay versiones publicadas.</p>';
    return;
  }

  block.innerHTML = `
    <img class="download-logo" src="./icon.png" alt="">
    <div class="version-badge"><span class="dot"></span>Última versión</div>
    <p class="v-title">Lichen Dreams v${latest.version}</p>
    <p class="v-date">${formatDate(latest.date)}</p>
    <ul class="changelog">
      ${latest.changelog.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <a class="btn-download" href="${latest.url}">
      ${DOWNLOAD_ICON}
      Descargar APK
    </a>
    <div class="meta-row">
      ${latest.size ? `<span>${latest.size}</span><span>·</span>` : ''}
      <span>Android</span>
    </div>
  `;
}

function renderHistory() {
  const [, ...older] = VERSIONS;
  const list = document.getElementById('history-list');

  if (older.length === 0) {
    list.innerHTML = '<p class="empty-note">Esta es la primera versión publicada de Lichen Dreams.</p>';
    return;
  }

  list.innerHTML = older.map(v => `
    <details class="version-item">
      <summary>
        <div>
          <div class="v-name">v${v.version}</div>
          <div class="v-date-small">${formatDate(v.date)}</div>
        </div>
        ${CHEVRON_ICON}
      </summary>
      <div class="item-body">
        <ul>${v.changelog.map(item => `<li>${item}</li>`).join('')}</ul>
        <a class="link-download" href="${v.url}">Descargar esta versión</a>
      </div>
    </details>
  `).join('');
}

// Animación de aparición al hacer scroll (Intersection Observer)
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => observer.observe(el));
}

renderCurrent();
renderHistory();
initScrollReveal();
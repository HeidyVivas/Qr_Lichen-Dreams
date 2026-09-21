/**
 * UI Rendering Layer
 * ====================
 * Renderiza toda la interfaz a partir de VersionService.
 * La UI NO conoce la fuente de datos.
 * Solo llama a VersionService.*()
 */

const UI = {

  async renderAll() {
    await this.renderHero();
    await this.renderFeatures();
    this.renderGallery();
    this.renderHowItWorks();
    await this.renderDownload();
    await this.renderVersionHero();
    await this.renderHistory();
    this.renderFAQ();
    this.renderFooter();
    this.createIcons();
  },

  createIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  /* ═══════════════════════════════ NAVBAR */
  renderNavbar() {
    /* Navbar is static HTML, no JS rendering needed */
  },

  /* ═══════════════════════════════ HERO */
  async renderHero() {
    const el = document.getElementById('hero-content');
    if (!el) return;
    const v = await VersionService.getLatest();
const badges = v ? `
        <div class="hero-badges" style="margin-top:20px;">
          <span class="badge badge-accent"><span class="badge-dot"></span>Android</span>
          <span class="badge badge-neutral">v${v.version}</span>
          ${v.build ? `<span class="badge badge-neutral">Build ${v.build}</span>` : ''}
        </div>
      ` : '';
    el.innerHTML = `
      <p class="eyebrow hero-animate">Android · Sitio oficial</p>
      <h1 class="hero-animate" style="font-family:'Fraunces',Georgia,serif;font-size:clamp(42px,10vw,68px);line-height:1.05;letter-spacing:-0.02em;margin-bottom:12px;font-weight:500;">Lichen Dreams</h1>
      <p class="tagline hero-animate">Lee el aire, entiende tu entorno.</p>
      <p class="hero-animate" style="color:var(--ld-ink-soft);font-size:15px;max-width:40ch;margin:16px auto 0;">Analiza líquenes con IA para evaluar la calidad del aire. Comparte tus observaciones en el mapa ambiental comunitario.</p>
      ${badges}
      <div class="hero-meta-row hero-animate" style="margin-top:18px;color:var(--ld-ink-muted);font-size:13px;">
        <span style="display:inline-flex;align-items:center;gap:5px;"><i data-lucide="smartphone" style="width:13px;height:13px;"></i>Android</span>
        ${v && v.size ? '<span style="opacity:0.3;">·</span><span>' + v.size + '</span>' : ''}
      </div>
      <div class="hero-actions hero-animate" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:26px;">
        <a class="btn-download" href="${v ? v.url : '#'}" download aria-label="Descargar Lichen Dreams v${v ? v.version : ''} APK" style="max-width:260px;">
          <i data-lucide="download"></i>
          Descargar APK
        </a>
        <a class="btn-secondary" href="#historial" aria-label="Explorar historial de versiones" style="max-width:200px;">
          <i data-lucide="clock"></i>
          Historial
        </a>
      </div>
      <div class="hero-animate" style="margin-top:16px;">
        <span class="float-badge"><i data-lucide="download"></i> Descarga directa</span>
      </div>
    `;
  },

  /* ═══════════════════════════════ FEATURES */
  renderFeatures() {
    const container = document.getElementById('features-grid');
    if (!container) return;
    const features = [
      { icon: 'camera', title: 'Analizar líquenes', desc: 'Cámara o galería para analizar el estado del líquen mediante IA.' },
      { icon: 'map', title: 'Mapa ambiental', desc: 'Observaciones georreferenciadas propias y de la comunidad, con zonas de transición.' },
      { icon: 'book-open', title: 'Lichenpedia', desc: 'Artículos educativos sobre líquenes y bioindicación.' },
      { icon: 'history', title: 'Historial', desc: 'Consulta tus análisis, filtros, estadísticas y perfil ambiental.' },
      { icon: 'user', title: 'Perfil', desc: 'Gestiona información personal, foto y preferencias.' },
      { icon: 'bell', title: 'Notificaciones', desc: 'Recibe avisos cuando tus análisis terminan, con sonido configurable.' },
      { icon: 'settings', title: 'Configuración', desc: 'Gestiona cuenta, privacidad, notificaciones, apariencia y opciones de la aplicación.' },
      { icon: 'folder', title: 'Catálogos', desc: 'Consulta especies y recursos ambientales disponibles en la aplicación.' }
    ];
    container.innerHTML = features.map(function(f) {
      return '<div class="feature-card reveal">' +
        '<div class="feature-icon"><i data-lucide="' + f.icon + '"></i></div>' +
        '<h3>' + f.title + '</h3>' +
        '<p>' + f.desc + '</p>' +
      '</div>';
    }).join('');
  },

  /* ═══════════════════════════════ GALLERY */
  renderGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    const screens = [
      { id: 1, file: 'dashboard.jpeg', title: 'Dashboard', desc: 'Vista principal con estadísticas, artículos destacados y acceso rápido al análisis.' },
      { id: 2, file: 'analizar.jpeg', title: 'Análisis', desc: 'Captura o selecciona una imagen, elige una especie opcionalmente y envíala al análisis con IA.' },
      { id: 3, file: 'camara.jpeg', title: 'Cámara', desc: 'Cámara para fotografiar líquenes con geolocalización automática.' },
      { id: 4, file: 'resultado.jpeg', title: 'Resultado', desc: 'Estado del líquen, significado ambiental, recomendación y opciones para compartir o explorar el resultado.' },
      { id: 5, file: 'mapa.jpeg', title: 'Mapa ambiental', desc: 'Observaciones georreferenciadas, zonas de transición y filtros ambientales.' },
      { id: 6, file: 'perfil.jpeg', title: 'Perfil', desc: 'Gestión de información personal y foto de perfil.' },
      { id: 7, file: 'liquenpedia.jpeg', title: 'Lichenpedia', desc: 'Artículos educativos sobre líquenes y bioindicación, con búsqueda y categorías.' },
      { id: 8, file: 'historial.jpeg', title: 'Historial', desc: 'Bitácora de análisis con filtros, búsqueda, estadísticas y perfil ambiental.' }
    ];

    container.innerHTML = screens.map(function(s, i) {
      return '<div class="gallery-phone-card reveal" style="transition-delay:' + (i * 60) + 'ms;">' +
        '<div class="phone-mockup" data-screen="' + s.file + '">' +
          '<div class="phone-mockup-frame">' +
            '<div class="phone-mockup-notch"></div>' +
            '<div class="phone-mockup-screen">' +
              '<img class="phone-mockup-image" src="./assets/screenshots/' + s.file + '" alt="' + s.title + '" loading="lazy">' +
              '<div class="phone-mockup-placeholder">' +
                '<span class="placeholder-label">Captura ' + String(s.id).padStart(2, '0') + '</span>' +
                '<span class="placeholder-hint">Reemplaza esta imagen por una captura real</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="phone-mockup-caption">' +
          '<h3>' + s.title + '</h3>' +
          '<p>' + s.desc + '</p>' +
        '</div>' +
      '</div>';
    }).join('');

    this.createIcons();

    // Handle image loading for gallery mockups
    const images = container.querySelectorAll('.phone-mockup-image');
    images.forEach(function(img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
        img.addEventListener('error', function() {
          this.style.display = 'none';
        });
      }
    });
  },

  /* ═══════════════════════════════ HOW IT WORKS */
  renderHowItWorks() {
    const container = document.getElementById('how-grid');
    if (!container) return;
    const steps = [
      { number: '01', icon: 'camera', title: 'Captura', desc: 'Fotografía un líquen con la cámara o selecciona una imagen de tu galería.' },
      { number: '02', icon: 'brain', title: 'Analiza', desc: 'La inteligencia artificial evalúa su estado: saludable, contaminado o no identificado.' },
      { number: '03', icon: 'check-circle', title: 'Resultado', desc: 'Consulta el resultado, su significado ambiental y la recomendación asociada.' },
      { number: '04', icon: 'map', title: 'Explora', desc: 'Revisa tus análisis en el historial, compártelos en el mapa comunitario y aprende en Lichenpedia.' }
    ];
    container.innerHTML = '<div class="flow-connector"></div><div class="flow-grid">' +
      steps.map(function(s) {
        return '<div class="flow-step reveal">' +
          '<span class="flow-number">' + s.number + '</span>' +
          '<div class="flow-icon"><i data-lucide="' + s.icon + '"></i></div>' +
          '<h3>' + s.title + '</h3>' +
          '<p>' + s.desc + '</p>' +
        '</div>';
      }).join('') +
    '</div>';
  },

  /* ═══════════════════════════════ DOWNLOAD */
  async renderDownload() {
    /* Main download card */
    const main = document.getElementById('download-card');
    if (main) {
      const v = await VersionService.getLatest();
      const sizeText = v && v.size ? v.size : 'Tamaño se publicará en el release';
      main.innerHTML =
        '<img class="download-logo" src="./assets/images/icon.png" alt="Icono de la aplicación Lichen Dreams" aria-hidden="true" width="80" height="80">' +
        '<p class="text-center" style="font-size:clamp(22px,5vw,30px);font-family:Fraunces,serif;font-weight:500;margin-bottom:4px;">Lichen Dreams</p>' +
        '<p class="text-center" style="color:var(--ld-ink-muted);font-size:14px;margin-bottom:20px;">v' + (v ? v.version : '1.2.0') + (v && v.build ? ' · Build ' + v.build : '') + ' · Android</p>' +
        '<a class="btn-download" href="' + (v ? v.url : '#') + '" download aria-label="Descargar Lichen Dreams v' + (v ? v.version : '1.2.0') + ' APK">' +
          '<i data-lucide="download"></i>' +
          'Descargar APK' +
        '</a>' +
        '<div class="download-meta" style="justify-content:center;margin-top:16px;">' +
          '<span>v' + (v ? v.version : '1.2.0') + '</span>' +
          '<span style="opacity:0.35;">·</span>' +
          (v && v.build ? '<span>Build ' + v.build + '</span><span style="opacity:0.35;">·</span>' : '') +
          '<span>APK</span>' +
        '</div>';
    }

    /* Sidebar metadata */
    const sidebar = document.getElementById('download-sidebar');
    if (sidebar) {
      const v = await VersionService.getLatest();
      sidebar.innerHTML =
        '<div class="ld-card download-meta-card">' +
          '<p class="download-meta-label">Versión actual</p>' +
          '<p class="download-meta-value">v' + (v ? v.version : '1.2.0') + '</p>' +
          (v && v.build ? '<p class="download-meta-sub">Build ' + v.build + '</p>' : '') +
        '</div>' +
        '<div class="ld-card download-meta-card">' +
          '<p class="download-meta-label">Estado</p>' +
          '<p class="download-meta-value" style="display:flex;align-items:center;gap:6px;"><span class="status-dot"></span> Disponible</p>' +
          '<p class="download-meta-sub">APK listo para descargar</p>' +
        '</div>' +
        '<div class="ld-card download-meta-card">' +
          '<p class="download-meta-label">Formato</p>' +
          '<p class="download-meta-value">Android APK</p>' +
          '<p class="download-meta-sub">Paquete de instalación</p>' +
        '</div>' +
        '<div class="ld-card download-meta-card">' +
          '<p class="download-meta-label">Tamaño</p>' +
          '<p class="download-meta-value">' + (v && v.size ? v.size : 'Se publicará en el release') + '</p>' +
          '<p class="download-meta-sub">Tamaño del APK firmado</p>' +
        '</div>' +
        '<div class="ld-card download-meta-card">' +
          '<p class="download-meta-label">SHA-256</p>' +
          '<p class="download-meta-value" style="font-size:11px;word-break:break-all;">' + (v && v.sha256 ? v.sha256 : 'Se publicará en el release') + '</p>' +
          '<p class="download-meta-sub">Hash del APK firmado</p>' +
        '</div>';
    }
  },

  /* ═══════════════════════════════ VERSION HERO */
  async renderVersionHero() {
    const container = document.getElementById('version-hero');
    if (!container) return;
    const v = await VersionService.getLatest();
    if (!v) {
      container.innerHTML = '<p class="empty-note">Todavía no hay versiones publicadas.</p>';
      return;
    }
    container.innerHTML =
      '<div class="version-hero">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(196,224,148,0.2),transparent);"></div>' +
        '<div class="version-hero-row">' +
          '<img src="./assets/images/icon.png" alt="Icono de Lichen Dreams" style="width:52px;height:52px;border-radius:14px;object-fit:cover;box-shadow:0 6px 20px -4px rgba(78,91,74,0.4);">' +
          '<div>' +
            '<p style="font-family:Fraunces,serif;font-size:clamp(24px,5vw,32px);font-weight:500;margin:0;">Lichen Dreams</p>' +
            '<p style="color:var(--ld-ink-muted);margin:0;">v' + v.version + (v.build ? ' · Build ' + v.build : '') + '</p>' +
          '</div>' +
          '<div style="margin-left:auto;">' +
            '<span class="badge badge-accent"><span class="badge-dot"></span>Actual</span>' +
          '</div>' +
        '</div>' +
        '<div class="version-hero-meta">' +
          '<span style="display:inline-flex;align-items:center;gap:5px;color:var(--ld-ink-muted);font-size:13px;"><i data-lucide="smartphone" style="width:13px;height:13px;"></i>Android</span>' +
          '<span style="display:inline-flex;align-items:center;gap:5px;color:var(--ld-ink-muted);font-size:13px;"><i data-lucide="package" style="width:13px;height:13px;"></i>APK</span>' +
          '<span style="display:inline-flex;align-items:center;gap:5px;color:var(--ld-ink-muted);font-size:13px;"><i data-lucide="hash" style="width:13px;height:13px;"></i>v' + v.version + '</span>' +
        '</div>' +
        '<p style="color:var(--ld-ink-soft);font-size:14px;line-height:1.5;max-width:560px;margin:20px 0 24px;">Versión actual del proyecto según la configuración de compilación de Lichen Dreams.</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:10px;">' +
          '<a class="btn-download" href="' + v.url + '" download aria-label="Descargar versión ' + v.version + '" style="max-width:280px;">' +
            '<i data-lucide="download"></i> Descargar APK' +
          '</a>' +
        '</div>' +
      '</div>';
  },

  /* ═══════════════════════════════ HISTORY */
  async renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const versions = await VersionService.getVersions();
    // Solo mostrar versiones reales (con changelog real y fecha real)
    const realVersions = versions.filter(v => v.changelog && v.changelog.length > 0 && v.date);
    if (realVersions.length === 0) {
      list.innerHTML = '<p class="empty-note" style="color:var(--ld-ink-faint);font-size:14px;padding:8px 2px;">El historial de versiones se completará a medida que se publiquen releases oficiales.</p>';
      return;
    }
    list.innerHTML = realVersions.map(function(v, i) {
      const isCurrent = i === 0;
      return '<details class="version-item reveal">' +
        '<summary>' +
          '<div>' +
            (isCurrent ? '<div class="v-status">Actual</div>' : '') +
            '<div class="v-name">v' + v.version + '</div>' +
            '<div class="v-date-small">' + UI.formatDate(v.date) + '</div>' +
          '</div>' +
          '<i data-lucide="chevron-down" class="chevron"></i>' +
        '</summary>' +
        '<div class="item-body">' +
          '<ul>' +
            v.changelog.map(function(item) {
              return '<li>' + item + '</li>';
            }).join('') +
          '</ul>' +
          '<a class="link-download" href="' + v.url + '" download aria-label="Descargar versión ' + v.version + '">' +
            '<i data-lucide="download"></i>' +
            'Descargar esta versión' +
          '</a>' +
        '</div>' +
      '</details>';
    }).join('');
    this.createIcons();
  },

  /* ═══════════════════════════════ FAQ */
  renderFAQ() {
    const container = document.getElementById('faq-grid');
    if (!container) return;
    const faqs = [
      {
        q: '¿Qué es Lichen Dreams?',
        a: 'Es una aplicación Android que analiza líquenes mediante inteligencia artificial para evaluar su estado como indicador ambiental. Los resultados se clasifican como saludable, contaminado o no identificado.'
      },
      {
        q: '¿Qué hace la IA?',
        a: 'Evalúa el estado visual del líquen en tres categorías: saludable, contaminado o no identificado. No identifica especies taxonómicas.'
      },
      {
        q: '¿Cómo se instala el APK?',
        a: 'Descarga el APK y ábrelo desde tu dispositivo Android. Si Android solicita permiso para instalar aplicaciones desconocidas, concédelo al navegador o gestor de archivos utilizado para abrir el APK.'
      },
      {
        q: '¿Qué versión de Android necesito?',
        a: 'La información se publicará cuando se verifique directamente el archivo de configuración de compilación de Android.'
      },
      {
        q: '¿Dónde veo la versión actual?',
        a: 'La versión actual aparece en las secciones Descargar y Versión actual.'
      },
      {
        q: '¿Puedo instalar una versión anterior?',
        a: 'Solo cuando existan releases anteriores publicados oficialmente.'
      },
      {
        q: '¿Qué significan los resultados?',
        a: 'Saludable indica un indicador favorable; contaminado indica una posible presión ambiental; no identificado significa que la imagen no pudo clasificarse correctamente.'
      },
      {
        q: '¿La IA identifica especies?',
        a: 'No. La IA evalúa el estado del líquen. Si conoces la especie, puedes seleccionarla manualmente cuando la aplicación lo permita.'
      },
      {
        q: '¿Requiere cuenta?',
        a: 'Sí, las funciones de cuenta, historial y participación comunitaria utilizan autenticación.'
      },
      {
        q: '¿Funciona offline?',
        a: 'Algunas funciones locales pueden utilizarse sin conexión, pero el análisis con IA y las funciones que requieren datos remotos necesitan conexión a Internet.'
      }
    ];
    container.innerHTML = faqs.map(function(f) {
      return '<details class="faq-item reveal">' +
        '<summary>' +
          '<span>' + f.q + '</span>' +
          '<i data-lucide="chevron-down" class="faq-chevron"></i>' +
        '</summary>' +
        '<div class="faq-answer">' + f.a + '</div>' +
      '</details>';
    }).join('');
  },

  /* ═══════════════════════════════ FOOTER */
  renderFooter() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear().toString();
    /* Footer is static HTML, year is the only dynamic element */
  }
};
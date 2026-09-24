/**
 * UI Rendering Layer
 * ====================
 * Renderiza toda la interfaz a partir de VersionService.
 * La UI NO conoce la fuente de datos.
 * Solo llama a VersionService.*()
 */

const UI = {

  STORAGE_KEY_DOWNLOADED: 'ld-last-downloaded',

  /**
   * Compara dos versiones semver (major.minor.patch)
   * Retorna: -1 si a < b, 0 si a === b, 1 si a > b
   */
  compareSemver(a, b) {
    const pa = a.split('.').map(n => parseInt(n, 10) || 0);
    const pb = b.split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < 3; i++) {
      if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
    }
    return 0;
  },

  /**
   * Determina el texto y aria-label del botón según versión descargada
   */
  getDownloadButtonState(latestVersion) {
    const downloaded = localStorage.getItem(this.STORAGE_KEY_DOWNLOADED);
    if (!downloaded) {
      return {
        text: 'Instalar',
        aria: `Descargar Lichen Dreams v${latestVersion} APK`
      };
    }
    const cmp = this.compareSemver(downloaded, latestVersion);
    if (cmp < 0) {
      return {
        text: 'Actualizar disponible',
        aria: `Actualizar Lichen Dreams a v${latestVersion} (tienes v${downloaded} descargada)`
      };
    }
    if (cmp === 0) {
      return {
        text: 'Actualizar (ya descargado)',
        aria: `Reinstalar Lichen Dreams v${latestVersion} (ya descargada)`
      };
    }
    return {
      text: 'Versión posterior descargada',
      aria: `Tienes v${downloaded} descargada, más nueva que v${latestVersion}`
    };
  },

  /**
   * Aplica el estado del botón a un elemento <a> de descarga
   */
  applyDownloadButtonState(btn, latestVersion) {
    if (!btn) return;
    const state = this.getDownloadButtonState(latestVersion);
    // Specimen button uses .btn-specimen-label span
    const labelEl = btn.querySelector('.btn-specimen-label');
    if (labelEl) {
      labelEl.textContent = state.text;
    } else {
      // Hero button: direct text node (first child after <i>)
      const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = ' ' + state.text;
    }
    btn.setAttribute('aria-label', state.aria);
  },

  /**
   * Marca la versión como descargada en localStorage
   */
  markVersionDownloaded(version) {
    localStorage.setItem(this.STORAGE_KEY_DOWNLOADED, version);
  },

  async renderAll() {
    await this.renderHero();
    await this.renderFeatures();
    this.renderGallery();
    this.renderHowItWorks();
    await this.renderDownload();
    await this.renderHistory();
    this.renderFAQ();
    this.renderFooter();
    this.initLightbox();
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
    const v = await VersionService.getLatest();
    if (!v) return;

    // Hydrate dynamic badges
    const badgesEl = document.getElementById('hero-badges');
    if (badgesEl) {
      badgesEl.innerHTML = `
        <span class="badge badge-accent"><span class="badge-dot"></span>Android</span>
        <span class="badge badge-neutral">v${v.version}</span>
        ${v.build ? `<span class="badge badge-neutral">Build ${v.build}</span>` : ''}
      `;
    }

    // Hydrate size meta
    const sizeEl = document.getElementById('hero-size-value');
    const sizeSepEl = document.getElementById('hero-size');
    if (sizeEl && v.size) {
      sizeEl.textContent = v.size;
      if (sizeSepEl) sizeSepEl.style.display = 'inline';
    } else if (sizeSepEl) {
      sizeSepEl.style.display = 'none';
    }

    // Hydrate download button
    const downloadBtn = document.getElementById('hero-download-btn');
    if (downloadBtn) {
      downloadBtn.href = v.url || '#';
      downloadBtn.setAttribute('aria-label', `Descargar Lichen Dreams v${v.version} APK`);
    }
  },

  /* ═══════════════════════════════ FEATURES */
  renderFeatures() {
    const container = document.getElementById('features-grid');
    if (!container) return;
    const features = [
      { icon: 'camera', title: 'Analizar líquenes', desc: 'Cámara o galería para analizar el estado del líquen mediante IA.', featured: true },
      { icon: 'map', title: 'Mapa ambiental', desc: 'Observaciones georreferenciadas propias y de la comunidad, con zonas de transición.' },
      { icon: 'book-open', title: 'Lichenpedia', desc: 'Artículos educativos sobre líquenes y bioindicación.' },
      { icon: 'history', title: 'Historial', desc: 'Consulta tus análisis, filtros, estadísticas y perfil ambiental.' },
      { icon: 'user', title: 'Perfil', desc: 'Gestiona información personal, foto y preferencias.' },
      { icon: 'bell', title: 'Notificaciones', desc: 'Recibe avisos cuando tus análisis terminan, con sonido configurable.' },
      { icon: 'settings', title: 'Configuración', desc: 'Gestiona cuenta, privacidad, notificaciones, apariencia y opciones de la aplicación.' },
      { icon: 'folder', title: 'Catálogos', desc: 'Consulta especies y recursos ambientales disponibles en la aplicación.' }
    ];
    container.innerHTML = features.map(function(f, i) {
      const featuredClass = f.featured ? ' featured' : '';
      const delayStyle = ' style="transition-delay:' + (i * 60) + 'ms;"';
      return '<div class="feature-card reveal' + featuredClass + '"' + delayStyle + '>' +
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
              '<div class="phone-mockup-loader" aria-hidden="true"></div>' +
              '<img class="phone-mockup-image" src="./assets/screenshots/' + s.file + '" alt="' + s.title + '" loading="lazy">' +
              '<div class="phone-mockup-placeholder">' +
                '<span class="placeholder-label">Captura ' + String(s.id).padStart(2, '0') + '</span>' +
                '<span class="placeholder-hint">Cargando captura&hellip;</span>' +
              '</div>' +
              '<div class="phone-mockup-error" hidden>' +
                '<i data-lucide="image-off" style="width:32px;height:32px;color:var(--ld-ink-faint);margin-bottom:8px;"></i>' +
                '<span class="placeholder-label">Imagen no disponible</span>' +
                '<span class="placeholder-hint">No se pudo cargar la captura</span>' +
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

    // Handle image loading for gallery mockups
    const images = container.querySelectorAll('.phone-mockup-image');
    images.forEach(function(img) {
      const card = img.closest('.gallery-phone-card');
      const loader = card?.querySelector('.phone-mockup-loader');
      const placeholder = card?.querySelector('.phone-mockup-placeholder');
      const errorEl = card?.querySelector('.phone-mockup-error');

      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
        if (loader) loader.style.display = 'none';
        if (placeholder) { placeholder.style.opacity = '0'; placeholder.style.visibility = 'hidden'; }
      } else {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
          if (loader) loader.style.display = 'none';
          if (placeholder) { placeholder.style.opacity = '0'; placeholder.style.visibility = 'hidden'; }
        });
        img.addEventListener('error', function() {
          this.style.display = 'none';
          if (loader) loader.style.display = 'none';
          if (placeholder) placeholder.style.display = 'none';
          if (errorEl) errorEl.hidden = false;
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
    const v = await VersionService.getLatest();
    if (!v) return;

    /* Header meta: version · build · size · compatibility */
    const headerMeta = document.querySelector('.download-header-meta');
    if (headerMeta) {
      const parts = [`v${v.version}`];
      if (v.build) parts.push(`Build ${v.build}`);
      if (v.size) parts.push(v.size);
      parts.push('Android 8.0+');
      headerMeta.textContent = parts.join(' · ');
    }

    /* Specimen Card */
    const specimenIcon = document.getElementById('specimen-icon');
    if (specimenIcon) {
      specimenIcon.src = './assets/images/icon.png';
      specimenIcon.alt = '';
    }

    const specimenName = document.getElementById('specimen-title');
    if (specimenName) specimenName.textContent = 'Lichen Dreams';

    const specimenVersion = document.getElementById('specimen-version');
    if (specimenVersion) {
      specimenVersion.textContent = `Versión ${v.version}${v.build ? ` · Build ${v.build}` : ''}`;
    }

    /* Primary download button - specimen card */
    const downloadBtn = document.getElementById('specimen-download-btn');
    if (downloadBtn) {
      downloadBtn.href = v.url || '#';
      this.applyDownloadButtonState(downloadBtn, v.version);
      /* Mark as downloaded on click */
      downloadBtn.addEventListener('click', () => this.markVersionDownloaded(v.version), { once: true });
    }

    const btnSize = document.querySelector('.btn-specimen-size');
    if (btnSize && v.size) {
      btnSize.textContent = v.size;
    }

    /* Hero download button - also update its state */
    const heroDownloadBtn = document.getElementById('hero-download-btn');
    if (heroDownloadBtn) {
      heroDownloadBtn.href = v.url || '#';
      this.applyDownloadButtonState(heroDownloadBtn, v.version);
      heroDownloadBtn.addEventListener('click', () => this.markVersionDownloaded(v.version), { once: true });
    }

    /* SHA-256 hash */
    const sha256El = document.getElementById('specimen-sha256');
    if (sha256El) {
      sha256El.textContent = v.sha256 || '—';
    }

    /* Copy hash button */
    const copyBtn = document.querySelector('.specimen-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const hash = sha256El?.textContent?.trim();
        if (hash && hash !== '—') {
          navigator.clipboard.writeText(hash).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.setAttribute('aria-label', 'Copiado');
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.setAttribute('aria-label', 'Copiar hash SHA-256');
            }, 2000);
          });
        }
      });
    }

    /* Field Data */
    const fieldSize = document.getElementById('field-size');
    if (fieldSize) fieldSize.textContent = v.size || '—';

    const fieldBuild = document.getElementById('field-build');
    if (fieldBuild) fieldBuild.textContent = v.build ? `Build ${v.build}` : '—';

    const fieldDate = document.getElementById('field-date');
    if (fieldDate && v.date) {
      fieldDate.textContent = this.formatDate(v.date);
    }

    /* Field Notes / Changelog */
    const changelogList = document.getElementById('field-changelog');
    if (changelogList && v.changelog && v.changelog.length > 0) {
      changelogList.innerHTML = v.changelog.map(item =>
        `<li><span class="field-changelog-dot" aria-hidden="true"></span><span>${item}</span></li>`
      ).join('');
    } else if (changelogList) {
      changelogList.innerHTML = '<li class="field-changelog-empty">Sin novedades registradas</li>';
    }

    /* Previous Specimens */
    const previousVersions = await VersionService.getPrevious();
    const previousList = document.getElementById('previous-list');
    if (previousList && previousVersions.length > 0) {
      // Show up to 3 previous versions
      const displayVersions = previousVersions.slice(0, 3);
      previousList.innerHTML = displayVersions.map(pv => {
        const dateStr = pv.date ? this.formatDate(pv.date) : '';
        const sizeStr = pv.size || '';
        return `
          <li class="previous-item">
            <a href="${pv.url}" download class="previous-item-link" aria-label="Descargar versión ${pv.version}">
              <div class="previous-item-main">
                <span class="previous-item-version">v${pv.version}</span>
                <span class="previous-item-meta">${[sizeStr, dateStr].filter(Boolean).join(' · ')}</span>
              </div>
              <svg class="previous-item-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </li>
        `;
      }).join('');
    } else if (previousList) {
      previousList.innerHTML = '<li class="previous-empty">No hay especímenes anteriores registrados</li>';
    }
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
        a: 'Android 8.0 (Oreo) o superior. La aplicación requiere permisos de cámara, almacenamiento y ubicación para funcionar correctamente.'
      },
      {
        q: '¿Dónde veo la versión actual?',
        a: 'La versión actual, su changelog y el botón de descarga están en la sección <strong>Descargar</strong>.'
      },
      {
        q: '¿Puedo instalar una versión anterior?',
        a: 'Sí, el historial de versiones está disponible en la sección <strong>Historial</strong>. Cada versión incluye su changelog y enlace de descarga.'
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
        a: 'Sí, las funciones de historial, mapa comunitario y notificaciones requieren autenticación. El análisis básico puede usarse sin cuenta.'
      },
      {
        q: '¿Funciona sin conexión?',
        a: 'El análisis con IA y el mapa comunitario requieren conexión a Internet. El historial local y la Lichenpedia cachés están disponibles offline.'
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
  },

  /* ═══════════════════════════════ LIGHTBOX */
  initLightbox() {
    const gallery = document.getElementById('gallery-grid');
    if (!gallery) return;

    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="lightbox-backdrop" aria-hidden="true"></div>
      <div class="lightbox-content" role="dialog" aria-modal="true" aria-label="Vista ampliada de captura">
        <button class="lightbox-close" aria-label="Cerrar vista ampliada"><i data-lucide="x"></i></button>
        <button class="lightbox-prev" aria-label="Anterior"><i data-lucide="chevron-left"></i></button>
        <button class="lightbox-next" aria-label="Siguiente"><i data-lucide="chevron-right"></i></button>
        <div class="lightbox-frame">
          <img class="lightbox-image" src="" alt="">
        </div>
        <div class="lightbox-caption">
          <h3 class="lightbox-title"></h3>
          <p class="lightbox-desc"></p>
        </div>
        <div class="lightbox-counter"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lbImage = lightbox.querySelector('.lightbox-image');
    const lbTitle = lightbox.querySelector('.lightbox-title');
    const lbDesc = lightbox.querySelector('.lightbox-desc');
    const lbCounter = lightbox.querySelector('.lightbox-counter');
    const lbClose = lightbox.querySelector('.lightbox-close');
    const lbPrev = lightbox.querySelector('.lightbox-prev');
    const lbNext = lightbox.querySelector('.lightbox-next');
    const lbBackdrop = lightbox.querySelector('.lightbox-backdrop');

    let currentIndex = 0;
    const screens = [
      { file: 'dashboard.jpeg', title: 'Dashboard', desc: 'Vista principal con estadísticas, artículos destacados y acceso rápido al análisis.' },
      { file: 'analizar.jpeg', title: 'Análisis', desc: 'Captura o selecciona una imagen, elige una especie opcionalmente y envíala al análisis con IA.' },
      { file: 'camara.jpeg', title: 'Cámara', desc: 'Cámara para fotografiar líquenes con geolocalización automática.' },
      { file: 'resultado.jpeg', title: 'Resultado', desc: 'Estado del líquen, significado ambiental, recomendación y opciones para compartir o explorar el resultado.' },
      { file: 'mapa.jpeg', title: 'Mapa ambiental', desc: 'Observaciones georreferenciadas, zonas de transición y filtros ambientales.' },
      { file: 'perfil.jpeg', title: 'Perfil', desc: 'Gestión de información personal y foto de perfil.' },
      { file: 'liquenpedia.jpeg', title: 'Lichenpedia', desc: 'Artículos educativos sobre líquenes y bioindicación, con búsqueda y categorías.' },
      { file: 'historial.jpeg', title: 'Historial', desc: 'Bitácora de análisis con filtros, búsqueda, estadísticas y perfil ambiental.' }
    ];

    const show = (index) => {
      currentIndex = index;
      const s = screens[index];
      lbImage.src = './assets/screenshots/' + s.file;
      lbImage.alt = s.title;
      lbTitle.textContent = s.title;
      lbDesc.textContent = s.desc;
      lbCounter.textContent = (index + 1) + ' / ' + screens.length;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => lightbox.classList.add('open'));
    };

    const hide = () => {
      lightbox.classList.remove('open');
      setTimeout(() => {
        lightbox.hidden = true;
        document.body.style.overflow = '';
      }, 300);
    };

    const navigate = (dir) => {
      currentIndex = (currentIndex + dir + screens.length) % screens.length;
      show(currentIndex);
    };

    // Event delegation for gallery images
    gallery.addEventListener('click', (e) => {
      const card = e.target.closest('.gallery-phone-card');
      if (!card) return;
      const img = card.querySelector('.phone-mockup-image');
      if (!img || !img.classList.contains('loaded')) return;
      const index = Array.from(gallery.children).indexOf(card);
      if (index >= 0) show(index);
    });

    lbClose.addEventListener('click', hide);
    lbBackdrop.addEventListener('click', hide);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    this.createIcons();
  }
};
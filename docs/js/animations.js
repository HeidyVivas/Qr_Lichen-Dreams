/**
 * Animaciones y efectos visuales
 * IntersectionObserver para reveals, glass nav, hero entrance.
 * Respeta prefers-reduced-motion.
 */

const AnimationManager = {
  init() {
    this.initReducedMotion();
    this.initScrollReveal();
    this.initGlassNav();
    this.initHeroEntrance();
    this.initPhoneFloat();
    this.initDecorativeObserver();
    this.initScrollCue();
    this.initActiveNav();
    this.initMobileMenu();
  },

  prefersReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; },

  initReducedMotion() {
    if (this.prefersReducedMotion()) document.documentElement.classList.add('reduced-motion');
  },

  initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (els.length === 0) return;
    if (this.prefersReducedMotion()) { els.forEach(el => el.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  },

  initGlassNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = () => { if (window.scrollY > 30) nav.classList.add('scrolled'); else nav.classList.remove('scrolled'); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  },

  initActiveNav() {
    const sections = ['hero', 'features', 'how', 'download', 'historial', 'faq'];
    const navLinks = document.querySelectorAll('.nav-desktop .nav-link[href^="#"], #mobile-menu a[href^="#"]');
    if (!navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, { threshold: 0.4, rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  },

  initHeroEntrance() {
    if (this.prefersReducedMotion()) return;
    const hero = document.getElementById('hero');
    if (!hero) return;
    const els = hero.querySelectorAll('.hero-animate');
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity var(--motion-entrance) var(--easing-standard) ' + (i * 0.12) + 's, transform var(--motion-entrance) var(--easing-standard) ' + (i * 0.12) + 's';
      requestAnimationFrame(() => { setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 100); });
    });
  },

  initPhoneFloat() {
    if (this.prefersReducedMotion()) return;
    const phoneFrame = document.querySelector('.hero-sidebar .phone-frame');
    if (!phoneFrame) return;

    // Start float animation after entrance completes (last element stagger + entrance duration)
    const entranceDuration = 900; // ms
    const staggerCount = document.querySelectorAll('.hero-animate').length;
    const delay = entranceDuration + (staggerCount * 120) + 200; // buffer

    setTimeout(() => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        phoneFrame.style.animation = 'phone-float 4s ease-in-out infinite';
      }
    }, delay);
  },

  initMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    if (!menu || !toggle) return;

    const open = () => { menu.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
    const close = () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) close(); });
  },

  initDecorativeObserver() {
    if (this.prefersReducedMotion()) return;
    const decorativeSelectors = [
      '.hero-decor',
      '.about-decor',
      '.features-decor',
      '.how-decor',
      '.history-decor',
      '.faq-decor',
      '.gallery-decor',
      '.footer-decor'
    ];
    const elements = document.querySelectorAll(decorativeSelectors.join(', '));
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('paused');
        } else {
          entry.target.classList.add('paused');
        }
      });
    }, { threshold: 0, rootMargin: '100px' });

    elements.forEach(el => observer.observe(el));
  },

  initScrollCue() {
    const scrollCue = document.querySelector('.scroll-cue');
    if (!scrollCue) return;

    scrollCue.addEventListener('click', () => {
      const features = document.getElementById('features');
      if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Hide scroll cue after user scrolls past hero
    const hero = document.getElementById('hero');
    if (!hero) return;

    const onScroll = () => {
      if (window.scrollY > hero.offsetHeight * 0.3) {
        scrollCue.style.opacity = '0';
        scrollCue.style.pointerEvents = 'none';
      } else {
        scrollCue.style.opacity = '';
        scrollCue.style.pointerEvents = '';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
};
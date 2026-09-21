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

  initHeroEntrance() {
    if (this.prefersReducedMotion()) return;
    const hero = document.getElementById('hero');
    if (!hero) return;
    const els = hero.querySelectorAll('.hero-animate');
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.9s cubic-bezier(0.4,0,0.2,1) ' + (i * 0.12) + 's, transform 0.9s cubic-bezier(0.4,0,0.2,1) ' + (i * 0.12) + 's';
      requestAnimationFrame(() => { setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 100); });
    });
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
  }
};
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var links  = document.getElementById('nav-links');
  var navs   = document.querySelectorAll('.nav-link');
  var sects  = document.querySelectorAll('section[id]');
  var form   = document.getElementById('contact-form');

  // ─── i18n ───────────────────────────────────────

  var T = window.TRANSLATIONS || {};
  var L = window.LANGUAGES || {};

  function setLanguage(lang) {
    var t = T[lang];
    var meta = L[lang];
    if (!t || !meta) return;

    var root = document.documentElement;
    root.lang = lang;
    root.dir  = meta.dir;

    // textContent
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = t[el.getAttribute('data-i18n')];
      if (val !== undefined) el.textContent = val;
    });

    // innerHTML (keys containing markup)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = t[el.getAttribute('data-i18n-html')];
      if (val !== undefined) el.innerHTML = val;
    });

    // placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var val = t[el.getAttribute('data-i18n-ph')];
      if (val !== undefined) el.placeholder = val;
    });

    // page title
    if (t['meta.title']) document.title = t['meta.title'];

    // update switcher UI
    var btn = document.getElementById('lang-current');
    if (btn) btn.querySelector('span').textContent = meta.short;

    document.querySelectorAll('.lang-option').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-lang') === lang);
    });
    document.querySelectorAll('.lang-opt-m').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-lang') === lang);
    });

    // close dropdown
    var sw = document.getElementById('lang-switcher');
    if (sw) sw.classList.remove('open');

    try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
  }

  // Dropdown toggle
  var langSwitcher = document.getElementById('lang-switcher');
  if (langSwitcher) {
    langSwitcher.querySelector('.lang-current').addEventListener('click', function (e) {
      e.stopPropagation();
      langSwitcher.classList.toggle('open');
    });
    langSwitcher.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setLanguage(opt.getAttribute('data-lang'));
      });
    });
  }

  // Mobile lang buttons
  document.querySelectorAll('.lang-opt-m').forEach(function (opt) {
    opt.addEventListener('click', function () {
      setLanguage(opt.getAttribute('data-lang'));
      closeNav();
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', function (e) {
    if (langSwitcher && !langSwitcher.contains(e.target)) {
      langSwitcher.classList.remove('open');
    }
  });

  // Init saved language
  var saved = 'en';
  try { saved = localStorage.getItem('lang') || 'en'; } catch (e) {}
  if (!T[saved]) saved = 'en';
  setLanguage(saved);

  // ─── Mobile nav ─────────────────────────────────

  function openNav()  { links.classList.add('open');    toggle.classList.add('active');    toggle.setAttribute('aria-expanded', 'true');  document.body.style.overflow = 'hidden'; }
  function closeNav() { links.classList.remove('open'); toggle.classList.remove('active'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }

  toggle.addEventListener('click', function () {
    links.classList.contains('open') ? closeNav() : openNav();
  });

  navs.forEach(function (l) { l.addEventListener('click', closeNav); });

  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (links.classList.contains('open')) { closeNav(); toggle.focus(); }
      if (langSwitcher) langSwitcher.classList.remove('open');
    }
  });

  // ─── Header scroll ──────────────────────────────

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  // ─── Active nav ─────────────────────────────────

  function setActiveNav() {
    var y = window.scrollY + 100;
    sects.forEach(function (s) {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        var id = s.getAttribute('id');
        navs.forEach(function (n) {
          n.classList.toggle('active', n.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  // ─── Scroll reveal with stagger ─────────────────

  function initReveal() {
    var standalone = document.querySelectorAll(
      '.section-header, .about-text, .about-grid .timeline, .pull-quote, ' +
      '.services-section, .testimonials-section, .bento, .ig-stories, .story-grid, ' +
      '.lessons-section, .resources-section, .collab-content, ' +
      '.collab-offer, .collab-logos-section, .contact-form, .contact-aside, .hero-content, .hero-portrait'
    );

    standalone.forEach(function (el) { el.classList.add('reveal'); });

    var staggers = document.querySelectorAll('.stagger');
    staggers.forEach(function (container) {
      var children = container.children;
      for (var i = 0; i < children.length; i++) {
        children[i].classList.add('reveal');
      }
    });

    var all = document.querySelectorAll('.reveal');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    all.forEach(function (el) { obs.observe(el); });
  }

  // ─── Marquee pause on hover ─────────────────────

  var marquee = document.querySelector('.marquee-track');
  if (marquee) {
    marquee.parentElement.addEventListener('mouseenter', function () { marquee.style.animationPlayState = 'paused'; });
    marquee.parentElement.addEventListener('mouseleave', function () { marquee.style.animationPlayState = 'running'; });
  }

  // ─── Contact form ───────────────────────────────

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var lang = document.documentElement.lang || 'en';
      var t = T[lang] || {};
      var originalText = t['contact.submit'] || 'Send Message';
      btn.textContent = t['contact.sending'] || 'Sending…';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          btn.textContent = t['contact.sent'] || 'Sent!';
          form.reset();
        } else {
          btn.textContent = t['contact.error'] || 'Error — try again';
        }
      }).catch(function () {
        btn.textContent = t['contact.error'] || 'Error — try again';
      }).finally(function () {
        setTimeout(function () { btn.textContent = originalText; btn.disabled = false; btn.style.opacity = '1'; }, 2000);
      });
    });
  }

  // ─── Scroll listener ────────────────────────────

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { onScroll(); setActiveNav(); ticking = false; });
      ticking = true;
    }
  });

  onScroll();
  setActiveNav();
  initReveal();
})();

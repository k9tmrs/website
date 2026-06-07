(function () {
  'use strict';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  // --- Shared layout (header + footer) -------------------------------------
  // The navbar and footer are identical across pages, so they are defined once
  // here and injected into the #site-header / #site-footer placeholders. Each
  // page declares its identity via <body data-page="...">: links resolve to
  // same-page anchors on the home page and cross-page anchors elsewhere.
  const NAV_ITEMS = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features & Benefits' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'hoops', label: 'Hoops' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy', label: 'Privacy Policy', page: 'privacy.html' }
  ];

  function currentPage() {
    return (document.body && document.body.getAttribute('data-page')) || 'home';
  }

  function el(tag, attrs) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function navHref(item, page) {
    if (page === 'home') return '#' + item.id;
    if (item.page) return item.page;
    return 'index.html#' + item.id;
  }

  function navLinkAttrs(item, page, className) {
    const attrs = { href: navHref(item, page), class: className };
    if (page === 'home') {
      // Scroll-spy highlighting only applies where the target sections exist.
      attrs['data-nav-target'] = item.id;
    } else if (item.page && navHref(item, page) === item.page) {
      // Mark the link to the current standalone page (e.g. Privacy) as active.
      attrs.class = className + ' active';
    }
    return attrs;
  }

  function buildHeader() {
    const page = currentPage();

    const header = document.createElement('header');
    const nav = el('nav', { class: 'navbar', 'aria-label': 'Primary' });
    const inner = el('div', { class: 'nav-inner' });

    const logo = el('a', {
      class: 'logo-area',
      'aria-label': 'K9 TMRS home',
      href: page === 'home' ? '#home' : 'index.html#home'
    });
    logo.appendChild(el('img', { src: 'images/logo.svg', alt: 'K9 TMRS', class: 'logo-img' }));
    inner.appendChild(logo);

    const links = el('div', { class: 'navbar-links', 'aria-label': 'Primary navigation links' });
    NAV_ITEMS.forEach(function (item) {
      const link = el('a', navLinkAttrs(item, page, 'nav-link'));
      link.appendChild(document.createTextNode(item.label));
      link.appendChild(el('span', { class: 'nav-link-indicator' }));
      links.appendChild(link);
    });
    inner.appendChild(links);

    const toggle = el('button', {
      class: 'mobile-nav-toggle',
      type: 'button',
      'aria-label': 'Toggle navigation menu',
      'aria-expanded': 'false'
    });
    toggle.appendChild(el('span', { class: 'mobile-nav-toggle-icon', 'aria-hidden': 'true' }));
    inner.appendChild(toggle);

    nav.appendChild(inner);

    const drawer = el('div', { class: 'mobile-nav-drawer', hidden: '' });
    NAV_ITEMS.forEach(function (item) {
      const link = el('a', navLinkAttrs(item, page, 'mobile-nav-link'));
      link.appendChild(document.createTextNode(item.label));
      drawer.appendChild(link);
    });
    nav.appendChild(drawer);

    header.appendChild(nav);
    return header;
  }

  function buildFooter() {
    const footer = el('footer', { class: 'footer' });
    const inner = el('div', { class: 'footer-inner' });

    const copy = el('p', { class: 'footer-text' });
    copy.appendChild(document.createTextNode('© 2026 K9 TMRS. All rights reserved.'));
    inner.appendChild(copy);

    const credit = el('p', { class: 'footer-credit-text' });
    credit.appendChild(document.createTextNode('Created by Neon'));
    inner.appendChild(credit);

    footer.appendChild(inner);
    return footer;
  }

  function mount(id, node) {
    const placeholder = document.getElementById(id);
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.replaceChild(node, placeholder);
    }
  }

  function initLayout() {
    mount('site-header', buildHeader());
    mount('site-footer', buildFooter());
  }

  function initMobileNav() {
    const toggle = qs('.mobile-nav-toggle');
    const drawer = qs('.mobile-nav-drawer');
    if (!toggle || !drawer) return;

    function closeDrawer() {
      drawer.classList.remove('active');
      drawer.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openDrawer() {
      drawer.classList.add('active');
      drawer.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    drawer.addEventListener('click', function (event) {
      const target = event.target;
      if (target && target.classList.contains('mobile-nav-link')) {
        closeDrawer();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        closeDrawer();
      }
    });
  }

  function initScrollReveal() {
    const elements = qsa('.scroll-reveal');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      elements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      elements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  function initNavHighlight() {
    const navLinks = qsa('.nav-link');
    if (!navLinks.length) return;

    const sections = navLinks
      .map(function (link) {
        const id = link.getAttribute('data-nav-target');
        if (!id) return null;
        const section = qs('#' + id);
        if (!section) return null;
        return { link: link, section: section };
      })
      .filter(Boolean);

    // No in-page sections to track (e.g. the privacy page) — leave any
    // server-rendered active state untouched.
    if (!sections.length) return;

    function setActiveLink() {
      const scrollPos = window.scrollY || window.pageYOffset;
      const offset = 120;
      let active = null;

      sections.forEach(function (item) {
        const rect = item.section.getBoundingClientRect();
        const top = rect.top + scrollPos - offset;
        if (scrollPos >= top) {
          active = item.link;
        }
      });

      navLinks.forEach(function (link) {
        if (link === active) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    setActiveLink();

    let timeoutId = null;
    window.addEventListener('scroll', function () {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(setActiveLink, 80);
    });
  }

  function initSmoothScroll() {
    function handleClick(event) {
      const target = event.target.closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      event.preventDefault();
      const rect = section.getBoundingClientRect();
      const offset = window.scrollY || window.pageYOffset;
      const top = rect.top + offset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }

    document.addEventListener('click', handleClick);
  }

  function initContactForm() {
    const form = qs('#contact-form');
    if (!form) return;

    const nameInput = qs('#name');
    const emailInput = qs('#email');
    const messageInput = qs('#message');
    const statusEl = qs('#form-status');
    const submitBtn = qs('#contact-submit');

    function setStatus(message, type) {
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.className = '';
      if (!message) return;
      statusEl.textContent = message;
      if (type === 'success') {
        statusEl.classList.add('alert-success');
      } else if (type === 'error') {
        statusEl.classList.add('alert-danger');
      }
    }

    function setFieldError(field, message) {
      if (!field) return;
      const id = field.getAttribute('id');
      if (!id) return;
      const errorEl = qs('[data-error-for="' + id + '"]');
      if (!errorEl) return;
      errorEl.textContent = message || '';
    }

    function validateEmail(value) {
      if (!value) return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(value).toLowerCase());
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setStatus('', '');

      let valid = true;

      if (nameInput) {
        if (!nameInput.value.trim()) {
          setFieldError(nameInput, 'Please enter your name.');
          valid = false;
        } else {
          setFieldError(nameInput, '');
        }
      }

      if (emailInput) {
        const emailVal = emailInput.value.trim();
        if (!emailVal) {
          setFieldError(emailInput, 'Please enter your email address.');
          valid = false;
        } else if (!validateEmail(emailVal)) {
          setFieldError(emailInput, 'Please enter a valid email address.');
          valid = false;
        } else {
          setFieldError(emailInput, '');
        }
      }

      if (messageInput) {
        if (!messageInput.value.trim()) {
          setFieldError(messageInput, 'Please enter a message.');
          valid = false;
        } else {
          setFieldError(messageInput, '');
        }
      }

      if (!valid) {
        setStatus('Please fix the highlighted fields and try again.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
      }

      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
        }
        if (form) {
          form.reset();
        }
        setStatus('Thank you for your message. We will get back to you shortly.', 'success');
      }, 600);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      initLayout();
      initMobileNav();
      initScrollReveal();
      initNavHighlight();
      initSmoothScroll();
      initContactForm();
    } catch (e) {
      console.error('Initialization error:', e);
    }
  });
})();

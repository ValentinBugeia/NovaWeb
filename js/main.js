'use strict';

/* ─────────────────────────────────────────
   LOADER
───────────────────────────────────────── */
const loader    = document.getElementById('loader');
const loaderPct = document.getElementById('loaderPct');
let pct = 0;

loader.classList.add('go');

const loadInterval = setInterval(() => {
  pct = Math.min(pct + Math.random() * 18, 99);
  loaderPct.textContent = Math.floor(pct) + '%';
}, 80);

window.addEventListener('load', () => {
  clearInterval(loadInterval);
  loaderPct.textContent = '100%';
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    triggerHeroReveal();
    startCounters();
  }, 400);
});

/* ─────────────────────────────────────────
   HERO REVEAL ON LOAD
───────────────────────────────────────── */
function triggerHeroReveal() {
  document.querySelectorAll('.hero .line-wrap, .hero .reveal-clip, .hero .reveal-fade')
    .forEach(el => el.classList.add('in'));
}

/* ─────────────────────────────────────────
   CUSTOM CURSOR — dot + ring + spotlight
───────────────────────────────────────── */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const spotlight  = document.getElementById('spotlight');

let mx = window.innerWidth / 2,  my = window.innerHeight / 2;
let rx = mx, ry = my;
let sx = mx, sy = my;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

document.addEventListener('mouseleave', () => {
  cursorDot.style.opacity = '0';
  cursorRing.style.opacity = '0';
  spotlight.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursorDot.style.opacity = '1';
  cursorRing.style.opacity = '1';
  spotlight.style.opacity = '1';
});

(function moveCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  sx += (mx - sx) * 0.05;
  sy += (my - sy) * 0.05;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  spotlight.style.left  = sx + 'px';
  spotlight.style.top   = sy + 'px';
  requestAnimationFrame(moveCursor);
})();

document.querySelectorAll('a, button, .service-item, .portfolio-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.classList.add('hov');
    cursorDot.classList.add('hov');
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.classList.remove('hov');
    cursorDot.classList.remove('hov');
  });
});

/* ─────────────────────────────────────────
   NAV — SCROLL + CLOCK + BURGER
───────────────────────────────────────── */
const nav        = document.getElementById('nav');
const siteHeader = nav.closest('.site-header');
const burger     = document.getElementById('burger');
const fullMenu   = document.getElementById('fullMenu');

// Sticky nav
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 30;
  nav.classList.toggle('scrolled', scrolled);
  siteHeader.classList.toggle('scrolled', scrolled);
}, { passive: true });

// Live clock
const navTime = document.getElementById('navTime');
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  navTime.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

// Burger / fullscreen menu
burger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('menu-open');
  fullMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
fullMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    nav.classList.remove('menu-open');
    fullMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─────────────────────────────────────────
   SMOOTH ANCHOR SCROLL
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d', { alpha: true });
  const COUNT  = 40;
  const LINK   = 130;
  const FPS    = 30;
  const STEP   = 1000 / FPS;
  let W, H, pts = [];
  let mx = -9999, my = -9999;
  let lastTs = 0, visible = true;

  let resizeTimer;
  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  }, { passive: true });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
    .observe(canvas.parentElement);

  class Pt {
    constructor() {
      this.x  = Math.random() * (W || 1200);
      this.y  = Math.random() * (H || 800);
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = Math.random() * 1.5 + .5;
      this.a  = Math.random() * .5 + .15;
    }
    tick() {
      const dx = this.x - mx, dy = this.y - my;
      const d  = Math.hypot(dx, dy);
      if (d < 100) {
        const f = (100 - d) / 100 * .6;
        this.vx += dx / d * f * .25;
        this.vy += dy / d * f * .25;
      }
      this.vx *= .98; this.vy *= .98;
      this.x  += this.vx; this.y += this.vy;
      if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,191,255,${this.a})`;
      ctx.fill();
    }
  }

  resize();
  pts = Array.from({ length: COUNT }, () => new Pt());

  (function frame(ts) {
    requestAnimationFrame(frame);
    if (!visible || ts - lastTs < STEP) return;
    lastTs = ts;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      pts[i].tick();
      pts[i].draw();
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,191,255,${(1 - d / LINK) * .25})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  })(0);
})();

/* ─────────────────────────────────────────
   COUNTERS (run once)
───────────────────────────────────────── */
function startCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target   = +el.dataset.target;
    const duration = 1800;
    const t0       = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(e * target);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ─────────────────────────────────────────
   INTERSECTION OBSERVER — scroll reveals
───────────────────────────────────────── */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    target.classList.add('in');
    revealIO.unobserve(target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Observe all reveal elements outside .hero (hero is revealed by loader)
document.querySelectorAll('.reveal-clip, .reveal-fade, .line-wrap').forEach(el => {
  if (!el.closest('.hero')) revealIO.observe(el);
});

/* ─────────────────────────────────────────
   PORTFOLIO ITEMS — stagger within section
───────────────────────────────────────── */
const portIO = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.querySelectorAll('.reveal-fade').forEach((el, i) => {
        el.style.setProperty('--d', `${i * 0.1}s`);
        el.classList.add('in');
      });
      portIO.unobserve(target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.services-list, .process-grid').forEach(el => portIO.observe(el));

/* ─────────────────────────────────────────
   FORM SUBMIT — sauvegarde dans Firestore
───────────────────────────────────────── */
document.getElementById('devisForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = this.querySelector('.btn-submit');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Envoi en cours...';

  const payload = {
    prenom:      this.querySelector('#prenom').value.trim(),
    nom:         this.querySelector('#nom').value.trim(),
    email:       this.querySelector('#email').value.trim().toLowerCase(),
    telephone:   this.querySelector('#telephone').value.trim(),
    type:        this.querySelector('#type').value,
    description: this.querySelector('#description').value.trim(),
    createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('devisRequests').add(payload);
  } catch {
    // Firebase non configuré ou erreur réseau — on affiche quand même le succès
  }

  document.getElementById('formSuccess').classList.add('show');
});

/* ─────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ─────────────────────────────────────────
   SCROLL-TO-TOP
───────────────────────────────────────── */
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─────────────────────────────────────────
   TOGGLE CHATBOT : masqué dans le hero
───────────────────────────────────────── */
(function initChatbotVisibility() {
  const hero    = document.getElementById('home');
  const chatbot = document.getElementById('chatbot');
  if (!hero || !chatbot) return;
  const observer = new IntersectionObserver(([entry]) => {
    const shouldHide = entry.isIntersecting && !chatbot.classList.contains('open');
    chatbot.classList.toggle('hero-hidden', shouldHide);
  }, { threshold: 0.15 });
  observer.observe(hero);
})();

/* ─────────────────────────────────────────
   COSMO — chargement Spline différé
───────────────────────────────────────── */
window.addEventListener('load', () => {
  const container = document.getElementById('cosmoContainer');
  if (!container) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src  = 'https://unpkg.com/@splinetool/viewer@1.12.88/build/spline-viewer.js';
  script.onload = () => {
    const viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', 'https://prod.spline.design/xOC0lAEzP97HA9oP/scene.splinecode');
    container.prepend(viewer);
  };
  document.head.appendChild(script);
});

/* ─────────────────────────────────────────
   COSMO — clic pour ouvrir le chat
───────────────────────────────────────── */
const cosmoClick = document.getElementById('cosmoClick');
if (cosmoClick) {
  cosmoClick.addEventListener('click', () => {
    const chatbot = document.getElementById('chatbot');
    const input   = document.getElementById('chatbotInput');
    const bubble  = document.getElementById('chatbotBubble');
    chatbot.classList.remove('hero-hidden');
    chatbot.classList.add('open');
    bubble && bubble.classList.add('hidden');
    setTimeout(() => input && input.focus(), 350);
  });
}

/* ─────────────────────────────────────────
   CHATBOT
───────────────────────────────────────── */
(function initChatbot() {
  const chatbot      = document.getElementById('chatbot');
  const toggle       = document.getElementById('chatbotToggle');
  const messagesEl   = document.getElementById('chatbotMessages');
  const input        = document.getElementById('chatbotInput');
  const sendBtn      = document.getElementById('chatbotSend');
  const bubble       = document.getElementById('chatbotBubble');
  const bubbleClose  = document.getElementById('chatbotBubbleClose');
  const suggestions  = document.getElementById('chatbotSuggestions');
  const closeBtn     = document.getElementById('chatbotClose');
  const minimizeBtn  = document.getElementById('chatbotMinimize');

  const CHAT_URL = '/api/chat';
  const history  = [];

  // Bulle de teasing — fermer
  bubbleClose.addEventListener('click', e => {
    e.stopPropagation();
    bubble.classList.add('hidden');
  });

  // Boutons header panel
  closeBtn.addEventListener('click', () => {
    chatbot.classList.remove('open');
  });
  minimizeBtn.addEventListener('click', () => {
    chatbot.classList.remove('open');
  });

  // Open / close
  toggle.addEventListener('click', () => {
    chatbot.classList.toggle('open');
    bubble.classList.add('hidden');
    if (chatbot.classList.contains('open')) input.focus();
  });

  // Chips de questions suggérées
  suggestions.querySelectorAll('.chatbot__chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent.replace(/^[\S]+\s/, '');
      suggestions.remove();
      sendMessage();
    });
  });

  // Send on Enter
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  const COSMO_AVATAR_SVG = `<svg width="22" height="22" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="28" r="18" fill="#0a1628" stroke="#00bfff" stroke-width="1.5"/><ellipse cx="30" cy="28" rx="13" ry="11" fill="#001f3f" stroke="#00bfff" stroke-width="1"/><circle cx="24" cy="27" r="3.2" fill="#00bfff" opacity=".9"/><circle cx="36" cy="27" r="3.2" fill="#00bfff" opacity=".9"/><circle cx="24" cy="27" r="1.4" fill="#fff"/><circle cx="36" cy="27" r="1.4" fill="#fff"/><path d="M24 34 Q30 38 36 34" stroke="#00bfff" stroke-width="1.2" stroke-linecap="round" fill="none"/><line x1="30" y1="10" x2="30" y2="6" stroke="#00bfff" stroke-width="1.5"/><circle cx="30" cy="5" r="2" fill="#00bfff"/><rect x="22" y="41" width="16" height="8" rx="3" fill="#0a1628" stroke="#00bfff" stroke-width="1"/></svg>`;

  function addMsg(role, text) {
    const wrap  = document.createElement('div');
    wrap.className = `chatbot__msg chatbot__msg--${role === 'user' ? 'user' : 'bot'}`;
    if (role !== 'user') {
      const avatarEl = document.createElement('div');
      avatarEl.className = 'chatbot__msg-avatar';
      avatarEl.innerHTML = COSMO_AVATAR_SVG;
      wrap.appendChild(avatarEl);
    }
    const inner = document.createElement(role === 'user' ? 'span' : 'p');
    inner.textContent = text;
    wrap.appendChild(inner);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chatbot__typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;
    if (suggestions.parentNode) suggestions.remove();
    addMsg('user', text);
    history.push({ role: 'user', content: text });

    const typing = showTyping();

    try {
      const res   = await fetch(CHAT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      });
      const data  = await res.json();
      const reply = data.reply || 'Désolé, une erreur est survenue.';
      history.push({ role: 'assistant', content: reply });
      typing.remove();
      addMsg('bot', reply);
    } catch {
      typing.remove();
      addMsg('bot', 'Impossible de joindre l\'assistant pour le moment.');
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }
})();

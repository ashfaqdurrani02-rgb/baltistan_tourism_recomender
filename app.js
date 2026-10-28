/* ═══════════════════════════════════════════════
   BALTISTAN AI TOURISM – app.js  (v2 Enhanced)
   Hybrid Recommender: TF-IDF Content Similarity +
   Bayesian Weighted Rating (WR)
   + Hero Slideshow · Canvas Particles · Tilt Cards
   + Scroll Reveal · Floating Widget
   ═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════
   1. HERO IMAGE SLIDESHOW
══════════════════════════════════════════════ */
(function initSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.getElementById('slideDots');
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
    resetTimer();
  }

  function next() { goTo(current + 1); }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5500);
  }

  resetTimer();
})();


/* ══════════════════════════════════════════════
   2. INTERACTIVE CANVAS PARTICLES (Snow / Dust)
══════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  let mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = 120;
  const REPEL_RADIUS   = 100;
  const REPEL_STRENGTH = 1.8;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   Math.random() * 0.4 + 0.15,
      r:    Math.random() * 2.5 + 0.8,
      alpha:Math.random() * 0.55 + 0.15,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: (Math.random() - 0.5) * 0.018,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, mkParticle);
    // Spread particles naturally across full canvas at start
    particles.forEach(p => { p.y = Math.random() * H; });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Wobble drift
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.22;
      p.y += p.vy;

      // Cursor repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
        p.x += (dx / dist) * force * REPEL_STRENGTH;
        p.y += (dy / dist) * force * REPEL_STRENGTH;
      }

      // Wrap around edges
      if (p.y > H + 5)  { Object.assign(p, mkParticle()); p.y = -5; p.x = Math.random() * W; }
      if (p.x < -5)     p.x = W + 5;
      if (p.x > W + 5)  p.x = -5;

      // Draw snowflake-like dot with soft glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
      grd.addColorStop(0,   `rgba(200,225,255,${p.alpha})`);
      grd.addColorStop(0.5, `rgba(150,200,255,${p.alpha * 0.6})`);
      grd.addColorStop(1,   `rgba(100,160,255,0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Crisp centre dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,${p.alpha * 0.9})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  // Track mouse in hero
  document.getElementById('hero').addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  document.getElementById('hero').addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
})();


/* ══════════════════════════════════════════════
   3. NAV SCROLL CLASS
══════════════════════════════════════════════ */
(function initNavScroll() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ══════════════════════════════════════════════
   4. SCROLL REVEAL
══════════════════════════════════════════════ */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  // Add reveal class to animatable elements
  const targets = [
    '.section-header',
    '.feature-card',
    '.district-card',
    '.contact-card',
    '.form-card',
  ];
  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      const delay = (i % 4);
      if (delay) el.classList.add(`reveal-delay-${delay}`);
      observer.observe(el);
    });
  });
})();


/* ══════════════════════════════════════════════
   5. 3D TILT + GLOW EFFECT ON CARDS
══════════════════════════════════════════════ */
(function initTilt() {
  const TILT_MAX = 8; // degrees

  function applyTilt(card) {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = -dy * TILT_MAX;
      const ry =  dx * TILT_MAX;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
      // Dynamic glow follow
      const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', mx);
      card.style.setProperty('--my', my);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
    card.addEventListener('mousedown', () => {
      card.style.transform = card.style.transform.replace('scale(1.03)', 'scale(0.99)');
    });
    card.addEventListener('mouseup', e => {
      // re-trigger move to restore correct scale
      card.dispatchEvent(new MouseEvent('mousemove', e));
    });
  }

  // Apply to tilt-card elements (and dynamically to result cards)
  document.querySelectorAll('.tilt-card').forEach(applyTilt);

  // Expose so result cards can use it after render
  window.applyTiltToNew = function() {
    document.querySelectorAll('.result-card:not([data-tilt])').forEach(card => {
      card.dataset.tilt = '1';
      applyTilt(card);
    });
  };
})();


/* ══════════════════════════════════════════════
   6. FLOATING CONTACT WIDGET
══════════════════════════════════════════════ */
function toggleWidget() {
  const panel  = document.getElementById('widgetPanel');
  const iconO  = document.querySelector('.widget-icon-open');
  const iconC  = document.querySelector('.widget-icon-close');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  iconO.classList.toggle('hidden', !isOpen);
  iconC.classList.toggle('hidden', isOpen);
}
// Close on outside click
document.addEventListener('click', e => {
  const widget = document.getElementById('floatingWidget');
  if (widget && !widget.contains(e.target)) {
    const panel = document.getElementById('widgetPanel');
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      document.querySelector('.widget-icon-open').classList.remove('hidden');
      document.querySelector('.widget-icon-close').classList.add('hidden');
    }
  }
});


/* ══════════════════════════════════════════════
   7. FEATURE CARD CURSOR GLOW
══════════════════════════════════════════════ */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    card.style.setProperty('--mx', mx);
    card.style.setProperty('--my', my);
  });
});


/* ══════════════════════════════════════════════
   8. COUNTER ANIMATION FOR HERO STATS
══════════════════════════════════════════════ */
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
      const suffix = el.textContent.replace(/[0-9.]/g, '');
      let start = 0;
      const step = target / 50;
      const tick = setInterval(() => {
        start += step;
        if (start >= target) { el.textContent = target + suffix; clearInterval(tick); return; }
        el.textContent = Math.floor(start) + suffix;
      }, 30);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
})();


/* ─── DATASET ─────────────────────────────────── */
const PLACES = [
  { id:'P001', name:'Shangrila Resort & Lower Kachura Lake', district:'Skardu',   category:'Lake',                 tags:['nature','photography','family'],           activities:['boating','photography','picnic','sightseeing'],    season:'May-Oct', difficulty:'Easy',     altitude:2350, access:'Road',                  desc:'Famous lakeside resort area with a clear blue lake surrounded by orchards and mountains. Perfect for families and photographers alike.', rating:4.28, votes:105, emoji:'🏞️' },
  { id:'P002', name:'Upper Kachura Lake',                   district:'Skardu',   category:'Lake',                 tags:['nature','photography','camping'],          activities:['walking','photography','camping','boating'],       season:'May-Oct', difficulty:'Easy',     altitude:2500, access:'Road + short walk',      desc:'Quiet alpine lake above Lower Kachura with calm water and mountain views — a hidden gem above the famous resort.', rating:4.06, votes:112, emoji:'💙' },
  { id:'P003', name:'Satpara Lake',                         district:'Skardu',   category:'Lake',                 tags:['nature','family','photography'],           activities:['boating','sightseeing','photography'],            season:'Apr-Oct', difficulty:'Easy',     altitude:2636, access:'Road',                  desc:'Large lake near Skardu that supplies the city with water. A popular day trip with easy road access and stunning reflections.', rating:4.08, votes:113, emoji:'🌊' },
  { id:'P004', name:'Deosai National Park',                 district:'Skardu',   category:'National Park',        tags:['nature','adventure','camping','photography'],activities:['camping','wildlife','stargazing','jeep safari','photography'], season:'Jun-Sep', difficulty:'Moderate', altitude:4114, access:'Jeep track',             desc:'High-altitude plateau known for vibrant wildflowers, Himalayan brown bears, and vast open landscapes with unrivalled stargazing skies.', rating:4.54, votes:130, emoji:'🦅' },
  { id:'P005', name:'Sheosar Lake',                         district:'Skardu',   category:'Lake',                 tags:['nature','camping','photography'],          activities:['camping','photography','stargazing'],             season:'Jun-Sep', difficulty:'Moderate', altitude:4142, access:'Jeep track',             desc:'Large high-altitude lake inside Deosai plains with dramatic mountain reflections and strikingly blue water.', rating:4.45, votes:110, emoji:'🔵' },
  { id:'P006', name:'Kharpocho (Skardu) Fort',              district:'Skardu',   category:'Fort / Heritage',      tags:['culture','photography'],                  activities:['history','sightseeing','photography'],            season:'Apr-Oct', difficulty:'Moderate', altitude:2300, access:'Road + climb',           desc:'Historic fort above Skardu town with sweeping views of the city, Indus River, and the surrounding Karakoram peaks.', rating:3.43, votes:84, emoji:'🏰' },
  { id:'P007', name:'Sarfaranga Cold Desert',               district:'Skardu',   category:'Desert',               tags:['nature','photography','adventure'],         activities:['sand dunes','photography','jeep rides','sightseeing'], season:'Apr-Oct', difficulty:'Easy',     altitude:2226, access:'Road',                  desc:'High-altitude cold desert with golden sand dunes beside the Indus River — a surreal landscape unlike any other in Pakistan.', rating:3.93, votes:104, emoji:'🏜️' },
  { id:'P008', name:'Manthokha Waterfall',                  district:'Kharmang', category:'Waterfall',            tags:['nature','photography','family'],           activities:['sightseeing','photography','picnic'],             season:'May-Sep', difficulty:'Easy',     altitude:2300, access:'Road + short walk',      desc:'Popular waterfall in Kharmang area, with cool mists and verdant surroundings. Ideal for family picnics and photography.', rating:3.69, votes:99, emoji:'💦' },
  { id:'P009', name:'Basho Valley',                         district:'Skardu',   category:'Valley',               tags:['nature','adventure','camping','photography'],activities:['camping','hiking','photography'],               season:'Jun-Sep', difficulty:'Moderate', altitude:3000, access:'Jeep track',             desc:'Green valley with forests, streams and village life, used as a base for treks. A serene escape into alpine paradise.', rating:4.18, votes:114, emoji:'🌿' },
  { id:'P010', name:'Shigar Fort (Fong Khar)',              district:'Shigar',   category:'Fort / Heritage',      tags:['culture','photography','family'],          activities:['heritage stay','history','photography','sightseeing'], season:'Apr-Oct', difficulty:'Easy',     altitude:2300, access:'Road',                  desc:'Restored historic fort and palace turned into a luxury heritage hotel. One of the most beautiful heritage stays in the Karakoram.', rating:4.29, votes:112, emoji:'🏯' },
  { id:'P011', name:'Shigar Valley',                        district:'Shigar',   category:'Valley',               tags:['nature','culture','photography'],          activities:['sightseeing','photography','village visits'],      season:'Apr-Oct', difficulty:'Easy',     altitude:2300, access:'Road',                  desc:'Wide fertile valley on the road to Askole with orchards and spectacular mountain scenery. A cultural and natural delight.', rating:4.2,  votes:108, emoji:'🌸' },
  { id:'P012', name:'Khaplu Palace (Khaplu Fort)',          district:'Ghanche',  category:'Fort / Heritage',      tags:['culture','photography','family'],          activities:['heritage stay','history','photography','sightseeing'], season:'Apr-Oct', difficulty:'Easy',     altitude:2600, access:'Road',                  desc:'Restored palace of the Khaplu rulers, now a heritage hotel. Intricate traditional woodwork makes this a masterpiece of Balti architecture.', rating:4.47, votes:107, emoji:'👑' },
  { id:'P013', name:'Chaqchan Mosque',                      district:'Ghanche',  category:'Religious / Heritage', tags:['culture','photography'],                  activities:['history','architecture','photography'],           season:'Apr-Oct', difficulty:'Easy',     altitude:2600, access:'Road',                  desc:'One of the oldest mosques in the region with exquisite traditional wooden architecture, built in the 14th century.', rating:4.02, votes:84, emoji:'🕌' },
  { id:'P014', name:'Khaplu Valley',                        district:'Ghanche',  category:'Valley',               tags:['nature','culture','photography','family'], activities:['sightseeing','photography','village visits'],      season:'Apr-Oct', difficulty:'Easy',     altitude:2600, access:'Road',                  desc:'Green valley with orchards and old houses set against dramatic views of the Shyok River — fertile, lush, and culturally rich.', rating:4.37, votes:115, emoji:'🌄' },
  { id:'P015', name:'Hushe Valley',                         district:'Ghanche',  category:'Valley',               tags:['adventure','nature','photography','camping'],activities:['trekking','camping','photography'],             season:'Jun-Sep', difficulty:'Moderate', altitude:3050, access:'Road',                  desc:'Last village before Masherbrum trekking routes, with breathtaking views of giants like Masherbrum (K1) and K6.', rating:4.35, votes:123, emoji:'⛰️' },
  { id:'P016', name:'Masherbrum Base Camp Trek',            district:'Ghanche',  category:'Trekking / Mountain',  tags:['adventure','camping','photography'],       activities:['trekking','camping','mountaineering'],            season:'Jun-Sep', difficulty:'Hard',     altitude:4000, access:'Trek',                  desc:'A multi-day trek from Hushe towards the base of Masherbrum (K1). Dramatic glacier scenery and towering peaks reward the determined trekker.', rating:4.07, votes:113, emoji:'🧗' },
  { id:'P017', name:'K2 Base Camp / Baltoro Glacier Trek',  district:'Shigar',   category:'Trekking / Mountain',  tags:['adventure','camping','photography'],       activities:['trekking','camping','mountaineering','glacier walk'], season:'Jun-Aug', difficulty:'Hard',     altitude:4650, access:'Trek',                  desc:"The world's most iconic trek — from Askole through the mighty Baltoro Glacier to Concordia and K2. A life-changing journey for experienced trekkers.", rating:4.48, votes:101, emoji:'🏔️' },
  { id:'P018', name:'Askole Village',                       district:'Shigar',   category:'Village',              tags:['culture','adventure','camping'],           activities:['trekking start','village visits','camping'],       season:'Jun-Sep', difficulty:'Moderate', altitude:3050, access:'Jeep track',             desc:'Last permanent village on the Baltoro/Biafo trekking routes. A taste of authentic Balti village life at the edge of the wild.', rating:3.89, votes:109, emoji:'🏡' },
  { id:'P019', name:'Biafo Glacier Trek',                   district:'Shigar',   category:'Trekking / Glacier',   tags:['adventure','camping','photography'],       activities:['trekking','camping','glacier walk'],               season:'Jun-Aug', difficulty:'Hard',     altitude:4000, access:'Trek',                  desc:'Long glacier trek from Askole towards Snow Lake and the Hispar route. One of the most remote and beautiful wilderness treks in the world.', rating:4.13, votes:105, emoji:'🧊' },
  { id:'P020', name:'Chogo Lungma Glacier / Arandu Trek',   district:'Shigar',   category:'Trekking / Glacier',   tags:['adventure','camping','photography'],       activities:['trekking','camping','glacier walk'],               season:'Jun-Sep', difficulty:'Hard',     altitude:3200, access:'Trek',                  desc:'Remote glacier trek from Arandu village — fewer tourists than Baltoro, pristine wilderness, and remarkable glacier scenery.', rating:3.66, votes:93, emoji:'❄️' },
  { id:'P021', name:'Chutron Hot Springs',                  district:'Shigar',   category:'Hot Springs',          tags:['nature','family','culture'],               activities:['hot spring','sightseeing','relaxation'],          season:'Apr-Oct', difficulty:'Easy',     altitude:2300, access:'Road',                  desc:'Natural hot springs on the Shigar valley route — a relaxing dip amid mountain scenery, beloved by locals and visitors.', rating:3.61, votes:116, emoji:'♨️' },
  { id:'P022', name:'Buddha Rock (Manthal)',                 district:'Skardu',   category:'Buddhist Heritage',    tags:['culture','photography'],                  activities:['history','sightseeing','photography'],            season:'Apr-Oct', difficulty:'Easy',     altitude:2250, access:'Road + short walk',      desc:'Ancient rock carvings of Buddha and other figures dating back centuries — a sacred Silk Road heritage site near Skardu.', rating:3.47, votes:90, emoji:'☸️' },
  { id:'P023', name:'Skardu Main Bazaar',                   district:'Skardu',   category:'Market / Culture',     tags:['culture','family'],                       activities:['shopping','local food','sightseeing'],            season:'Apr-Oct', difficulty:'Easy',     altitude:2230, access:'Road',                  desc:'Main market for local food, dried apricots, walnuts, handicrafts, and trekking supplies. A vibrant window into Balti daily life.', rating:3.32, votes:78, emoji:'🛍️' },
  { id:'P024', name:'Rondu Valley',                         district:'Rondu',    category:'Valley',               tags:['nature','culture','photography'],          activities:['sightseeing','photography','village visits'],      season:'Apr-Oct', difficulty:'Easy',     altitude:2000, access:'Road',                  desc:'Narrow Indus valley section on the Skardu to Gilgit route with dramatic gorge views and traditional riverside villages.', rating:3.52, votes:103, emoji:'🌊' },
  { id:'P025', name:'Kharmang Valley',                      district:'Kharmang', category:'Valley',               tags:['nature','culture','photography'],          activities:['sightseeing','photography','village visits'],      season:'Apr-Oct', difficulty:'Moderate', altitude:2200, access:'Road',                  desc:'Remote Indus valley area with traditional villages along the river — an off-the-beaten-path destination for curious explorers.', rating:3.46, votes:103, emoji:'🏞️' },
  { id:'P026', name:'Shyok River Viewpoints',               district:'Ghanche',  category:'River / Viewpoint',    tags:['nature','photography'],                   activities:['photography','sightseeing','picnic'],             season:'Apr-Oct', difficulty:'Easy',     altitude:2600, access:'Road',                  desc:'River viewpoints and scenic riverside spots around the Khaplu area, with the mighty Shyok River flowing against a mountain backdrop.', rating:3.67, votes:87, emoji:'🌅' },
  { id:'P027', name:'Machulu Village',                      district:'Ghanche',  category:'Village',              tags:['culture','nature','photography'],          activities:['village visits','photography','homestay'],         season:'May-Oct', difficulty:'Easy',     altitude:2900, access:'Road',                  desc:'Traditional village area near Khaplu with authentic local culture, warm hospitality, and panoramic mountain scenery.', rating:3.63, votes:97, emoji:'🏘️' },
];

/* ─── IMAGE MAP (AI-generated or Unsplash) ─────── */
const PLACE_IMAGES = {
  'P004': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'P017': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80',
  'P010': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'P012': 'https://images.unsplash.com/photo-1548011241-edd73af3fc2c?w=800&q=80',
  'P001': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'P003': 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
  'P005': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
  'P009': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'P015': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'P002': 'https://images.unsplash.com/photo-1439853949212-36089657d4e4?w=800&q=80',
  'P019': 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
  'P011': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  'P014': 'https://images.unsplash.com/photo-1482784160316-6eb046863ece?w=800&q=80',
  'P007': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
  'P016': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'P008': 'https://images.unsplash.com/photo-1520962922320-2038eebab146?w=800&q=80',
  'P006': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
};

/* ─── PARTICLES ─────────────────────────────────── */
(function spawnParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      --dx:${(Math.random()-0.5)*200}px;
      animation-duration:${Math.random()*20+12}s;
      animation-delay:${Math.random()*15}s;
      opacity:${Math.random()*.7+.2};
    `;
    container.appendChild(p);
  }
})();

/* ─── NAV SCROLL EFFECT ─────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (window.scrollY > 60) {
    nav.style.borderBottomColor = 'rgba(255,255,255,0.1)';
  } else {
    nav.style.borderBottomColor = '';
  }
});

/* ─── CHIP TOGGLE ───────────────────────────────── */
function toggleChip(el) {
  el.classList.toggle('active');
}

/* ─── ALPHA SLIDER LABEL ────────────────────────── */
function updateAlphaLabel(val) {
  const v = parseFloat(val);
  let desc;
  if (v >= 0.8)      desc = 'content-heavy';
  else if (v >= 0.6) desc = 'content-leaning';
  else if (v >= 0.4) desc = 'balanced';
  else if (v >= 0.2) desc = 'rating-leaning';
  else               desc = 'rating-heavy';
  document.getElementById('alphaLabel').textContent = `α = ${v.toFixed(2)} (${desc})`;
  // Update range gradient
  const slider = document.getElementById('alphaSlider');
  const pct = (v * 100).toFixed(1);
  slider.style.background = `linear-gradient(to right,var(--clr-primary) 0%,var(--clr-primary) ${pct}%,rgba(255,255,255,0.15) ${pct}%)`;
}

/* ─── SCORING HELPERS ───────────────────────────── */

/**
 * Simple TF-IDF–inspired content similarity using term overlap.
 * Vectorises the query and each place's tag/category/difficulty corpus,
 * then returns cosine-like dot product (normalised to [0,1]).
 */
function contentScore(place, queryTerms) {
  if (!queryTerms.length) return 0.5; // neutral if no style selected
  const corpus = [
    ...place.tags,
    place.category.toLowerCase(),
    place.difficulty.toLowerCase(),
    place.district.toLowerCase(),
    ...place.activities.map(a => a.toLowerCase()),
  ];
  let matches = 0;
  for (const qt of queryTerms) {
    if (corpus.some(c => c.includes(qt) || qt.includes(c))) matches++;
  }
  return matches / queryTerms.length;
}

/**
 * Bayesian Weighted Rating (WR) — IMDb formula:
 * WR = (v / (v + m)) * R + (m / (v + m)) * C
 *  v = vote count, R = avg rating, m = threshold votes, C = mean rating overall
 */
function weightedRating(place) {
  const C = 4.0;   // global mean rating
  const m = 85;    // minimum votes threshold
  const v = place.votes;
  const R = place.rating;
  return (v / (v + m)) * R + (m / (v + m)) * C;
}

/** Normalise an array of numbers to [0,1] */
function normalise(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max === min) return arr.map(() => 0.5);
  return arr.map(x => (x - min) / (max - min));
}

/** Season filter — check if selected month overlaps the place's season range */
function seasonMatches(placeSeason, selectedMonth) {
  if (selectedMonth === 'any') return true;
  // placeSeason like "May-Oct" or "Apr-Oct"
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parts = placeSeason.split('-');
  if (parts.length !== 2) return true;
  const [sStart, sEnd] = parts;
  const si = months.indexOf(sStart);
  const ei = months.indexOf(sEnd);
  const qi = months.indexOf(selectedMonth);
  if (si === -1 || ei === -1 || qi === -1) return true;
  return qi >= si && qi <= ei;
}

/** Category loose match */
function categoryMatches(placeCategory, selectedCategory) {
  if (selectedCategory === 'any') return true;
  return placeCategory.toLowerCase().includes(selectedCategory.toLowerCase());
}

/* ─── STAR RENDERER ─────────────────────────────── */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  while (s.replace('½','*').length < 5) s += '☆';
  return s;
}

/* ─── DIFFICULTY CSS CLASS ──────────────────────── */
function diffClass(d) {
  return { Easy: 'easy', Moderate: 'moderate', Hard: 'hard' }[d] || '';
}

/* ─── BUILD RESULT CARD ─────────────────────────── */
function buildCard(place, rank, finalScore) {
  const imgSrc = PLACE_IMAGES[place.id];
  const imgTag = imgSrc
    ? `<img class="card-img" src="${imgSrc}" alt="${place.name}" loading="lazy" />`
    : `<div class="card-img-placeholder">${place.emoji}</div>`;

  const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
  const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const pct = (finalScore * 100).toFixed(0);

  return `
    <div class="result-card" onclick="openModal('${place.id}')" style="animation-delay:${(rank-1)*80}ms">
      <div class="card-rank ${rankClass}">${rankLabel}</div>
      ${imgTag}
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category">${place.emoji} ${place.category}</span>
          <span class="card-rating">
            <span class="stars">${renderStars(place.rating)}</span>
            ${place.rating.toFixed(1)}
          </span>
        </div>
        <div class="card-name">${place.name}</div>
        <div class="card-district">📍 ${place.district} · ${place.altitude.toLocaleString()} m asl</div>
        <div class="card-desc">${place.desc}</div>
        <div class="card-footer">
          <span class="card-pill ${diffClass(place.difficulty)}">⚡ ${place.difficulty}</span>
          <span class="card-pill">🛣 ${place.access}</span>
          <span class="card-pill">📅 ${place.season}</span>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar-label">
            <span>AI Match Score</span>
            <span>${pct}%</span>
          </div>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width:0%" data-target="${pct}%"></div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ─── ANIMATE SCORE BARS ────────────────────────── */
function animateScoreBars() {
  setTimeout(() => {
    document.querySelectorAll('.score-bar-fill').forEach(el => {
      el.style.width = el.dataset.target;
    });
  }, 150);
}

/* ─── MAIN RECOMMENDER ──────────────────────────── */
function runRecommender() {
  const btn = document.getElementById('recommendBtn');
  btn.style.opacity = '0.7';
  btn.querySelector('.btn-text span:last-child') // reset text
  btn.querySelector('.btn-text').innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/></svg>
    Analysing…`;

  setTimeout(() => {
    try {
      _doRecommend();
    } finally {
      btn.style.opacity = '1';
      btn.querySelector('.btn-text').innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Generate Recommendations`;
    }
  }, 700);
}

function _doRecommend() {
  /* Gather inputs */
  const selectedStyles = [...document.querySelectorAll('#travelStyleChips .chip.active')]
    .map(c => c.dataset.val.toLowerCase());
  const district = document.getElementById('districtSel').value;
  const season   = document.getElementById('seasonSel').value;
  const diff     = document.getElementById('diffSel').value;
  const cat      = document.getElementById('catSel').value;
  const alpha    = parseFloat(document.getElementById('alphaSlider').value);

  /* Hard filters */
  let pool = PLACES.filter(p => {
    if (district !== 'any' && !p.district.toLowerCase().includes(district.toLowerCase())) return false;
    if (diff !== 'any' && p.difficulty !== diff) return false;
    if (!seasonMatches(p.season, season)) return false;
    if (!categoryMatches(p.category, cat)) return false;
    return true;
  });

  if (pool.length === 0) {
    showNoResults(); return;
  }

  /* Compute raw scores */
  const rawContent = pool.map(p => contentScore(p, selectedStyles));
  const rawWR      = pool.map(p => weightedRating(p));

  /* Normalise */
  const normContent = normalise(rawContent);
  const normWR      = normalise(rawWR);

  /* Hybrid score */
  const scored = pool.map((p, i) => ({
    place: p,
    finalScore: alpha * normContent[i] + (1 - alpha) * normWR[i],
    contentPct: normContent[i],
    ratingPct:  normWR[i],
  }));

  /* Sort descending */
  scored.sort((a, b) => b.finalScore - a.finalScore);

  /* Top 5 */
  const top5 = scored.slice(0, 5);

  /* Render */
  const grid = document.getElementById('resultsGrid');
  grid.innerHTML = top5.map((s, i) => buildCard(s.place, i + 1, s.finalScore)).join('');

  const badge = document.getElementById('resultsBadge');
  badge.textContent = `${top5.length} of ${pool.length} destinations`;

  const title = document.getElementById('resultsTitle');
  const styleStr = selectedStyles.length ? selectedStyles.join(', ') : 'All Styles';
  title.textContent = `Top Picks for "${capitalise(styleStr)}"`;

  showResults();
  animateScoreBars();

  // Scroll
  setTimeout(() => {
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function capitalise(str) {
  return str.split(', ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
}

/* ─── SHOW / HIDE ───────────────────────────────── */
function showResults() {
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('noResults').classList.add('hidden');
  document.getElementById('prefForm').style.display = 'none';
}
function showNoResults() {
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('noResults').classList.remove('hidden');
  document.getElementById('prefForm').style.display = 'none';
}
function resetResults() {
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('noResults').classList.add('hidden');
  document.getElementById('prefForm').style.display = 'block';
  document.getElementById('prefForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── QUICK FILTER (from Districts) ────────────── */
function quickFilter(district) {
  document.getElementById('districtSel').value = district;
  // Reset chips
  document.querySelectorAll('#travelStyleChips .chip').forEach(c => c.classList.remove('active'));
  document.getElementById('seasonSel').value = 'any';
  document.getElementById('diffSel').value   = 'any';
  document.getElementById('catSel').value    = 'any';
  resetResults();
  runRecommender();
  document.getElementById('recommender').scrollIntoView({ behavior: 'smooth' });
}

/* ─── DETAIL MODAL ──────────────────────────────── */
function openModal(placeId) {
  const place = PLACES.find(p => p.id === placeId);
  if (!place) return;

  const imgSrc = PLACE_IMAGES[place.id];
  const imgTag = imgSrc
    ? `<img class="modal-img" src="${imgSrc}" alt="${place.name}" />`
    : `<div class="modal-img-placeholder">${place.emoji}</div>`;

  const tagsList = place.tags.map(t =>
    `<span class="modal-tag">${t}</span>`).join('');

  const activitiesList = place.activities.map(a =>
    `<span class="activity-chip">${a}</span>`).join('');

  const wr = weightedRating(place).toFixed(2);

  document.getElementById('modalBox').innerHTML = `
    ${imgTag}
    <div class="modal-body">
      <div class="modal-header">
        <div class="modal-name">${place.emoji} ${place.name}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-tags">
        <span class="modal-tag" style="background:rgba(59,158,255,0.1);border-color:rgba(59,158,255,0.3);color:var(--clr-primary)">${place.district}</span>
        <span class="modal-tag" style="background:rgba(255,179,71,0.1);border-color:rgba(255,179,71,0.3);color:var(--clr-accent)">${place.category}</span>
        ${tagsList}
      </div>
      <p class="modal-desc">${place.desc}</p>
      <div class="modal-grid">
        <div class="modal-info-card">
          <div class="modal-info-label">Best Season</div>
          <div class="modal-info-value">📅 ${place.season}</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">Difficulty</div>
          <div class="modal-info-value">⚡ ${place.difficulty}</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">Access</div>
          <div class="modal-info-value">🛣 ${place.access}</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">Altitude</div>
          <div class="modal-info-value">🗻 ${place.altitude.toLocaleString()} m asl</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">Avg Rating (${place.votes} reviews)</div>
          <div class="modal-info-value">⭐ ${place.rating} / 5.0</div>
        </div>
        <div class="modal-info-card">
          <div class="modal-info-label">Weighted Score (WR)</div>
          <div class="modal-info-value" style="color:var(--clr-primary)">🤖 ${wr}</div>
        </div>
      </div>
      <div class="modal-activities">
        <div class="modal-activities-label">Activities</div>
        <div class="activity-chips">${activitiesList}</div>
      </div>
    </div>`;

  document.getElementById('detailModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('detailModal')) return;
  document.getElementById('detailModal').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ─── CSS spin animation ─────────────────────────── */
const _spinStyle = document.createElement('style');
_spinStyle.textContent = `@keyframes spin{to{transform:rotate(360deg)}}`;
document.head.appendChild(_spinStyle);

/* ─── INIT ALPHA VISUAL ─────────────────────────── */
updateAlphaLabel(document.getElementById('alphaSlider').value);

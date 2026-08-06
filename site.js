// ── EqualSplit shared site JS ───────────────────────────
// Loaded on every page. Everything is guarded so features
// only activate when their elements exist on the page.

// ── STORE MODE ──────────────────────────────────────────
// Switch to "waitlist" when sold out or need build time
const STORE_MODE = "buy"; // "buy" or "waitlist"
const SQUARE_LINK = "https://square.link/u/JSqmHsi5";

// ── MODALS ──────────────────────────────────────────────
function openReserveModal(){document.getElementById('modal-reserve').classList.add('open')}
function openFinancialModal(){location.href='/apply/'}
function openQuestionModal(){document.getElementById('modal-question').classList.add('open')}
function openInternationalModal(){document.getElementById('modal-international').classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open')});
});

// ── CTA WIRING (product page + nav) ─────────────────────
const ctaBtn = document.getElementById('main-cta-btn');
const navCta = document.getElementById('nav-buy-btn');
if(STORE_MODE === "buy"){
  if(navCta) navCta.textContent = "Buy";
  if(ctaBtn){
    ctaBtn.textContent = "Buy Now \u00B7 $79.99";
    ctaBtn.onclick = function(e){ e.preventDefault(); window.open(SQUARE_LINK,'_blank'); };
  }
} else {
  if(navCta) navCta.textContent = "Reserve";
  if(ctaBtn){
    ctaBtn.textContent = "Reserve a Unit";
    ctaBtn.onclick = function(e){ e.preventDefault(); openReserveModal(); };
  }
}

// ── DEEP LINKS ──────────────────────────────────────────
// /product/#apply opens the free-unit form, /product/#international the shipping quote form
(function(){
  const h = location.hash;
  if(h === '#apply'){ location.replace('/apply/'); return; }
  if(h === '#international' && document.getElementById('modal-international')) openInternationalModal();
  if(h === '#reserve' && document.getElementById('modal-reserve')) openReserveModal();
})();

// Legacy hash URLs from the old single-page site → real pages
(function(){
  const map = {'#product':'/product/', '#about':'/about/', '#testimonials':'/testimonials/'};
  if(map[location.hash] && (location.pathname === '/' || location.pathname === '/index.html')){
    location.replace(map[location.hash]);
  }
})();

// ── GALLERY (product page) ──────────────────────────────
const galleryViews = {
  photo1:{label:'Photo 1',video:false},
  photo2:{label:'Photo 2',video:false},
  photo3:{label:'Photo 3',video:false},
  vid1:  {label:'Mode 1: 10m Fly',video:true},
  vid2:  {label:'Mode 1: 40-Yard Dash',video:true},
  vid3:  {label:'Mode 2: Demo',video:true}
};
function selThumb(btn,view){
  document.querySelectorAll('.p-thumb').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  const allMedia=document.querySelectorAll('.gallery-img,.gallery-video-wrap');
  let found=null;
  allMedia.forEach(m=>{
    m.classList.remove('active');
    const v=m.querySelector('video'); if(v)v.pause();
    if(m.dataset.view===view) found=m;
  });
  const ph=document.getElementById('gallery-ph');
  if(found){
    found.classList.add('active');
    if(ph)ph.classList.add('hidden');
    return;
  }
  if(ph){
    ph.classList.remove('hidden');
    const info=galleryViews[view]||{label:'',video:false};
    document.getElementById('gallery-ph-label').textContent=info.label+(info.video?' \u00B7 Video':'');
    const icon=document.getElementById('gallery-ph-icon');
    if(info.video){
      icon.innerHTML='<polygon points="5 3 19 12 5 21 5 3"/>';
      icon.setAttribute('fill','rgba(201,162,39,.4)');
      icon.setAttribute('stroke','none');
    } else {
      icon.innerHTML='<rect x="3" y="3" width="18" height="13" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>';
      icon.setAttribute('fill','none');
      icon.setAttribute('stroke','rgba(201,162,39,.5)');
    }
  }
}

// ── SCROLL REVEAL ───────────────────────────────────────
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  },{threshold:.15});
  els.forEach(e=>io.observe(e));
})();

// ── FORMSPREE SUCCESS HANDLING ──────────────────────────
function attachSuccess(formId, successId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const errDiv = form.parentElement.querySelector('[data-fs-error]');
    if (errDiv) errDiv.style.display = 'none';
    const data = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        form.style.display = 'none';
        document.getElementById(successId).style.display = 'block';
        return;
      }
      let msg = 'Something went wrong.';
      try {
        const j = await res.json();
        if (j.errors && j.errors.length) msg = j.errors.map(x => x.message).join(' ');
        else if (j.error) msg = j.error;
      } catch (_) {}
      if (errDiv) {
        errDiv.textContent = msg + ' You can also email us at contact@equalsplit.org';
        errDiv.style.display = 'block';
      } else {
        alert(msg + ' Please email us at contact@equalsplit.org');
      }
    } catch (networkErr) {
      if (errDiv) {
        errDiv.textContent = 'Network error — please check your connection or email us at contact@equalsplit.org';
        errDiv.style.display = 'block';
      } else {
        alert('Network error. Please email us at contact@equalsplit.org');
      }
    }
  });
}
attachSuccess('form-reserve', 'reserve-success');
attachSuccess('form-financial', 'financial-success');
attachSuccess('form-question', 'question-success');
attachSuccess('form-international', 'international-success');

// ── MOBILE NAV ──────────────────────────────────────────
// Builds the hamburger and adds .js-nav so the collapse CSS
// only applies when JS ran. Without JS the nav stays fully visible.
(function(){
  const nav = document.querySelector('nav');
  if(!nav || nav.querySelector('.nav-toggle')) return;
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label','Open menu');
  btn.setAttribute('aria-expanded','false');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  btn.addEventListener('click', function(){
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.appendChild(btn);
  nav.classList.add('js-nav');
  // close the menu after tapping a link
  nav.querySelectorAll('.nav-links a').forEach(function(a){
    a.addEventListener('click', function(){ nav.classList.remove('open'); });
  });
})();

// ── HERO VIDEO: desktop only, poster carries mobile ─────
(function(){
  const v = document.getElementById('hero-video');
  if(!v) return;
  if(window.matchMedia('(min-width:821px)').matches &&
     !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    v.src = '/videos/equalsplit-home.mp4';
    v.autoplay = true;
    const go = v.play();
    if(go && go.catch) go.catch(function(){});
  }
})();

// ===== Musik: pakai lagu.mp3 jika ada, jika tidak pakai melodi bawaan =====
const lagu = document.getElementById('lagu');
const tombol = document.getElementById('musik');
const label = document.getElementById('musikLabel');
let main = false, sudahCoba = false, ctx, timer;

// Melodi manis sederhana (frekuensi nada, durasi dalam ketukan)
const C=261.6,D=293.7,E=329.6,F=349.2,G=392,A=440,C5=523.3,R=0;
const melodi = [[E,1],[G,1],[C5,2],[A,1],[G,1],[E,2],[D,1],[E,1],[G,1],[E,1],[C,3],[R,1],
                [F,1],[A,1],[C5,2],[A,1],[G,1],[E,2],[D,1],[F,1],[E,1],[D,1],[C,3],[R,1]];

function mainkanBawaan(){
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  const ketukan = 0.38; let i = 0;
  const langkah = () => {
    const [f, k] = melodi[i % melodi.length]; i++;
    if (f){
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + k * ketukan);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + k * ketukan);
    }
    timer = setTimeout(langkah, k * ketukan * 1000);
  };
  langkah();
}

async function putar(){
  try { await lagu.play(); }
  catch { mainkanBawaan(); }
  main = true; perbarui();
}
function henti(){
  lagu.pause(); clearTimeout(timer); if (ctx) ctx.suspend();
  main = false; perbarui();
}
function perbarui(){
  tombol.classList.toggle('main', main);
  tombol.setAttribute('aria-pressed', main);
  label.textContent = main ? 'jeda lagu' : 'putar lagu';
}
tombol.addEventListener('click', () => main ? henti() : putar());

// ===== Avatar: klik untuk melompat + hujan bintang =====
const avatar = document.getElementById('avatar');
avatar.addEventListener('click', e => {
  avatar.classList.remove('lompat'); void avatar.offsetWidth; avatar.classList.add('lompat');
  ['✨','💖','⭐','🌸'].forEach((s, i) => {
    const el = document.createElement('span');
    el.className = 'bintang'; el.textContent = s;
    el.style.left = (e.clientX + (i - 1.5) * 24) + 'px'; el.style.top = e.clientY + 'px';
    document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
  });
});

// ===== Lagu kita: pilih file dari perangkat sendiri =====
const pilih = document.getElementById('pilihLagu');
document.getElementById('gantiLagu').addEventListener('click', () => pilih.click());
pilih.addEventListener('change', () => {
  const f = pilih.files[0]; if (!f) return;
  clearTimeout(timer); if (ctx) ctx.suspend();
  lagu.src = URL.createObjectURL(f);
  sudahCoba = true; putar();
  label.textContent = 'jeda lagu';
});

// ===== Gravitasi: partikel hati =====
const cv = document.getElementById('hati'), g2 = cv.getContext('2d');
const kurangGerak = matchMedia('(prefers-reduced-motion: reduce)').matches;
const petunjuk = document.getElementById('petunjuk');
let W, H, parts = [], jatuh = false, mouse = { x: -999, y: -999 }, tampil = true;

function titikHati(n, skala, cx, cy){
  const out = [];
  for (let i = 0; i < n; i++){
    const t = (i / n) * Math.PI * 2, r = i % 3 ? 1 : Math.random() * .85;   // sebagian isi di dalam
    out.push([cx + r * skala * 16 * Math.sin(t) ** 3,
              cy - r * skala * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))]);
  }
  return out;
}
function siapkan(){
  const d = devicePixelRatio || 1, r = cv.getBoundingClientRect();
  W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; g2.setTransform(d, 0, 0, d, 0, 0);
  const tg = titikHati(380, Math.min(W / 40, H / 36), W / 2, H / 2 - 4);
  parts = tg.map(([tx, ty], i) => ({
    x: parts[i] ? parts[i].x : Math.random() * W, y: parts[i] ? parts[i].y : Math.random() * H,
    vx: 0, vy: 0, tx, ty, s: 1.6 + Math.random() * 2.2, w: ['#e0457b','#ff8fab','#ffb3c7','#6b3a4f'][i % 4]
  }));
}
function langkah(){
  g2.clearRect(0, 0, W, H);
  for (const p of parts){
    if (jatuh){
      p.vy += .35; p.x += p.vx; p.y += p.vy;
      if (p.y > H - p.s){ p.y = H - p.s; p.vy *= -.55; p.vx *= .9; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
    } else {
      p.vx += (p.tx - p.x) * .03; p.vy += (p.ty - p.y) * .03;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 3600){ const f = (60 - Math.sqrt(d2)) * .06; const m = Math.sqrt(d2) || 1; p.vx += dx / m * f; p.vy += dy / m * f; }
      p.vx *= .85; p.vy *= .85; p.x += p.vx; p.y += p.vy;
    }
    g2.fillStyle = p.w; g2.beginPath(); g2.arc(p.x, p.y, p.s, 0, 7); g2.fill();
  }
}
function loop(){ if (tampil) langkah(); requestAnimationFrame(loop); }

function ubah(){
  jatuh = !jatuh;
  if (jatuh) parts.forEach(p => { p.vx = (Math.random() - .5) * 6; p.vy = -Math.random() * 6; });
  petunjuk.textContent = jatuh ? 'Klik lagi untuk menyusun kembali.' : 'Gerakkan kursor untuk mengusik. Klik untuk melepas gravitasi.';
}
cv.addEventListener('click', ubah);
cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
cv.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
new IntersectionObserver(([e]) => tampil = e.isIntersecting).observe(cv);
addEventListener('resize', siapkan);
siapkan();
if (kurangGerak){ parts.forEach(p => { p.x = p.tx; p.y = p.ty; }); langkah(); petunjuk.textContent = ''; } else loop();

// ===== Penghitung hari (tersimpan di browser) =====
const tgl = document.getElementById('tanggal'), hitung = document.getElementById('hitung');
function tampilHari(){
  if (!tgl.value){ hitung.textContent = ''; return; }
  const selisih = Math.floor((new Date().setHours(0,0,0,0) - new Date(tgl.value + 'T00:00:00')) / 864e5);
  hitung.textContent = selisih >= 0 ? `${selisih} hari` : `${-selisih} hari lagi`;
}
try { tgl.value = localStorage.getItem('hariKita') || ''; } catch {}
tgl.addEventListener('change', () => { try { localStorage.setItem('hariKita', tgl.value); } catch {} tampilHari(); });
tampilHari();

// ===== Galeri foto & video =====
const galeri = document.getElementById('galeri'), kotak = document.getElementById('lightbox');
const besar = document.getElementById('besar'), besarVideo = document.getElementById('besarVideo');
let musikSebelumVideo = false;

function pantau(fig){
  const m = fig.querySelector('img,video');
  const gagal = () => fig.classList.add('kosong');
  m.addEventListener('error', gagal);
  if (m.tagName === 'IMG' && m.complete && !m.naturalWidth) gagal();
}
galeri.querySelectorAll('.foto').forEach(pantau);

galeri.addEventListener('click', e => {
  const fig = e.target.closest('.foto'); if (!fig || fig.classList.contains('kosong')) return;
  const m = fig.querySelector('img,video'), video = m.tagName === 'VIDEO';
  besar.hidden = video; besarVideo.hidden = !video;
  if (video){
    musikSebelumVideo = main; if (main) henti();   // jeda musik latar saat video diputar
    besarVideo.src = m.currentSrc || m.src; besarVideo.play().catch(() => {});
  } else besar.src = m.src;
  kotak.showModal();
});
function tutup(){ kotak.close(); }
kotak.addEventListener('click', e => { if (e.target === kotak) tutup(); });
document.getElementById('tutupBesar').addEventListener('click', tutup);
kotak.addEventListener('close', () => {
  besarVideo.pause(); besarVideo.removeAttribute('src'); besarVideo.load();
  if (musikSebelumVideo){ musikSebelumVideo = false; putar(); }
});

// Tambah foto/video dari perangkat (sementara, hilang saat halaman ditutup)
const inputFoto = document.getElementById('inputFoto');
document.getElementById('tambahFoto').addEventListener('click', () => inputFoto.click());
inputFoto.addEventListener('change', () => {
  [...inputFoto.files].forEach(f => {
    const video = f.type.startsWith('video/'), url = URL.createObjectURL(f);
    const slot = [...galeri.querySelectorAll('.foto.kosong')].find(x => !!x.querySelector('video') === video);
    if (slot){ slot.querySelector('img,video').src = url; slot.classList.remove('kosong'); return; }
    const fig = document.createElement('figure'); fig.className = 'foto' + (video ? ' vid' : '');
    fig.innerHTML = video ? '<video preload="metadata" muted playsinline></video>' : '<img alt="Foto Djenar">';
    fig.firstChild.src = url; galeri.appendChild(fig); pantau(fig);
  });
  inputFoto.value = '';
});

// ===== Progres gulir & menu aktif =====
const progres = document.getElementById('progres');
addEventListener('scroll', () => { const h = document.documentElement; progres.style.transform = `scaleX(${scrollY / (h.scrollHeight - innerHeight || 1)})`; }, { passive: true });
const tautan = [...document.querySelectorAll('.menu a')];
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tautan.forEach(a => a.classList.toggle('aktif', a.hash === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section').forEach(s => io.observe(s));
new IntersectionObserver(([e], o) => { if (e.isIntersecting){ e.target.classList.add('isi'); o.disconnect(); } }, { threshold: .4 }).observe(document.querySelector('.chips'));

// ===== Mode malam (tersimpan) =====
const tema = document.getElementById('tema');
function setTema(m){ document.body.classList.toggle('malam', m); tema.setAttribute('aria-pressed', m); tema.textContent = m ? 'Mode siang' : 'Mode malam'; }
try { setTema(localStorage.getItem('tema') === 'malam'); } catch { setTema(false); }
tema.addEventListener('click', () => { const m = !document.body.classList.contains('malam'); setTema(m); try { localStorage.setItem('tema', m ? 'malam' : 'siang'); } catch {} });

// ===== Denah interaktif =====
const info = document.getElementById('infoRuang'), ruang = document.querySelectorAll('.ruang');
ruang.forEach(r => {
  const pilihR = () => { ruang.forEach(x => x.classList.toggle('aktif', x === r)); info.textContent = r.dataset.n + ': ' + r.dataset.t; };
  r.addEventListener('click', pilihR); r.addEventListener('mouseenter', pilihR);
  r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pilihR(); } });
});

// ===== Grafiti kata ala coder =====
const tembok = document.getElementById('tembok'), kataBaru = document.getElementById('kataBaru');
const bahan = ['halo dunia', 'ngopi dulu', 'bug itu fitur', 'sketsa', 'pastel', 'arsitek', 'ctrl+z', 'pulang', 'deadline', 'maket', 'rumah', 'semangat'];
const bentuk = [w => '// ' + w, w => '<' + w + '/>', w => '{ ' + w + ' }', w => '#' + w, w => w + '();', w => '"' + w + '"', w => '$ ' + w, w => '/* ' + w + ' */'];
const warna = ['#ff5d8f', '#7cffcb', '#ffd166', '#c9b6ff', '#6be3ff', '#ffb3c7'];
const acak = (a, b) => a + Math.random() * (b - a), pilihAcak = arr => arr[Math.floor(Math.random() * arr.length)];
let dinding = [];

function gambar(k){
  const el = document.createElement('span'); el.className = 'kata-g'; el.textContent = k.t;
  el.style.setProperty('--x', k.x + '%'); el.style.setProperty('--y', k.y + '%');
  el.style.setProperty('--r', k.r + 'deg'); el.style.setProperty('--s', k.s + 'rem'); el.style.setProperty('--c', k.c);
  tembok.appendChild(el);
}
function simpanG(){ try { localStorage.setItem('grafiti', JSON.stringify(dinding)); } catch {} }
function semprot(teks, x, y){
  const k = { t: pilihAcak(bentuk)(teks), x: Math.min(80, Math.max(20, x)), y: Math.min(90, Math.max(14, y)),
              r: Math.round(acak(-14, 14)), s: +acak(.95, 1.6).toFixed(2), c: pilihAcak(warna) };
  dinding.push(k); gambar(k);
  if (dinding.length > 60){ dinding.shift(); tembok.firstElementChild.remove(); }
  simpanG();
}
function muatG(){
  let tersimpan = null;
  try { tersimpan = JSON.parse(localStorage.getItem('grafiti')); } catch {}
  if (Array.isArray(tersimpan)){
    tersimpan.filter(k => k && typeof k.t === 'string' && warna.includes(k.c)).slice(-60).forEach(k => {
      const b = { t: k.t.slice(0, 60), x: +k.x || 50, y: +k.y || 50, r: +k.r || 0, s: +k.s || 1.2, c: k.c };
      dinding.push(b); gambar(b);
    });
  } else {
    [...bahan].sort(() => Math.random() - .5).slice(0, 8).forEach(w => semprot(w, acak(20, 80), acak(14, 90)));
  }
}
muatG();

tembok.addEventListener('click', e => {
  const r = tembok.getBoundingClientRect();
  semprot(kataBaru.value.trim() || pilihAcak(bahan), (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
  kataBaru.value = '';
});
function semprotAcak(){ semprot(kataBaru.value.trim() || pilihAcak(bahan), acak(20, 80), acak(14, 90)); kataBaru.value = ''; }
document.getElementById('semprot').addEventListener('click', semprotAcak);
kataBaru.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); semprotAcak(); } });
document.getElementById('bersih').addEventListener('click', () => { dinding = []; tembok.replaceChildren(); simpanG(); });

// ===== Putar otomatis saat web dibuka =====
// Browser sering memblokir suara otomatis. Jika diblokir, lagu mulai pada sentuhan/klik/tombol pertama di mana saja.
const pemicu = ['pointerdown', 'mousedown', 'touchend', 'click', 'keydown'];
async function autoPutar(){
  try { await lagu.play(); main = true; perbarui(); return true; } catch { return false; }
}
function lepasPemicu(){ pemicu.forEach(ev => removeEventListener(ev, mulaiAuto, true)); }
async function mulaiAuto(e){
  if (main){ lepasPemicu(); return; }
  if (e.target.closest && e.target.closest('.panel-musik')){ lepasPemicu(); return; }   // biarkan tombol musik bekerja sendiri
  if (await autoPutar()) lepasPemicu();
}
autoPutar().then(ok => {
  if (ok) return;
  label.textContent = 'ketuk untuk putar';
  pemicu.forEach(ev => addEventListener(ev, mulaiAuto, true));
});
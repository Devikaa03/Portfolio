/* ---- Circuit background ---- */
const canvas = document.getElementById('circuit');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let W, H, traces = [], pulses = [];
const GRID = 48;
const DIRS = [[1,0],[0,1],[1,1],[-1,1],[1,-1]];

function buildCircuit() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  traces = [];
  for (let i = 0; i < 34; i++) {
    let x = Math.round(Math.random() * W / GRID) * GRID;
    let y = Math.round(Math.random() * H / GRID) * GRID;
    const pts = [[x, y]], lens = [0];
    let total = 0;
    const segs = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segs; s++) {
      const d = DIRS[Math.floor(Math.random() * DIRS.length)];
      const n = 1 + Math.floor(Math.random() * 4);
      const nx = x + d[0] * n * GRID, ny = y + d[1] * n * GRID;
      total += Math.hypot(nx - x, ny - y);
      x = nx; y = ny;
      pts.push([x, y]);
      lens.push(total);
    }
    traces.push({ pts, lens, total });
  }
}

function pointAt(t, dist) {
  let i = 1;
  while (i < t.lens.length - 1 && t.lens[i] < dist) i++;
  const a = t.pts[i - 1], b = t.pts[i];
  const k = (dist - t.lens[i - 1]) / (t.lens[i] - t.lens[i - 1] || 1);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

function drawCircuit() {
  ctx.clearRect(0, 0, W, H);
  const color = '#ffd8a8';

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 2;
  traces.forEach(t => {
    ctx.beginPath();
    t.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.stroke();
    [t.pts[0], t.pts[t.pts.length - 1]].forEach(p => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.stroke();
    });
  });

  ctx.fillStyle = color;
  pulses = pulses.filter(p => p.d < p.t.total);
  pulses.forEach(p => {
    p.d += 3;
    for (let k = 0; k < 10; k++) {
      const q = pointAt(p.t, Math.max(0, p.d - k * 7));
      ctx.globalAlpha = 0.9 - k * 0.09;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 4 - k * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;

  if (!reduceMotion) requestAnimationFrame(drawCircuit);
}

function sendPulse(n = 1) {
  for (let i = 0; i < n; i++) {
    pulses.push({ t: traces[Math.floor(Math.random() * traces.length)], d: 0 });
  }
  if (reduceMotion) drawCircuit();
}

buildCircuit();
drawCircuit();
window.addEventListener('resize', () => { buildCircuit(); if (reduceMotion) drawCircuit(); });
if (!reduceMotion) setInterval(() => sendPulse(), 1400);

/* ---- Pop-up panels ---- */
const panels = document.querySelectorAll('.panel');

function openPanel(id) {
  panels.forEach(p => p.classList.toggle('open', p.id === id));
  document.body.style.overflow = id ? 'hidden' : '';
  if (id) sendPulse(6);
}

document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', () => openPanel(btn.dataset.open));
});
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => openPanel(''));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') openPanel('');
});

/* ---- Projects: list and details ---- */
const projList = document.querySelector('.proj-list');
const projDetail = document.querySelector('.proj-detail');
const projItems = projDetail.querySelectorAll('article');

function showProject(id) {
  projList.hidden = true;
  projDetail.hidden = false;
  projItems.forEach(a => a.hidden = a.dataset.id !== id);
  document.getElementById('projects').scrollTop = 0;
}

function showProjectList() {
  projDetail.hidden = true;
  projList.hidden = false;
}

document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('click', () => showProject(card.dataset.p));
});
projDetail.querySelector('.back').addEventListener('click', showProjectList);
document.querySelector('[data-open="projects"]').addEventListener('click', showProjectList);
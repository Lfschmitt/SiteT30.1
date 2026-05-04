
const MATERIAS = [
  { id: 'CES-10', limite: 15 },
  { id: 'FND-01', limite: 5  },
  { id: 'HUM-01', limite: 8  },
  { id: 'MAT-13', limite: 10 },
  { id: 'MAT-15', limite: 5  },
  { id: 'MAT-17', limite: 5  },
  { id: 'MTP-03', limite: 5  },
  { id: 'QUI-18', limite: 12 },
];

function load() {
  const s = {};
  MATERIAS.forEach(m => {
    const v = localStorage.getItem('falta_' + m.id);
    s[m.id] = v !== null ? parseInt(v) : 0;
  });
  return s;
}
function save() {
  MATERIAS.forEach(m => localStorage.setItem('falta_' + m.id, state[m.id]));
}

let state = load();

function risk(f, lim) {
  const r = f / lim;
  return r <= 0.5 ? 'low' : r <= 0.8 ? 'mid' : 'high';
}
const riskLabel = { low: 'OK', mid: 'Atenção', high: 'Crítico' };
const barColor  = { low: '#22c55e', mid: '#f59e0b', high: '#ef4444' };

function renderGrid() {
  document.getElementById('grid').innerHTML = MATERIAS.map(m => `
    <div class="card" id="card-${m.id}">
      <div class="card-top">
        <span class="materia-nome">${m.id}</span>
        <span class="badge" id="badge-${m.id}"></span>
      </div>
      <div class="info-row">
        <div class="info-item">% das aulas<span id="pct-${m.id}"></span></div>
        <div class="info-item" style="text-align:right">
          Limite: ${m.limite}<span id="rest-${m.id}"></span>
        </div>
      </div>
      <div class="bar-bg"><div class="bar-fill" id="bar-${m.id}"></div></div>
      <div class="controls">
        <button class="btn btn-minus" id="minus-${m.id}" onclick="change('${m.id}',-1)">−</button>
        <span class="count" id="count-${m.id}">0</span>
        <button class="btn btn-plus"  id="plus-${m.id}"  onclick="change('${m.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
  MATERIAS.forEach(m => updateCard(m));
}

function updateCard(m) {
  const f   = state[m.id];
  const pct = Math.min(f / m.limite, 1);
  const r   = risk(f, m.limite);
  const porcentagem = (pct * 25).toFixed(1);
  const restantes   = Math.max(m.limite - f, 0);

  document.getElementById('card-'  + m.id).className = 'card risk-' + r;
  document.getElementById('badge-' + m.id).className = 'badge badge-' + r;
  document.getElementById('badge-' + m.id).textContent = riskLabel[r];
  document.getElementById('bar-'   + m.id).style.width      = (pct * 100).toFixed(1) + '%';
  document.getElementById('bar-'   + m.id).style.background = barColor[r];
  document.getElementById('count-' + m.id).textContent = f;
  document.getElementById('pct-'   + m.id).textContent = porcentagem + '% das aulas';
  document.getElementById('rest-'  + m.id).textContent = restantes + ' restantes';
  document.getElementById('minus-' + m.id).disabled = f <= 0;
  document.getElementById('plus-'  + m.id).disabled = f >= m.limite;
}

function updateSummary() {
  const total    = MATERIAS.reduce((a, m) => a + state[m.id], 0);
  const criticas = MATERIAS.filter(m => risk(state[m.id], m.limite) === 'high').length;
  const atencao  = MATERIAS.filter(m => risk(state[m.id], m.limite) === 'mid').length;
  const ok       = MATERIAS.length - criticas - atencao;

  document.getElementById('summary').innerHTML = `
    <div class="stat">
      <div class="stat-label">Total de faltas</div>
      <div class="stat-value navy">${total}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Matérias OK</div>
      <div class="stat-value ok">${ok}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Em atenção</div>
      <div class="stat-value warn">${atencao}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Em risco crítico</div>
      <div class="stat-value bad">${criticas}</div>
    </div>
  `;
}

function change(id, delta) {
  const m = MATERIAS.find(x => x.id === id);
  state[id] = Math.max(0, Math.min(m.limite, state[id] + delta));
  save();
  updateCard(m);
  updateSummary();
}

function resetAll() {
  if (!confirm('Zerar todas as faltas?')) return;
  MATERIAS.forEach(m => { state[m.id] = 0; localStorage.removeItem('falta_' + m.id); });
  MATERIAS.forEach(m => updateCard(m));
  updateSummary();
}

renderGrid();
updateSummary();

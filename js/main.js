/* ===== NAVBAR ===== */
const NAV_HTML = `
<nav class="navbar">
  <div class="nav-container">
    <a href="index.html" class="nav-brand">T30<span>.1</span></a>
    <ul class="nav-links" id="navLinks">
      <li><a href="index.html">Sobre a Turma</a></li>
      <li><a href="calendario.html">Calendário</a></li>
      <li><a href="Avisos.html">Avisos</a></li>
      <li><a href="mapa-falta.html">Mapa de Faltas</a></li>
      <li><a href="noticias.html">Notícias</a></li>
      <li><a href="professores.html">Professores</a></li>
      <li><a href="reclame-aqui.html">Reclame Aqui</a></li>
    </ul>
    <div class="nav-toggle" id="navToggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </div>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer>
  <p><strong>T30.1</strong> &mdash; Instituto Tecnológico de Aeronáutica &mdash; &copy; ${new Date().getFullYear()}</p>
</footer>`;

function injectNav() {
  const placeholder = document.getElementById('navbar');
  if (placeholder) placeholder.outerHTML = NAV_HTML;

  const footerPlaceholder = document.getElementById('footer');
  if (footerPlaceholder) footerPlaceholder.outerHTML = FOOTER_HTML;

  // Hamburger toggle
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle?.addEventListener('click', () => links?.classList.toggle('open'));

  // Mark active link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', injectNav);

/* ===== CALENDAR ===== */
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const EVENTS = {};

let calYear, calMonth;

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1NMdFBmpz2OqX3W7hoez1B3pilpkEdOXnpfHiI2phLjI/gviz/tq?tqx=out:csv&sheet=entregaveis';

function initCalendar() {
  const wrapper = document.getElementById('calendar');
  if (!wrapper) return;

  const today = new Date();
  calYear = today.getFullYear();
  calMonth = today.getMonth();

  wrapper.innerHTML = `
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="cal-nav-btn" id="calPrev">&#8249;</button>
        <h2 id="calTitle"></h2>
        <button class="cal-nav-btn" id="calNext">&#8250;</button>
      </div>
      <div class="calendar-weekdays">
        ${WEEKDAYS_PT.map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="calendar-grid" id="calGrid"></div>
    </div>`;

  document.getElementById('calPrev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  renderCalendar();
  
  carregarEventosDaPlanilha();
}

async function carregarEventosDaPlanilha() {
  try {
    const finalURL = SHEET_URL + '&t=' + new Date().getTime();
    const resposta = await fetch(finalURL);
    
    if (!resposta.ok) throw new Error('Falha no fetch direto');
    
    const dadosTexto = await resposta.text();
    Papa.parse(dadosTexto, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) { processarCSVparaCalendario(results.data); }
    });

  } catch (error) {
    console.log("Erro no fetch direto, tentando proxy (igual na página de avisos)...");
    const fallbackURL = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(SHEET_URL)}`;
    
    fetch(fallbackURL)
      .then(res => res.text())
      .then(texto => {
        Papa.parse(texto, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) { processarCSVparaCalendario(results.data); }
        });
      })
      .catch(err => console.error("Falha total ao carregar eventos no calendário.", err));
  }
}

function processarCSVparaCalendario(dados) {
  dados.forEach(evento => {
    const dataStr = evento['Data']?.trim(); 
    const materia = evento['Materia']?.trim() || 'Evento';
    const tipo = evento['Tipo']?.trim() || '';

    if (dataStr) {
      const partesData = dataStr.split('/');
      
      if (partesData.length >= 2) {
        const dia = parseInt(partesData[0], 10);
        const mes = parseInt(partesData[1], 10) - 1; 
        
        const ano = partesData.length === 3 ? parseInt(partesData[2], 10) : new Date().getFullYear();
        
        const chaveData = `${ano}-${mes}-${dia}`;
        const labelEvento = `${materia} ${tipo ? `(${tipo})` : ''}`;

        if (EVENTS[chaveData]) {
          EVENTS[chaveData] += ` | ${labelEvento}`;
        } else {
          EVENTS[chaveData] = labelEvento;
        }
      }
    }
  });

  renderCalendar();
}

function renderCalendar() {
  const title = document.getElementById('calTitle');
  const grid = document.getElementById('calGrid');
  if (!title || !grid) return;

  title.textContent = `${MONTHS_PT[calMonth]} ${calYear}`;

  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();

  let cells = '';

  for (let i = firstDay - 1; i >= 0; i--) {
    cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      calMonth === today.getMonth() &&
      calYear === today.getFullYear();
      
    const key = `${calYear}-${calMonth}-${d}`;
    const hasEvent = !!EVENTS[key];
    
    const classes = ['cal-day', isToday && 'today', hasEvent && 'has-event']
      .filter(Boolean).join(' ');
      
    cells += `<div class="${classes}" title="${hasEvent ? EVENTS[key] : ''}">${d}</div>`;
  }

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  for (let d = 1; d <= totalCells - firstDay - daysInMonth; d++) {
    cells += `<div class="cal-day other-month">${d}</div>`;
  }

  grid.innerHTML = cells;
}

document.addEventListener('DOMContentLoaded', initCalendar);


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

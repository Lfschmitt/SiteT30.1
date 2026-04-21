/* ===== NAVBAR ===== */
const NAV_HTML = `
<nav class="navbar">
  <div class="nav-container">
    <a href="index.html" class="nav-brand">T30<span>.1</span></a>
    <ul class="nav-links" id="navLinks">
      <li><a href="index.html">Sobre a Turma</a></li>
      <li><a href="calendario.html">Calendário</a></li>
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

// Placeholder events: { 'YYYY-M-D': 'label' }
const EVENTS = {};

let calYear, calMonth;

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

  // Trailing days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
  }

  // Current month days
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

  // Leading days for next month
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  for (let d = 1; d <= totalCells - firstDay - daysInMonth; d++) {
    cells += `<div class="cal-day other-month">${d}</div>`;
  }

  grid.innerHTML = cells;
}

document.addEventListener('DOMContentLoaded', initCalendar);

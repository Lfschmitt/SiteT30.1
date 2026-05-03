const SHEET_ID = '1AbGXKekO0YtUPDOxTi80yn8isZbS2n_4ANAwZujzAKs';

function sheetUrl(aba) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(aba)}`;
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVRow(line);
    return headers.reduce((obj, h, i) => {
      obj[h.trim().toLowerCase()] = (values[i] || '').trim();
      return obj;
    }, {});
  }).filter(row => row.titulo);
}

function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  return null;
}

function formatDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function renderNoticias(noticias) {
  const container = document.getElementById('noticias-container');
  if (!noticias.length) {
    container.innerHTML = '<div class="noticias-empty">Nenhuma notícia disponível no momento.</div>';
    return;
  }

  const sorted = [...noticias].sort((a, b) => {
    const da = parseDate(a.data), db = parseDate(b.data);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db - da;
  }).slice(0, 4);

  container.innerHTML = sorted.map(n => `
    <article class="noticia-card">
      <div class="noticia-card-header">
        <span class="noticia-categoria">${n.categoria || 'Geral'}</span>
      </div>
      <div class="noticia-card-body">
        <p class="noticia-data">${formatDate(n.data)}</p>
        <h3>${n.titulo}</h3>
        <p class="noticia-resumo">${n.resumo || ''}</p>
      </div>
    </article>`).join('');
}

function renderAvisos(avisos) {
  const container = document.getElementById('avisos-container');
  if (!avisos.length) {
    container.innerHTML = '<div class="noticias-empty">Nenhum aviso no momento.</div>';
    return;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const ativos = avisos.filter(a => {
    const d = parseDate(a.data);
    if (!d) return false;
    d.setHours(0, 0, 0, 0);
    return d >= hoje;
  }).sort((a, b) => parseDate(a.data) - parseDate(b.data));

  if (!ativos.length) {
    container.innerHTML = '<div class="noticias-empty">Nenhum aviso no momento.</div>';
    return;
  }

  container.innerHTML = ativos.map(a => `
    <div class="aviso-card">
      <p class="aviso-data">${formatDate(a.data)}</p>
      <h3 class="aviso-titulo">${a.titulo}</h3>
      ${a.descricao ? `<p class="aviso-descricao">${a.descricao}</p>` : ''}
    </div>`).join('');
}

async function loadAll() {
  const [resN, resA] = await Promise.allSettled([
    fetch(sheetUrl('noticias')),
    fetch(sheetUrl('avisos'))
  ]);

  if (resN.status === 'fulfilled' && resN.value.ok) {
    renderNoticias(parseCSV(await resN.value.text()));
  } else {
    document.getElementById('noticias-container').innerHTML =
      '<div class="noticias-empty">Não foi possível carregar as notícias.</div>';
  }

  if (resA.status === 'fulfilled' && resA.value.ok) {
    renderAvisos(parseCSV(await resA.value.text()));
  } else {
    document.getElementById('avisos-container').innerHTML =
      '<div class="noticias-empty">Não foi possível carregar os avisos.</div>';
  }
}

document.addEventListener('DOMContentLoaded', loadAll);

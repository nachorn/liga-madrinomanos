/**
 * Liga Madrinomanos – app local (localStorage)
 * Pronósticos: resultado final, descanso, 1.º / 2.º / 3.º goleador.
 * El admin puede ajustar los puntos en cada partido.
 */

// Plantilla Real Madrid (2025-26) – desplegables de goleador
const RM_SQUAD = [
  'Álvaro Carreras', 'Andriy Lunin', 'Antonio Rüdiger', 'Arda Güler', 'Aurélien Tchouaméni',
  'Brahim Díaz', 'Dani Carvajal', 'Dani Ceballos', 'David Alaba', 'Dean Huijsen',
  'Eduardo Camavinga', 'Éder Militão', 'Federico Valverde', 'Ferland Mendy', 'Fran García',
  'Franco Mastantuono', 'Gonzalo García', 'Jude Bellingham', 'Kylian Mbappé', 'Raúl Asencio',
  'Rodrygo', 'Thibaut Courtois', 'Trent Alexander-Arnold', 'Vinícius Júnior', 'Autogol',
];

const SCORER_OTHER = '__other__';

function isCustomScorerName(name) {
  if (!name || !String(name).trim()) return false;
  const n = String(name).trim();
  return n !== 'Autogol' && n.toLowerCase() !== 'own goal' && !RM_SQUAD.includes(n);
}

function buildScorerSelectOptions(selectedValue) {
  const opts = ['<option value="">— Sin gol</option>', '<option value="Autogol">Autogol</option>'];
  RM_SQUAD.filter((n) => n !== 'Autogol').forEach((name) => {
    const sel = normalizeScorer(name) === normalizeScorer(selectedValue) ? ' selected' : '';
    opts.push(`<option value="${escapeHtml(name)}"${sel}>${escapeHtml(name)}</option>`);
  });
  const selOther = isCustomScorerName(selectedValue) ? ' selected' : '';
  opts.push(`<option value="${SCORER_OTHER}"${selOther}>Otro (escribir nombre)</option>`);
  return opts.join('');
}

const STORAGE_KEYS = {
  participants: 'rm_participants',
  games: 'rm_games',
  predictions: 'rm_predictions',
  results: 'rm_results',
  scores: 'rm_scores', // computed per game per user
};

// --- Data helpers ---
function getParticipants() {
  const raw = localStorage.getItem(STORAGE_KEYS.participants);
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveParticipants(list) {
  const names = (list || [])
    .map((s) => String(s).trim())
    .filter(Boolean);
  localStorage.setItem(STORAGE_KEYS.participants, JSON.stringify(names));
  return names;
}

function getGames() {
  const raw = localStorage.getItem(STORAGE_KEYS.games);
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveGames(games) {
  localStorage.setItem(STORAGE_KEYS.games, JSON.stringify(games));
}

function getPredictions() {
  const raw = localStorage.getItem(STORAGE_KEYS.predictions);
  if (!raw) return {};
  return JSON.parse(raw);
}

function savePredictions(preds) {
  localStorage.setItem(STORAGE_KEYS.predictions, JSON.stringify(preds));
}

function getResults() {
  const raw = localStorage.getItem(STORAGE_KEYS.results);
  if (!raw) return {};
  return JSON.parse(raw);
}

function saveResults(results) {
  localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results));
}

function getScores() {
  const raw = localStorage.getItem(STORAGE_KEYS.scores);
  if (!raw) return {};
  return JSON.parse(raw);
}

function saveScores(scores) {
  localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores));
}

// --- Scoring ---
function normalizeScorer(name) {
  const n = String(name || '').trim().toLowerCase();
  if (n === 'own goal' || n === 'autogol') return 'autogol';
  return n;
}

function scorerMatch(a, b) {
  return normalizeScorer(a) === normalizeScorer(b);
}

function computeGameScores(gameId, game, result, predictionsForGame) {
  if (!result || !predictionsForGame) return {};
  const pts = game.points || {};
  const scores = {};
  const r = {
    ftHome: Number(result.ftHome),
    ftAway: Number(result.ftAway),
    htHome: Number(result.htHome),
    htAway: Number(result.htAway),
    scorer1: (result.scorer1 || '').trim(),
    scorer2: (result.scorer2 || '').trim(),
    scorer3: (result.scorer3 || '').trim(),
  };

  for (const [participantIndex, pred] of Object.entries(predictionsForGame)) {
    let total = 0;
    let ft = 0, ht = 0, s1 = 0, s2 = 0, s3 = 0;

    const pFtHome = Number(pred.ftHome);
    const pFtAway = Number(pred.ftAway);
    const pHtHome = Number(pred.htHome);
    const pHtAway = Number(pred.htAway);

    if (pFtHome === r.ftHome && pFtAway === r.ftAway) {
      ft = pts.fullTime || 0;
      total += ft;
    }
    if (pHtHome === r.htHome && pHtAway === r.htAway) {
      ht = pts.halfTime || 0;
      total += ht;
    }
    if (scorerMatch(pred.scorer1, r.scorer1)) {
      s1 = pts.firstScorer || 0;
      total += s1;
    }
    if (scorerMatch(pred.scorer2, r.scorer2)) {
      s2 = pts.secondScorer || 0;
      total += s2;
    }
    if (scorerMatch(pred.scorer3, r.scorer3)) {
      s3 = pts.thirdScorer || 0;
      total += s3;
    }

    scores[participantIndex] = { total, ft, ht, s1, s2, s3 };
  }

  return scores;
}

function recalcAllScores() {
  const games = getGames();
  const results = getResults();
  const predictions = getPredictions();
  const allScores = getScores();

  games.forEach((g) => {
    const res = results[g.id];
    const preds = predictions[g.id];
    if (res && preds) {
      allScores[g.id] = computeGameScores(g.id, g, res, preds);
    }
  });

  saveScores(allScores);
  return allScores;
}

// --- UI: Participants ---
function renderParticipants() {
  const list = getParticipants();
  document.getElementById('participantsList').value = list.join('\n');
  document.getElementById('participantsCount').textContent =
    list.length ? `${list.length} participantes` : '';
}

// --- UI: Games ---
function nextGameId() {
  const games = getGames();
  const max = games.reduce((m, g) => Math.max(m, g.id || 0), 0);
  return max + 1;
}

function renderGames() {
  const games = getGames();
  const results = getResults();
  const container = document.getElementById('gamesList');
  container.innerHTML = '';

  const sorted = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((g) => {
    const res = results[g.id];
    const pts = g.points || {};
    const div = document.createElement('div');
    div.className = 'game-card' + (res ? ' has-result' : '');
    div.innerHTML = `
      <div>
        <span class="opponent">${escapeHtml(g.opponent || 'Unknown')}</span>
        <span class="date">${g.date || ''}</span>
      </div>
      <span class="points-summary">Final:${pts.fullTime ?? 0} Desc:${pts.halfTime ?? 0} 1.º:${pts.firstScorer ?? 0} 2.º:${pts.secondScorer ?? 0} 3.º:${pts.thirdScorer ?? 0}</span>
      <button type="button" data-delete-game="${g.id}">Borrar</button>
    `;
    div.querySelector('[data-delete-game]').addEventListener('click', () => {
      if (confirm('¿Borrar este partido y sus pronósticos/resultado?')) {
        const newGames = getGames().filter((x) => x.id !== g.id);
        saveGames(newGames);
        const preds = getPredictions();
        delete preds[g.id];
        savePredictions(preds);
        const res = getResults();
        delete res[g.id];
        saveResults(res);
        const scores = getScores();
        delete scores[g.id];
        saveScores(scores);
        renderGames();
        renderPredictionsGameSelect();
        renderResultsGameSelect();
        renderStandingsFilter();
      }
    });
    container.appendChild(div);
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// --- UI: Predictions ---
function renderPredictionsGameSelect() {
  const games = getGames();
  const sel = document.getElementById('predictionsGame');
  sel.innerHTML = '<option value="">— Elegir partido —</option>';
  const sorted = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.opponent || '?'} (${g.date || '?'})`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', fillPredictionsTable);
}

function fillPredictionsTable() {
  const gameId = document.getElementById('predictionsGame').value;
  const participants = getParticipants();
  const predictions = getPredictions();
  const gamePreds = gameId ? predictions[gameId] || {} : {};
  const tbody = document.getElementById('predictionsBody');
  tbody.innerHTML = '';

  participants.forEach((name, idx) => {
    const p = gamePreds[idx] || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(name)}</td>
      <td><div class="score-inputs"><input type="number" data-ft-home min="0" value="${p.ftHome ?? ''}" placeholder="RM" /><span>–</span><input type="number" data-ft-away min="0" value="${p.ftAway ?? ''}" placeholder="Rival" /></div></td>
      <td><div class="score-inputs"><input type="number" data-ht-home min="0" value="${p.htHome ?? ''}" /><span>–</span><input type="number" data-ht-away min="0" value="${p.htAway ?? ''}" /></div></td>
      <td><span class="scorer-cell"><select data-scorer1>${buildScorerSelectOptions(p.scorer1)}</select><input type="text" class="scorer-other-input" data-scorer-other="1" placeholder="Nombre" /></span></td>
      <td><span class="scorer-cell"><select data-scorer2>${buildScorerSelectOptions(p.scorer2)}</select><input type="text" class="scorer-other-input" data-scorer-other="2" placeholder="Nombre" /></span></td>
      <td><span class="scorer-cell"><select data-scorer3>${buildScorerSelectOptions(p.scorer3)}</select><input type="text" class="scorer-other-input" data-scorer-other="3" placeholder="Nombre" /></span></td>
    `;
    tr.dataset.participantIndex = idx;
    [1, 2, 3].forEach((n) => {
      const sel = tr.querySelector(`select[data-scorer${n}]`);
      const inp = tr.querySelector(`.scorer-other-input[data-scorer-other="${n}"]`);
      const pVal = p[`scorer${n}`];
      if (isCustomScorerName(pVal)) {
        sel.value = SCORER_OTHER;
        inp.value = pVal || '';
        inp.style.display = '';
      } else {
        inp.style.display = 'none';
      }
      sel.addEventListener('change', () => {
        inp.style.display = sel.value === SCORER_OTHER ? '' : 'none';
        if (sel.value === SCORER_OTHER) inp.focus();
      });
    });
    tbody.appendChild(tr);
  });
}

function savePredictionsFromTable() {
  const gameId = document.getElementById('predictionsGame').value;
  if (!gameId) {
    alert('Elige un partido primero.');
    return;
  }
  const predictions = getPredictions();
  predictions[gameId] = {};
  document.querySelectorAll('#predictionsBody tr').forEach((tr) => {
    const idx = tr.dataset.participantIndex;
    const inputs = tr.querySelectorAll('input[data-ft-home], input[data-ft-away], input[data-ht-home], input[data-ht-away]');
    const ftHome = inputs[0], ftAway = inputs[1], htHome = inputs[2], htAway = inputs[3];
    function getScorerValue(n) {
      const sel = tr.querySelector(`select[data-scorer${n}]`);
      const inp = tr.querySelector(`.scorer-other-input[data-scorer-other="${n}"]`);
      if (!sel) return undefined;
      const v = sel.value === SCORER_OTHER ? (inp && inp.value ? inp.value.trim() : '') : (sel.value || '').trim();
      return v || undefined;
    }
    predictions[gameId][idx] = {
      ftHome: ftHome.value.trim() === '' ? undefined : Number(ftHome.value),
      ftAway: ftAway.value.trim() === '' ? undefined : Number(ftAway.value),
      htHome: htHome.value.trim() === '' ? undefined : Number(htHome.value),
      htAway: htAway.value.trim() === '' ? undefined : Number(htAway.value),
      scorer1: getScorerValue(1),
      scorer2: getScorerValue(2),
      scorer3: getScorerValue(3),
    };
  });
  savePredictions(predictions);
  recalcAllScores();
  alert('Pronósticos guardados.');
}

// --- UI: Results ---
function renderResultsGameSelect() {
  const games = getGames();
  const sel = document.getElementById('resultsGame');
  sel.innerHTML = '<option value="">— Elegir partido —</option>';
  const sorted = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.opponent || '?'} (${g.date || '?'})`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', fillResultForm);
}

function initResultScorerSelects() {
  ['resScorer1', 'resScorer2', 'resScorer3'].forEach((id, i) => {
    const n = i + 1;
    const sel = document.getElementById(id);
    const otherInp = document.getElementById(id + 'Other');
    if (!sel) return;
    sel.innerHTML = buildScorerSelectOptions('');
    if (otherInp) {
      otherInp.style.display = 'none';
      sel.addEventListener('change', () => {
        otherInp.style.display = sel.value === SCORER_OTHER ? 'inline-block' : 'none';
        if (sel.value === SCORER_OTHER) otherInp.focus();
      });
    }
  });
}

function fillResultForm() {
  const gameId = document.getElementById('resultsGame').value;
  const results = getResults();
  const r = gameId ? results[gameId] || {} : {};
  document.getElementById('resFtHome').value = r.ftHome ?? '';
  document.getElementById('resFtAway').value = r.ftAway ?? '';
  document.getElementById('resHtHome').value = r.htHome ?? '';
  document.getElementById('resHtAway').value = r.htAway ?? '';
  [1, 2, 3].forEach((n) => {
    const sel = document.getElementById(`resScorer${n}`);
    const otherInp = document.getElementById(`resScorer${n}Other`);
    const val = r[`scorer${n}`] ?? '';
    if (isCustomScorerName(val)) {
      sel.value = SCORER_OTHER;
      if (otherInp) { otherInp.value = val; otherInp.style.display = 'inline-block'; }
    } else {
      sel.value = val || '';
      if (otherInp) { otherInp.value = ''; otherInp.style.display = 'none'; }
    }
  });
}

function saveResultFromForm() {
  const gameId = document.getElementById('resultsGame').value;
  if (!gameId) {
    alert('Elige un partido primero.');
    return;
  }
  const results = getResults();
  function getResultScorer(n) {
    const sel = document.getElementById(`resScorer${n}`);
    const otherInp = document.getElementById(`resScorer${n}Other`);
    return sel.value === SCORER_OTHER ? (otherInp ? otherInp.value.trim() : '') : (sel.value || '').trim();
  }
  results[gameId] = {
    ftHome: Number(document.getElementById('resFtHome').value) || 0,
    ftAway: Number(document.getElementById('resFtAway').value) || 0,
    htHome: Number(document.getElementById('resHtHome').value) || 0,
    htAway: Number(document.getElementById('resHtAway').value) || 0,
    scorer1: getResultScorer(1),
    scorer2: getResultScorer(2),
    scorer3: getResultScorer(3),
  };
  saveResults(results);
  recalcAllScores();
  fillResultForm();
  alert('Resultado guardado. Puntos recalculados.');
}

// --- UI: Standings ---
function renderStandingsFilter() {
  const games = getGames();
  const sel = document.getElementById('standingsFilter');
  const current = sel.value;
  sel.innerHTML = '<option value="all">Todos los partidos</option>';
  const sorted = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.opponent || '?'} (${g.date || '?'})`;
    sel.appendChild(opt);
  });
  sel.value = current || 'all';
  sel.addEventListener('change', renderStandings);
}

function renderStandings() {
  const filter = document.getElementById('standingsFilter').value;
  const participants = getParticipants();
  const scores = getScores();
  const games = getGames();

  const gameIds = filter === 'all' ? games.map((g) => g.id) : [filter];

  const totals = participants.map((_, idx) => {
    let total = 0;
    let ft = 0, ht = 0, s1 = 0, s2 = 0, s3 = 0;
    gameIds.forEach((gid) => {
      const gameScores = scores[gid];
      if (gameScores && gameScores[idx]) {
        const s = gameScores[idx];
        total += s.total;
        ft += s.ft;
        ht += s.ht;
        s1 += s.s1;
        s2 += s.s2;
        s3 += s.s3;
      }
    });
    return { idx, name: participants[idx], total, ft, ht, s1, s2, s3 };
  });

  totals.sort((a, b) => b.total - a.total);

  const tbody = document.getElementById('standingsBody');
  tbody.innerHTML = '';
  totals.forEach((t, rank) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rank + 1}</td>
      <td>${escapeHtml(t.name)}</td>
      <td>${t.total}</td>
      <td>${t.ft}</td>
      <td>${t.ht}</td>
      <td>${t.s1}</td>
      <td>${t.s2}</td>
      <td>${t.s3}</td>
    `;
    tbody.appendChild(tr);
  });

  // Store current standings data for WhatsApp copy (used by copyStandingsToWhatsApp)
  window.__lastStandingsTotals = totals;
  window.__lastStandingsFilter = filter;
  window.__lastStandingsGames = games;
}

function getStandingsAsWhatsAppText() {
  const totals = window.__lastStandingsTotals;
  const filter = window.__lastStandingsFilter;
  const games = window.__lastStandingsGames;
  if (!totals || !totals.length) return '';

  const filterLabel = filter === 'all'
    ? 'All games'
    : (games || []).find((g) => String(g.id) === String(filter))?.opponent || 'Standings';
  const lines = [
    '⚽ Real Madrid Prediction League',
    `📊 ${filterLabel}`,
    '',
  ];

  totals.forEach((t, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    const rank = (i + 1).toString().padStart(2);
    lines.push(`${medal} ${rank}. ${t.name} — ${t.total} pts (FT:${t.ft} HT:${t.ht} 1st:${t.s1} 2nd:${t.s2} 3rd:${t.s3})`);
  });

  return lines.join('\n');
}

async function copyStandingsToWhatsApp() {
  const text = getStandingsAsWhatsAppText();
  const feedback = document.getElementById('copyStandingsFeedback');
  if (!text) {
    if (feedback) feedback.textContent = 'No hay clasificación para copiar.';
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    if (feedback) {
      feedback.textContent = '¡Copiado! Pega en WhatsApp.';
      feedback.classList.add('visible');
      setTimeout(() => {
        feedback.textContent = '';
        feedback.classList.remove('visible');
      }, 2500);
    }
  } catch (err) {
    if (feedback) feedback.textContent = 'No se pudo copiar. Selecciona y copia a mano.';
  }
}

// --- Tabs ---
function initTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const id = tab.dataset.tab;
      document.getElementById(id).classList.add('active');
      if (id === 'standings') renderStandings();
      if (id === 'predictions') fillPredictionsTable();
    });
  });
}

// --- Add game ---
function addGame() {
  const opponent = document.getElementById('gameOpponent').value.trim();
  const date = document.getElementById('gameDate').value;
  if (!opponent) {
    alert('Escribe el rival.');
    return;
  }
  const games = getGames();
  const pts = {
    fullTime: Number(document.getElementById('ptFullTime').value) || 0,
    halfTime: Number(document.getElementById('ptHalfTime').value) || 0,
    firstScorer: Number(document.getElementById('ptFirstScorer').value) || 0,
    secondScorer: Number(document.getElementById('ptSecondScorer').value) || 0,
    thirdScorer: Number(document.getElementById('ptThirdScorer').value) || 0,
  };
  games.push({
    id: nextGameId(),
    opponent,
    date: date || null,
    points: pts,
  });
  saveGames(games);
  document.getElementById('gameOpponent').value = '';
  document.getElementById('gameDate').value = '';
  renderGames();
  renderPredictionsGameSelect();
  renderResultsGameSelect();
  renderStandingsFilter();
}

// --- Save participants ---
function onSaveParticipants() {
  const text = document.getElementById('participantsList').value;
  const list = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
  saveParticipants(list);
  renderParticipants();
  fillPredictionsTable();
  renderStandings();
  alert(`${list.length} participantes guardados.`);
}

// --- Init ---
function init() {
  initResultScorerSelects();
  renderParticipants();
  renderGames();
  renderPredictionsGameSelect();
  renderResultsGameSelect();
  renderStandingsFilter();
  renderStandings();
  initTabs();

  document.getElementById('saveParticipants').addEventListener('click', onSaveParticipants);
  document.getElementById('addGame').addEventListener('click', addGame);
  document.getElementById('savePredictions').addEventListener('click', savePredictionsFromTable);
  document.getElementById('saveResult').addEventListener('click', saveResultFromForm);
  const copyBtn = document.getElementById('copyStandingsWhatsApp');
  if (copyBtn) copyBtn.addEventListener('click', copyStandingsToWhatsApp);
}

init();

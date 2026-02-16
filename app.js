/**
 * Liga Madrinomanos – app local (localStorage)
 * Pronósticos: resultado final, descanso, 1.º / 2.º / 3.º goleador.
 * El admin puede ajustar los puntos en cada partido.
 */

// Plantilla Real Madrid (2025-26) – orden: delanteros, centrocampistas, defensas, porteros
const RM_SQUAD = [
  'Kylian Mbappé', 'Vinícius Júnior', 'Rodrygo', 'Brahim Díaz', 'Gonzalo García', 'Franco Mastantuono',
  'Jude Bellingham', 'Federico Valverde', 'Arda Güler', 'Aurélien Tchouaméni', 'Eduardo Camavinga', 'Dani Ceballos',
  'Dani Carvajal', 'Antonio Rüdiger', 'Éder Militão', 'David Alaba', 'Trent Alexander-Arnold', 'Ferland Mendy', 'Fran García', 'Dean Huijsen', 'Raúl Asencio', 'Álvaro Carreras',
  'Thibaut Courtois', 'Andriy Lunin',
  'Autogol',
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
  scores: 'rm_scores',
  historicalPoints: 'rm_historical_points',
};
const THEME_KEY = 'rm_theme';

// --- Theme ---
function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.body.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#c9a227' : '#c9a227');
}

function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

// --- Recordatorios ---
function getReminders() {
  const games = getGames();
  const results = getResults();
  const predictions = getPredictions();
  const noResult = games.filter((g) => !results[g.id]);
  const noPredictions = games.filter((g) => {
    const pred = predictions[g.id];
    if (!pred || typeof pred !== 'object') return true;
    const keys = Object.keys(pred);
    if (keys.length === 0) return true;
    const hasAny = keys.some((idx) => {
      const p = pred[idx];
      return p && (p.ftHome != null || p.ftAway != null || p.scorer1 != null);
    });
    return !hasAny;
  });
  return { noResult, noPredictions };
}

function goToTab(tabId) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
  const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  const panel = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  if (panel) panel.classList.add('active');
  if (tabId === 'standings') renderStandings();
  if (tabId === 'predictions') fillPredictionsTable();
  if (tabId === 'historical') renderHistoricalPanel();
  if (tabId === 'results') fillResultForm();
}

function renderReminders() {
  const wrap = document.getElementById('remindersWrap');
  if (!wrap) return;
  const { noResult, noPredictions } = getReminders();
  if (noResult.length === 0 && noPredictions.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  const sortedNoRes = [...noResult].sort((a, b) => new Date(a.date) - new Date(b.date));
  const sortedNoPred = [...noPredictions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const listNoRes = sortedNoRes.map((g) => `${g.opponent || '?'} (${g.date || '—'})`).join(', ');
  const listNoPred = sortedNoPred.map((g) => `${g.opponent || '?'} (${g.date || '—'})`).join(', ');
  let html = '<div class="reminders-box"><span class="reminders-title">📌 Recordatorios</span>';
  if (noResult.length) {
    html += `<p>Partido(s) sin resultado: ${escapeHtml(listNoRes)}</p>`;
    html += '<div class="reminder-actions"><button type="button" data-goto="results">Ir a Poner resultado</button></div>';
  }
  if (noPredictions.length) {
    if (noResult.length) html += '<p style="margin-top:0.75rem;"></p>';
    html += `<p>Falta introducir pronósticos: ${escapeHtml(listNoPred)}</p>`;
    html += '<div class="reminder-actions"><button type="button" data-goto="predictions">Ir a Pronósticos</button></div>';
  }
  html += '</div>';
  wrap.innerHTML = html;
  wrap.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.goto;
      goToTab(tabId);
      if (tabId === 'results' && sortedNoRes[0]) {
        const sel = document.getElementById('resultsGame');
        if (sel) sel.value = sortedNoRes[0].id;
        fillResultForm();
      }
      if (tabId === 'predictions' && sortedNoPred[0]) {
        const sel = document.getElementById('predictionsGame');
        if (sel) sel.value = sortedNoPred[0].id;
        fillPredictionsTable();
      }
    });
  });
}

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

function getHistoricalPoints() {
  const raw = localStorage.getItem(STORAGE_KEYS.historicalPoints);
  if (!raw) return {};
  return JSON.parse(raw);
}

function saveHistoricalPoints(obj) {
  localStorage.setItem(STORAGE_KEYS.historicalPoints, JSON.stringify(obj));
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

function isMbappe(scorerName) {
  const n = normalizeScorer(scorerName || '');
  return n === 'kylian mbappé' || n === 'mbappé' || n === 'mbappe';
}

function scorerPointsForSlot(actualScorer, basePoints) {
  if (!basePoints) return 0;
  return isMbappe(actualScorer) ? 1 : basePoints;
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
      s1 = scorerPointsForSlot(r.scorer1, pts.firstScorer);
      total += s1;
    }
    if (scorerMatch(pred.scorer2, r.scorer2)) {
      s2 = scorerPointsForSlot(r.scorer2, pts.secondScorer);
      total += s2;
    }
    if (scorerMatch(pred.scorer3, r.scorer3)) {
      s3 = scorerPointsForSlot(r.scorer3, pts.thirdScorer);
      total += s3;
    }

    if (game.customBet && game.customBet.label && result.customBetValue != null && result.customBetValue !== '') {
      const predVal = String(pred.customBetValue || '').trim().toLowerCase();
      const resVal = String(result.customBetValue || '').trim().toLowerCase();
      if (predVal && predVal === resVal) total += (game.customBet.points || 0);
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
    const isAway = g.venue === 'away';
    const fixture = isAway ? `${escapeHtml(g.opponent || '?')} – Real Madrid` : `Real Madrid – ${escapeHtml(g.opponent || 'Unknown')}`;
    const ha = isAway ? '✈️' : '🏠';
    const customSummary = g.customBet && g.customBet.label ? ` | Extra: ${escapeHtml(g.customBet.label)} (${g.customBet.points ?? 0})` : '';
    div.innerHTML = `
      <div>
        <span class="opponent">${fixture}</span>
        <span class="venue-badge">${ha}</span>
        <span class="date">${g.date || ''}</span>
      </div>
      <span class="points-summary">Final:${pts.fullTime ?? 0} Desc:${pts.halfTime ?? 0} 1.º:${pts.firstScorer ?? 0} 2.º:${pts.secondScorer ?? 0} 3.º:${pts.thirdScorer ?? 0}${customSummary}</span>
      <div class="game-card-actions">
        <button type="button" data-edit-game="${g.id}">Editar</button>
        <button type="button" data-delete-game="${g.id}">Borrar</button>
      </div>
    `;
    div.querySelector('[data-edit-game]').addEventListener('click', () => openEditGameModal(g));
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
        renderReminders();
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

// --- Edit game modal ---
function openEditGameModal(game) {
  document.getElementById('editGameId').value = game.id;
  document.getElementById('editGameOpponent').value = game.opponent || '';
  document.getElementById('editGameDate').value = game.date || '';
  const venue = game.venue === 'away' ? 'away' : 'home';
  if (document.getElementById('editGameVenueHome')) document.getElementById('editGameVenueHome').checked = (venue === 'home');
  if (document.getElementById('editGameVenueAway')) document.getElementById('editGameVenueAway').checked = (venue === 'away');
  const pts = game.points || {};
  document.getElementById('editPtFullTime').value = pts.fullTime ?? 5;
  document.getElementById('editPtHalfTime').value = pts.halfTime ?? 3;
  document.getElementById('editPtFirstScorer').value = pts.firstScorer ?? 2;
  document.getElementById('editPtSecondScorer').value = pts.secondScorer ?? 2;
  document.getElementById('editPtThirdScorer').value = pts.thirdScorer ?? 2;
  document.getElementById('editPtCustomBetLabel').value = game.customBet && game.customBet.label ? game.customBet.label : '';
  document.getElementById('editPtCustomBetPoints').value = game.customBet && game.customBet.points != null ? game.customBet.points : 2;
  const modal = document.getElementById('editGameModal');
  modal.classList.add('modal-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeEditGameModal() {
  const modal = document.getElementById('editGameModal');
  modal.classList.remove('modal-open');
  modal.setAttribute('aria-hidden', 'true');
}

function saveEditGame() {
  const gameId = Number(document.getElementById('editGameId').value);
  const games = getGames();
  const game = games.find((g) => g.id === gameId);
  if (!game) return;
  game.opponent = document.getElementById('editGameOpponent').value.trim() || game.opponent;
  game.date = document.getElementById('editGameDate').value || null;
  const editVenueEl = document.querySelector('input[name="editGameVenue"]:checked');
  game.venue = (editVenueEl && editVenueEl.value === 'away') ? 'away' : 'home';
  game.points = {
    fullTime: Number(document.getElementById('editPtFullTime').value) || 0,
    halfTime: Number(document.getElementById('editPtHalfTime').value) || 0,
    firstScorer: Number(document.getElementById('editPtFirstScorer').value) || 0,
    secondScorer: Number(document.getElementById('editPtSecondScorer').value) || 0,
    thirdScorer: Number(document.getElementById('editPtThirdScorer').value) || 0,
  };
  const customLabel = (document.getElementById('editPtCustomBetLabel').value || '').trim();
  game.customBet = customLabel
    ? { label: customLabel, points: Number(document.getElementById('editPtCustomBetPoints').value) || 0 }
    : undefined;
  saveGames(games);
  recalcAllScores();
  closeEditGameModal();
  renderGames();
  renderPredictionsGameSelect();
  renderResultsGameSelect();
  renderStandingsFilter();
  fillPredictionsTable();
  fillResultForm();
  renderReminders();
  alert('Partido actualizado.');
}

// --- Export / Import ---
function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    participants: getParticipants(),
    games: getGames(),
    predictions: getPredictions(),
    results: getResults(),
    scores: getScores(),
    historicalPoints: getHistoricalPoints(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `liga-madrinomanos-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const feedback = document.getElementById('importFeedback');
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object') throw new Error('Archivo no válido');
      if (data.participants != null) saveParticipants(data.participants);
      if (data.games != null) saveGames(data.games);
      if (data.predictions != null) savePredictions(data.predictions);
      if (data.results != null) saveResults(data.results);
      if (data.scores != null) saveScores(data.scores);
      if (data.historicalPoints != null) saveHistoricalPoints(data.historicalPoints);
      recalcAllScores();
      renderParticipants();
      renderGames();
      renderPredictionsGameSelect();
      renderResultsGameSelect();
      renderStandingsFilter();
      renderHistoricalPanel();
      renderStandings();
      fillPredictionsTable();
      fillResultForm();
      if (feedback) { feedback.textContent = 'Datos importados correctamente.'; feedback.classList.add('visible'); setTimeout(() => { feedback.textContent = ''; feedback.classList.remove('visible'); }, 3000); }
    } catch (e) {
      if (feedback) { feedback.textContent = 'Error: ' + (e.message || 'archivo no válido'); feedback.classList.add('visible'); }
    }
  };
  reader.readAsText(file);
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
    const ha = g.venue === 'away' ? ' ✈️' : ' 🏠';
    opt.textContent = `${g.opponent || '?'}${ha} (${g.date || '?'})`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', fillPredictionsTable);
}

function fillPredictionsTable() {
  const gameId = document.getElementById('predictionsGame').value;
  const games = getGames();
  const game = gameId ? games.find((g) => String(g.id) === String(gameId)) : null;
  const hasCustomBet = game && game.customBet && game.customBet.label;
  const participants = getParticipants();
  const predictions = getPredictions();
  const gamePreds = gameId ? predictions[gameId] || {} : {};
  const headerRow = document.getElementById('predictionsHeaderRow');
  const tbody = document.getElementById('predictionsBody');
  tbody.innerHTML = '';

  const isAway = game && game.venue === 'away';
  const scoreLabel = isAway ? 'Rival – RM' : 'RM – Rival';
  const firstPh = isAway ? 'Rival' : 'RM';
  const secondPh = isAway ? 'RM' : 'Rival';

  let headerHtml = `
    <th>Participante</th>
    <th>Final (${scoreLabel})</th>
    <th>Descanso (${scoreLabel})</th>
    <th>1.º goleador</th>
    <th>2.º goleador</th>
    <th>3.º goleador</th>
  `;
  if (hasCustomBet) headerHtml += `<th>${escapeHtml(game.customBet.label)}</th>`;
  if (headerRow) headerRow.innerHTML = headerHtml;

  participants.forEach((name, idx) => {
    const p = gamePreds[idx] || {};
    const tr = document.createElement('tr');
    let rowHtml = `
      <td>${escapeHtml(name)}</td>
      <td><div class="score-inputs"><input type="number" data-ft-home min="0" value="${p.ftHome ?? ''}" placeholder="${firstPh}" /><span>–</span><input type="number" data-ft-away min="0" value="${p.ftAway ?? ''}" placeholder="${secondPh}" /></div></td>
      <td><div class="score-inputs"><input type="number" data-ht-home min="0" value="${p.htHome ?? ''}" placeholder="${firstPh}" /><span>–</span><input type="number" data-ht-away min="0" value="${p.htAway ?? ''}" placeholder="${secondPh}" /></div></td>
      <td><span class="scorer-cell"><select data-scorer1>${buildScorerSelectOptions(p.scorer1)}</select><input type="text" class="scorer-other-input" data-scorer-other="1" placeholder="Nombre" /></span></td>
      <td><span class="scorer-cell"><select data-scorer2>${buildScorerSelectOptions(p.scorer2)}</select><input type="text" class="scorer-other-input" data-scorer-other="2" placeholder="Nombre" /></span></td>
      <td><span class="scorer-cell"><select data-scorer3>${buildScorerSelectOptions(p.scorer3)}</select><input type="text" class="scorer-other-input" data-scorer-other="3" placeholder="Nombre" /></span></td>
    `;
    if (hasCustomBet) rowHtml += `<td><input type="text" data-custom-bet value="${escapeHtml(p.customBetValue || '')}" placeholder="Pronóstico" /></td>`;
    tr.innerHTML = rowHtml;
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
  const games = getGames();
  const game = games.find((g) => String(g.id) === String(gameId));
  const hasCustomBet = game && game.customBet && game.customBet.label;
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
    const customInp = tr.querySelector('input[data-custom-bet]');
    const customBetValue = hasCustomBet && customInp ? (customInp.value || '').trim() || undefined : undefined;
    predictions[gameId][idx] = {
      ftHome: ftHome.value.trim() === '' ? undefined : Number(ftHome.value),
      ftAway: ftAway.value.trim() === '' ? undefined : Number(ftAway.value),
      htHome: htHome.value.trim() === '' ? undefined : Number(htHome.value),
      htAway: htAway.value.trim() === '' ? undefined : Number(htAway.value),
      scorer1: getScorerValue(1),
      scorer2: getScorerValue(2),
      scorer3: getScorerValue(3),
      customBetValue,
    };
  });
  savePredictions(predictions);
  recalcAllScores();
  renderReminders();
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
    const ha = g.venue === 'away' ? ' ✈️' : ' 🏠';
    opt.textContent = `${g.opponent || '?'}${ha} (${g.date || '?'})`;
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
  const games = getGames();
  const game = gameId ? games.find((g) => String(g.id) === String(gameId)) : null;
  const results = getResults();
  const r = gameId ? results[gameId] || {} : {};
  const isAway = game && game.venue === 'away';
  const scoreLabel = isAway ? 'Rival – RM' : 'RM – Rival';
  const ftLabel = document.getElementById('resFtLabel');
  const htLabel = document.getElementById('resHtLabel');
  if (ftLabel) ftLabel.textContent = `Resultado final (${scoreLabel}) `;
  if (htLabel) htLabel.textContent = `Resultado descanso (${scoreLabel}) `;
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
  const customWrap = document.getElementById('resultCustomBetWrap');
  const customLabel = document.getElementById('resultCustomBetLabel');
  const customValue = document.getElementById('resCustomBetValue');
  if (game && game.customBet && game.customBet.label) {
    if (customWrap) customWrap.style.display = 'block';
    if (customLabel) customLabel.textContent = game.customBet.label + ' ';
    if (customValue) customValue.value = r.customBetValue ?? '';
  } else {
    if (customWrap) customWrap.style.display = 'none';
    if (customValue) customValue.value = '';
  }
}

function saveResultFromForm() {
  const gameId = document.getElementById('resultsGame').value;
  if (!gameId) {
    alert('Elige un partido primero.');
    return;
  }
  const games = getGames();
  const game = games.find((g) => String(g.id) === String(gameId));
  const results = getResults();
  function getResultScorer(n) {
    const sel = document.getElementById(`resScorer${n}`);
    const otherInp = document.getElementById(`resScorer${n}Other`);
    return sel.value === SCORER_OTHER ? (otherInp ? otherInp.value.trim() : '') : (sel.value || '').trim();
  }
  const customValueEl = document.getElementById('resCustomBetValue');
  const customBetValue = (game && game.customBet && customValueEl) ? customValueEl.value.trim() : '';
  results[gameId] = {
    ftHome: Number(document.getElementById('resFtHome').value) || 0,
    ftAway: Number(document.getElementById('resFtAway').value) || 0,
    htHome: Number(document.getElementById('resHtHome').value) || 0,
    htAway: Number(document.getElementById('resHtAway').value) || 0,
    scorer1: getResultScorer(1),
    scorer2: getResultScorer(2),
    scorer3: getResultScorer(3),
    customBetValue: customBetValue || undefined,
  };
  saveResults(results);
  recalcAllScores();
  fillResultForm();
  renderReminders();
  alert('Resultado guardado. Puntos recalculados.');
}

// --- UI: Historical points ---
function renderHistoricalPanel() {
  const participants = getParticipants();
  const historical = getHistoricalPoints();
  const tbody = document.getElementById('historicalBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  participants.forEach((name, idx) => {
    const tr = document.createElement('tr');
    const val = historical[name];
    tr.dataset.participantIndex = idx;
    tr.innerHTML = `
      <td>${escapeHtml(name)}</td>
      <td><input type="number" min="0" value="${val !== undefined && val !== null ? Number(val) : ''}" placeholder="0" /></td>
    `;
    tbody.appendChild(tr);
  });
}

function saveHistoricalFromPanel() {
  const participants = getParticipants();
  const historical = getHistoricalPoints();
  document.querySelectorAll('#historicalBody tr').forEach((tr) => {
    const idx = tr.dataset.participantIndex;
    const name = participants[Number(idx)];
    const input = tr.querySelector('input[type="number"]');
    if (name != null && input) {
      const v = input.value.trim();
      historical[name] = v === '' ? 0 : Number(v);
    }
  });
  saveHistoricalPoints(historical);
  renderStandings();
  alert('Puntos históricos guardados.');
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
    const ha = g.venue === 'away' ? ' ✈️' : ' 🏠';
    opt.textContent = `${g.opponent || '?'}${ha} (${g.date || '?'})`;
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
  const historical = getHistoricalPoints();

  const gameIds = filter === 'all' ? games.map((g) => g.id) : [filter];

  const totals = participants.map((_, idx) => {
    let gamePoints = 0;
    gameIds.forEach((gid) => {
      const gameScores = scores[gid];
      if (gameScores && gameScores[idx]) gamePoints += gameScores[idx].total;
    });
    const name = participants[idx];
    const hist = Number(historical[name]) || 0;
    const total = hist + gamePoints;
    return { idx, name, total, gamePoints, historical: hist };
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
    `;
    tbody.appendChild(tr);
  });

  window.__lastStandingsTotals = totals;
  window.__lastStandingsFilter = filter;
  window.__lastStandingsGames = games;
}

function getLatestMatchWinnersAsText() {
  const games = getGames();
  const results = getResults();
  const scores = getScores();
  const participants = getParticipants();
  const withResult = games.filter((g) => results[g.id]);
  if (!withResult.length) return '';
  const sorted = [...withResult].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const latest = sorted[0];
  const gameScores = scores[latest.id];
  if (!gameScores) return '';

  const byPoints = {};
  participants.forEach((name, idx) => {
    const s = gameScores[idx];
    const pts = s && typeof s.total === 'number' ? s.total : 0;
    if (!byPoints[pts]) byPoints[pts] = [];
    byPoints[pts].push(name);
  });

  const ptsOrder = Object.keys(byPoints).map(Number).sort((a, b) => b - a);
  const lines = [`🏆 Último partido (${latest.opponent || '?'} ${latest.date || ''}):`];
  ptsOrder.forEach((pts) => {
    lines.push(`${pts} pts — ${byPoints[pts].join(', ')}`);
  });
  return lines.join('\n');
}

function getStandingsAsWhatsAppText() {
  const totals = window.__lastStandingsTotals;
  const filter = window.__lastStandingsFilter;
  const games = window.__lastStandingsGames;
  if (!totals || !totals.length) return '';

  const filterLabel = filter === 'all'
    ? 'Todos los partidos'
    : (games || []).find((g) => String(g.id) === String(filter))?.opponent || 'Clasificación';
  const lines = [
    '⚽ Liga Madrinomanos',
    `📊 ${filterLabel}`,
    '',
  ];

  totals.forEach((t, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    const rank = (i + 1).toString().padStart(2);
    lines.push(`${medal} ${rank}. ${t.name} — ${t.total} pts`);
  });

  return lines.join('\n');
}

async function copyStandingsToWhatsApp() {
  const includeWinners = document.getElementById('copyIncludeMatchWinners')?.checked;
  const classificationText = getStandingsAsWhatsAppText();
  const winnersText = includeWinners ? getLatestMatchWinnersAsText() : '';
  const text = winnersText
    ? winnersText + '\n\n' + classificationText
    : classificationText;
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
      if (id === 'historical') renderHistoricalPanel();
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
  const customLabel = (document.getElementById('ptCustomBetLabel') && document.getElementById('ptCustomBetLabel').value || '').trim();
  const customBet = customLabel
    ? { label: customLabel, points: Number(document.getElementById('ptCustomBetPoints').value) || 0 }
    : undefined;
  const venueEl = document.querySelector('input[name="gameVenue"]:checked');
  const venue = (venueEl && venueEl.value === 'away') ? 'away' : 'home';
  games.push({
    id: nextGameId(),
    opponent,
    date: date || null,
    venue,
    points: pts,
    customBet,
  });
  saveGames(games);
  document.getElementById('gameOpponent').value = '';
  document.getElementById('gameDate').value = '';
  if (document.getElementById('gameVenueHome')) document.getElementById('gameVenueHome').checked = true;
  if (document.getElementById('ptCustomBetLabel')) document.getElementById('ptCustomBetLabel').value = '';
  if (document.getElementById('ptCustomBetPoints')) document.getElementById('ptCustomBetPoints').value = '2';
  renderGames();
  renderPredictionsGameSelect();
  renderResultsGameSelect();
  renderStandingsFilter();
  renderReminders();
}

// --- Import games (bulk) ---
function parseImportDate(str) {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim();
  if (!s) return null;
  const dash = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dash) return s;
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const dm = s.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (dm) return null;
  return null;
}

function importGames() {
  const raw = document.getElementById('importGamesText')?.value || '';
  const venueDefault = document.getElementById('importGamesVenueDefault')?.value === 'away' ? 'away' : 'home';
  const lines = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    const fb = document.getElementById('importGamesFeedback');
    if (fb) { fb.textContent = 'Escribe al menos una línea (rival por partido).'; fb.classList.add('visible'); }
    return;
  }

  const games = getGames();
  const defaultPts = {
    fullTime: Number(document.getElementById('ptFullTime')?.value) || 5,
    halfTime: Number(document.getElementById('ptHalfTime')?.value) || 3,
    firstScorer: Number(document.getElementById('ptFirstScorer')?.value) || 2,
    secondScorer: Number(document.getElementById('ptSecondScorer')?.value) || 2,
    thirdScorer: Number(document.getElementById('ptThirdScorer')?.value) || 2,
  };

  let nextId = nextGameId();
  let added = 0;
  const errors = [];

  lines.forEach((line) => {
    const parts = line.split(/[,;\t]/).map((p) => p.trim()).filter(Boolean);
    const opponent = parts[0] || '';
    if (!opponent) {
      errors.push(`Línea vacía o sin rival: "${line.slice(0, 30)}..."`);
      return;
    }
    let date = null;
    let venue = venueDefault;
    if (parts[1]) {
      const parsed = parseImportDate(parts[1]);
      if (parsed) date = parsed;
      else if (/^[aAhH]$/.test(parts[1])) venue = parts[1].toLowerCase() === 'a' ? 'away' : 'home';
    }
    if (parts[2] && /^[aAhH]$/.test(parts[2])) venue = parts[2].toLowerCase() === 'a' ? 'away' : 'home';

    games.push({
      id: nextId++,
      opponent,
      date,
      venue,
      points: { ...defaultPts },
      customBet: undefined,
    });
    added++;
  });

  saveGames(games);
  document.getElementById('importGamesText').value = '';
  renderGames();
  renderPredictionsGameSelect();
  renderResultsGameSelect();
  renderStandingsFilter();
  renderReminders();

  const fb = document.getElementById('importGamesFeedback');
  if (fb) {
    let msg = `${added} partido(s) importados. Edita cada uno para cambiar puntos o apuesta extra.`;
    if (errors.length) msg += ' Errores: ' + errors.slice(0, 3).join('; ');
    fb.textContent = msg;
    fb.classList.add('visible');
    setTimeout(() => { fb.textContent = ''; fb.classList.remove('visible'); }, 5000);
  }
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
  const theme = getTheme();
  document.body.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    themeBtn.addEventListener('click', toggleTheme);
  }
  const refreshBtn = document.getElementById('refreshApp');
  if (refreshBtn) refreshBtn.addEventListener('click', () => { location.reload(); });

  initResultScorerSelects();
  renderParticipants();
  renderGames();
  renderPredictionsGameSelect();
  renderResultsGameSelect();
  renderStandingsFilter();
  renderHistoricalPanel();
  renderStandings();
  renderReminders();
  initTabs();

  document.getElementById('saveParticipants').addEventListener('click', onSaveParticipants);
  document.getElementById('addGame').addEventListener('click', addGame);
  const importGamesBtn = document.getElementById('importGamesBtn');
  if (importGamesBtn) importGamesBtn.addEventListener('click', importGames);
  document.getElementById('savePredictions').addEventListener('click', savePredictionsFromTable);
  document.getElementById('saveResult').addEventListener('click', saveResultFromForm);
  const saveHistBtn = document.getElementById('saveHistorical');
  if (saveHistBtn) saveHistBtn.addEventListener('click', saveHistoricalFromPanel);
  const copyBtn = document.getElementById('copyStandingsWhatsApp');
  if (copyBtn) copyBtn.addEventListener('click', copyStandingsToWhatsApp);

  const exportBtn = document.getElementById('exportData');
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  const importFile = document.getElementById('importFile');
  if (importFile) importFile.addEventListener('change', (e) => { importData(e.target.files[0]); e.target.value = ''; });
  const importTrigger = document.getElementById('importTrigger');
  if (importTrigger) importTrigger.addEventListener('click', () => document.getElementById('importFile').click());

  const editSave = document.getElementById('editGameSave');
  if (editSave) editSave.addEventListener('click', saveEditGame);
  const editCancel = document.getElementById('editGameCancel');
  if (editCancel) editCancel.addEventListener('click', closeEditGameModal);
  const editModal = document.getElementById('editGameModal');
  if (editModal) editModal.addEventListener('click', (e) => { if (e.target.id === 'editGameModal') closeEditGameModal(); });
}

init();

const state = {
  formation: '4-3-3',
  style: 'Equilibrado',
  mode: 'Clássico',
  selectedPlayers: {}, // { indexNoCampo: { jogadorData } }
  currentTeam: null,
  pendingPlayer: null,
  campaign: {
    groups: [],
    currentRound: 1,
    isStarted: false,
    phase: 'groups', // 'groups', 'round16', 'quarterfinals', 'semifinals', 'final', 'finished'
    knockoutMatches: [],
    qualifiedTeams: [],
    champion: null,
    isSimulating: false,
    stats: {
      scorers: {}, // { playerName: count }
      assists: {}  // { playerName: count }
    }
  }
};

const posMap = {
  'GR': ['POR'],
  'D': ['LI', 'LD', 'DFC'],
  'M': ['VOL', 'MC', 'MEI', 'ME', 'MD'],
  'A': ['EI', 'DE', 'DC']
};

const pitch = document.getElementById('pitch');
const infoLine = document.querySelector('.system-info');
const selectedCount = document.querySelector('#selected-count');
const roleList = document.querySelector('#role-list');
const launchButton = document.querySelector('.launch-button');
const configPanel = document.getElementById('config-panel');
const selectionPanel = document.getElementById('selection-panel');
const playerSelectionList = document.getElementById('player-selection-list');
const teamFlag = document.getElementById('current-team-flag');
const teamName = document.getElementById('current-team-name');
const avgAttackEl = document.getElementById('avg-attack');
const avgDefenseEl = document.getElementById('avg-defense');
const totalAvgEl = document.getElementById('total-avg');

function initPlayers() {
  const playersData = formationsData[state.formation];
  const currentPlayers = pitch.querySelectorAll('.player');
  currentPlayers.forEach(p => p.remove());

  playersData.forEach((data, index) => {
    const btn = document.createElement('button');
    btn.className = 'player';
    btn.dataset.role = data.role;
    btn.dataset.index = index;
    btn.textContent = data.role;
    btn.style.top = `${data.top}%`;
    btn.style.left = `${data.left}%`;

    const saved = state.selectedPlayers[index];
    if (saved) {
      btn.classList.add('selected');
      btn.innerHTML = `<div class="player-ovr-small">${saved.ovr}</div><span>${saved.name.split(' ').pop()}</span>`;
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => handleFieldClick(index, data.role));
    }

    pitch.appendChild(btn);
  });

  updateRoleList();
}

function updatePlayersPosition() {
  const playersData = formationsData[state.formation];
  const playerButtons = pitch.querySelectorAll('.player');

  let verticalOffset = 0;
  if (state.style === 'Ofensiva') verticalOffset = -8;
  else if (state.style === 'Defensiva') verticalOffset = 8;

  playerButtons.forEach((btn, index) => {
    const data = playersData[index];
    const offset = data.role === 'POR' ? verticalOffset * 0.3 : verticalOffset;
    
    btn.style.top = `${data.top + offset}%`;
    btn.style.left = `${data.left}%`;
    btn.dataset.role = data.role;
    
    const saved = state.selectedPlayers[index];
    if (!saved) {
      btn.textContent = data.role;
      btn.innerHTML = data.role;
      btn.classList.remove('selected');
      btn.disabled = false;
    }
  });

  updateRoleList();
}

function handleFieldClick(index, role) {
  if (state.pendingPlayer) {
    const isCompatible = posMap[state.pendingPlayer.pos].includes(role);
    if (isCompatible) {
      state.selectedPlayers[index] = state.pendingPlayer;
      state.pendingPlayer = null;
      initPlayers();
      updatePlayersPosition();
      updateSummary();

      const count = Object.keys(state.selectedPlayers).length;
      if (count < 11) {
        rollTeam();
        showSelectionList();
      } else {
        selectionPanel.classList.add('hidden');
        configPanel.classList.remove('hidden');
        launchButton.classList.add('pulse-animation');
      }
    } else {
      const btn = pitch.querySelector(`.player[data-index="${index}"]`);
      btn.animate([{ background: 'rgba(239, 61, 40, 0.8)' }, { background: 'black' }, { background: 'rgba(239, 61, 40, 0.8)' }], { duration: 300 });
    }
  } else {
    openSelection();
  }
}

function openSelection() {
  configPanel.classList.add('hidden');
  selectionPanel.classList.remove('hidden');
  if (!state.currentTeam) rollTeam();
  showSelectionList();
}

function rollTeam() {
  const randomIndex = Math.floor(Math.random() * teamsData.length);
  state.currentTeam = teamsData[randomIndex];
  teamFlag.textContent = state.currentTeam.flag || '🏳️';
  teamName.textContent = state.currentTeam.name;
  state.pendingPlayer = null;
  document.querySelectorAll('.player').forEach(p => p.classList.remove('active-slot'));
}

function showSelectionList() {
  playerSelectionList.innerHTML = '';
  if (!state.currentTeam) return;

  state.currentTeam.players.forEach((player, pIdx) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    li.innerHTML = `<span class="player-num">${pIdx + 1}</span><span class="player-name">${player.name}</span><span class="player-pos">${player.pos}</span><span class="player-ovr">${player.ovr}</span>`;
    li.addEventListener('click', () => {
      state.pendingPlayer = player;
      document.querySelectorAll('.player-item').forEach(item => item.classList.remove('active-selection'));
      li.classList.add('active-selection');
      highlightCompatibleSlots(player.pos);
    });
    playerSelectionList.appendChild(li);
  });
}

function highlightCompatibleSlots(playerPos) {
  const compatibleRoles = posMap[playerPos];
  document.querySelectorAll('.player').forEach(btn => {
    const role = btn.dataset.role;
    const isFilled = state.selectedPlayers[btn.dataset.index];
    if (compatibleRoles.includes(role) && !isFilled) btn.classList.add('active-slot');
    else btn.classList.remove('active-slot');
  });
}

function updateRoleList() {
  const playersData = formationsData[state.formation];
  roleList.innerHTML = '';
  playersData.forEach((data, index) => {
    const li = document.createElement('li');
    const saved = state.selectedPlayers[index];
    if (saved) li.classList.add('filled');
    li.innerHTML = `<span>${data.role}</span><em>${saved ? saved.name : '—'}</em>`;
    roleList.appendChild(li);
  });
}

function updateSummary() {
  const selectedIndices = Object.keys(state.selectedPlayers);
  selectedCount.textContent = selectedIndices.length;
  let totalOvr = 0, attackOvr = 0, attackCount = 0, defenseOvr = 0, defenseCount = 0;

  selectedIndices.forEach(idx => {
    const player = state.selectedPlayers[idx];
    totalOvr += player.ovr;
    if (player.pos === 'A') { attackOvr += player.ovr; attackCount++; }
    else if (player.pos === 'D' || player.pos === 'GR') { defenseOvr += player.ovr; defenseCount++; }
  });

  totalAvgEl.textContent = selectedIndices.length > 0 ? Math.round(totalOvr / selectedIndices.length) : 0;
  avgAttackEl.textContent = attackCount > 0 ? Math.round(attackOvr / attackCount) : 0;
  avgDefenseEl.textContent = defenseCount > 0 ? Math.round(defenseOvr / defenseCount) : 0;
  updateRoleList();
}

function refreshHeader() {
  infoLine.textContent = `${state.formation} · ${state.style} · ${state.mode}`;
}

document.querySelectorAll('[data-group]').forEach((group) => {
  group.addEventListener('click', (event) => {
    const button = event.target.closest('.choice');
    if (!button) return;
    group.querySelectorAll('.choice').forEach((candidate) => candidate.classList.remove('active'));
    button.classList.add('active');
    state[group.dataset.group] = button.dataset.value;
    if (group.dataset.group === 'formation' || group.dataset.group === 'style') updatePlayersPosition();
    refreshHeader();
  });
});

launchButton.addEventListener('click', () => {
  if (Object.keys(state.selectedPlayers).length === 11) {
    startCampaign();
    return;
  }
  rollTeam();
  configPanel.classList.add('hidden');
  selectionPanel.classList.remove('hidden');
  showSelectionList();
});

// --- Lógica de Campanha ---

function startCampaign() {
  document.getElementById('main-game-layout').classList.add('hidden');
  document.getElementById('campaign-layout').classList.remove('hidden');
  
  const allTeams = [...teamsData];
  const shuffled = allTeams.sort(() => 0.5 - Math.random());
  
  const selectedTeams = shuffled.slice(0, 31).map(t => ({
    name: t.name, flag: t.flag, ovr: Math.round(t.players.reduce((s, p) => s + p.ovr, 0) / t.players.length),
    pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, isUser: false,
    players: t.players,
    scorers: []
  }));

  const userOvr = Math.round(Object.values(state.selectedPlayers).reduce((s, p) => s + p.ovr, 0) / 11);
  const userTeam = { 
    name: 'Meu Time', flag: '🚩', ovr: userOvr, pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, isUser: true,
    players: Object.values(state.selectedPlayers),
    scorers: []
  };
  
  const pool = [userTeam, ...selectedTeams].sort(() => 0.5 - Math.random());
  const groupIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  state.campaign.groups = groupIds.map((id, idx) => ({
    id: id,
    teams: pool.slice(idx * 4, idx * 4 + 4)
  }));

  state.campaign.currentRound = 1;
  state.campaign.phase = 'groups';
  simulateRound();
}

function simulateRound() {
  const list = document.getElementById('fixtures-list');
  list.innerHTML = '';
  state.campaign.isSimulating = true;
  document.getElementById('next-round-btn').disabled = true;

  const roundMatches = [];
  state.campaign.groups.forEach(group => {
    const teams = group.teams;
    let pairs = [];
    if (state.campaign.currentRound === 1) pairs = [[0,1], [2,3]];
    else if (state.campaign.currentRound === 2) pairs = [[0,2], [1,3]];
    else if (state.campaign.currentRound === 3) pairs = [[0,3], [1,2]];

    pairs.forEach(p => {
      const t1 = teams[p[0]], t2 = teams[p[1]];
      const score = simulateMatch(t1.ovr, t2.ovr);
      const events = generateMatchEvents(t1, t2, score);
      roundMatches.push({ t1, t2, score, events, currentScore: [0, 0], group: group.id, finished: false });
    });
  });

  roundMatches.sort((a, b) => (b.t1.isUser || b.t2.isUser) - (a.t1.isUser || a.t2.isUser));

  let minute = 0;
  const interval = setInterval(() => {
    minute++;
    renderLiveMatches(roundMatches, minute);
    if (minute >= 90) {
      clearInterval(interval);
      state.campaign.isSimulating = false;
      document.getElementById('next-round-btn').disabled = false;
      roundMatches.forEach(m => updateStats(m.t1, m.t2, m.score));
      if (state.campaign.phase === 'groups') {
        document.getElementById('groups-panel').classList.remove('hidden');
        renderGroups();
        if (state.campaign.currentRound === 3) document.getElementById('next-round-btn').textContent = 'INICIAR MATA-MATA';
      }
    }
  }, 100);
}

function renderLiveMatches(matches, currentMinute) {
  const list = document.getElementById('fixtures-list');
  list.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'live-clock';
  header.innerHTML = `TEMPO DE JOGO: <strong>${currentMinute}'</strong>`;
  list.appendChild(header);

  matches.forEach(m => {
    const liveScore = [0, 0];
    const visibleEvents = m.events.filter(e => e.min <= currentMinute);
    visibleEvents.forEach(e => { if (e.team === m.t1.name) liveScore[0]++; else liveScore[1]++; });

    const isUserMatch = m.t1.isUser || m.t2.isUser;
    const matchContainer = document.createElement('div');
    matchContainer.className = `match-container ${isUserMatch ? 'user-match-highlight' : ''}`;

    const t1Class = m.t1.isUser ? 'team-user' : (isUserMatch ? 'team-opponent' : '');
    const t2Class = m.t2.isUser ? 'team-user' : (isUserMatch ? 'team-opponent' : '');

    let scoreDisplay = `<div class="fixture-score">${liveScore[0]} - ${liveScore[1]}</div>`;
    if (currentMinute >= 90 && m.penaltyScore) {
      scoreDisplay += `<div class="penalty-score-row">(${m.penaltyScore[0]} - ${m.penaltyScore[1]} p.)</div>`;
    }

    let penaltyEventsHtml = "";
    if (currentMinute >= 90 && m.penaltyEvents && m.penaltyEvents.length > 0) {
      penaltyEventsHtml = `<div class="penalty-title">DISPUTA DE PÊNALTIS</div>`;
      penaltyEventsHtml += m.penaltyEvents.map(ev => `
        <div class="match-event ${ev.team === m.t1.name ? 'event-left' : 'event-right'} ${ev.isUser ? 'user-goal' : 'opponent-goal'}">
          <span class="event-text">${ev.success ? '✅' : '❌'} <strong>${ev.team}</strong> - ${ev.player}</span>
        </div>
      `).join('');
    }

    matchContainer.innerHTML = `
      <div class="fixture-item">
        <div class="round">${state.campaign.phase === 'groups' ? 'GRUPO ' + m.group : 'MATA-MATA'}</div>
        <div class="fixture-team t1 ${t1Class}">${m.t1.flag} ${m.t1.name}</div>
        <div class="score-container-ref">${scoreDisplay}</div>
        <div class="fixture-team t2 ${t2Class}">${m.t2.name} ${m.t2.flag}</div>
      </div>
      <div class="fixture-details expanded">
        ${visibleEvents.map(ev => {
          const isT1 = ev.team === m.t1.name;
          return `
            <div class="match-event ${isT1 ? 'event-left' : 'event-right'} ${ev.isUser ? 'user-goal' : 'opponent-goal'}">
              <span class="minute">${ev.min}'</span>
              <span class="event-text">⚽ <strong>${ev.team}</strong> - ${ev.player} ${ev.assist ? '<br><small>Ass: ' + ev.assist + '</small>' : ''}</span>
            </div>
          `;
        }).join('')}
        ${penaltyEventsHtml}
      </div>
    `;
    list.appendChild(matchContainer);
  });
}

function simulateMatch(ovr1, ovr2) {
  const diff = ovr1 - ovr2;
  const base1 = Math.max(0, 1 + Math.floor(diff / 6));
  const base2 = Math.max(0, 1 - Math.floor(diff / 6));
  return [Math.floor(Math.random() * (base1 + 3)), Math.floor(Math.random() * (base2 + 3))];
}

function generateMatchEvents(t1, t2, score) {
  const events = [];
  const trackGoal = (team, player, assist) => {
    if (player) {
      state.campaign.stats.scorers[player] = (state.campaign.stats.scorers[player] || 0) + 1;
      if (!team.scorers.includes(player)) team.scorers.push(player);
    }
    if (assist) state.campaign.stats.assists[assist] = (state.campaign.stats.assists[assist] || 0) + 1;
  };

  const getPlayers = (team) => team.players || [];

  [ [t1, score[0]], [t2, score[1]] ].forEach(([team, goals]) => {
    const players = getPlayers(team);
    for (let i = 0; i < goals; i++) {
      const min = Math.floor(Math.random() * 90) + 1;
      const scorer = players.length > 0 ? players[Math.floor(Math.random() * players.length)].name : team.name;
      let assist = null;
      if (Math.random() > 0.3 && players.length > 1) {
        assist = players.filter(p => p.name !== scorer)[Math.floor(Math.random() * (players.length - 1))].name;
      }
      events.push({ min, team: team.name, player: scorer, assist, isUser: team.isUser });
      trackGoal(team, scorer, assist);
    }
  });

  return events.sort((a, b) => a.min - b.min);
}

function generatePenaltyEvents(t1, t2, pScore) {
  const pEvents = [];
  const p1 = pScore[0], p2 = pScore[1];
  const players1 = t1.players || [], players2 = t2.players || [];
  const rounds = Math.max(5, p1, p2);
  let c1 = 0, c2 = 0;
  for (let i = 0; i < rounds; i++) {
    if (c1 < p1) { pEvents.push({ team: t1.name, player: players1[i % players1.length]?.name || t1.name, success: true, isUser: t1.isUser }); c1++; }
    else if (i < 5 || c1 < c2 + (5-i)) { pEvents.push({ team: t1.name, player: players1[i % players1.length]?.name || t1.name, success: false, isUser: t1.isUser }); }
    if (c2 < p2) { pEvents.push({ team: t2.name, player: players2[i % players2.length]?.name || t2.name, success: true, isUser: t2.isUser }); c2++; }
    else if (i < 5 || c2 < c1 + (5-i)) { pEvents.push({ team: t2.name, player: players2[i % players2.length]?.name || t2.name, success: false, isUser: t2.isUser }); }
    if (i >= 4 && c1 !== c2 && Math.abs(c1-c2) > (rounds-i)) break;
  }
  return pEvents;
}

function updateStats(t1, t2, score) {
  t1.gp += score[0]; t1.gc += score[1];
  t2.gp += score[1]; t2.gc += score[0];
  if (score[0] > score[1]) { t1.pts += 3; t1.v += 1; t2.d += 1; }
  else if (score[0] < score[1]) { t2.pts += 3; t2.v += 1; t1.d += 1; }
  else { t1.pts += 1; t2.pts += 1; t1.e += 1; t2.e += 1; }
}

function renderGroups() {
  const grid = document.getElementById('groups-grid');
  grid.innerHTML = '';
  state.campaign.groups.forEach(group => {
    const table = document.createElement('table');
    table.className = 'group-table';
    const sorted = [...group.teams].sort((a, b) => (b.pts - a.pts) || ((b.gp - b.gc) - (a.gp - a.gc)) || (b.gp - a.gp));
    table.innerHTML = `
      <thead><tr><th>GRUPO ${group.id}</th><th>V</th><th>E</th><th>D</th><th>GF</th><th>GS</th><th>SG</th><th>P</th></tr></thead>
      <tbody>${sorted.map(t => `<tr class="${t.isUser ? 'user-team' : ''}"><td>${t.flag} ${t.name}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.gc}</td><td>${t.gp - t.gc}</td><td><strong>${t.pts}</strong></td></tr>`).join('')}</tbody>
    `;
    grid.appendChild(table);
  });
}

function startKnockoutPhase() {
  state.campaign.qualifiedTeams = [];
  state.campaign.groups.forEach(group => {
    const sorted = [...group.teams].sort((a, b) => (b.pts - a.pts) || ((b.gp - b.gc) - (a.gp - a.gc)) || (b.gp - a.gp));
    state.campaign.qualifiedTeams.push(sorted[0], sorted[1]);
  });
  state.campaign.knockoutMatches = [];
  for (let i = 0; i < 8; i += 2) {
    state.campaign.knockoutMatches.push({ t1: state.campaign.qualifiedTeams[i*2], t2: state.campaign.qualifiedTeams[i*2+3], score: null, events: [] });
    state.campaign.knockoutMatches.push({ t1: state.campaign.qualifiedTeams[i*2+2], t2: state.campaign.qualifiedTeams[i*2+1], score: null, events: [] });
  }
  state.campaign.phase = 'round16';
  document.getElementById('groups-panel').classList.add('hidden');
  document.querySelector('.campaign-header .campaign-info').textContent = 'OITAVAS DE FINAL';
  simulateKnockoutRound();
}

function simulateKnockoutRound() {
  const list = document.getElementById('fixtures-list');
  list.innerHTML = '';
  state.campaign.isSimulating = true;
  document.getElementById('next-round-btn').disabled = true;

  state.campaign.knockoutMatches.forEach(match => {
    match.score = simulateMatch(match.t1.ovr, match.t2.ovr);
    match.events = generateMatchEvents(match.t1, match.t2, match.score);
    if (match.score[0] === match.score[1]) {
      const p1 = Math.floor(Math.random() * 5) + 3;
      const p2 = Math.floor(Math.random() * 5) + 3;
      match.penaltyScore = [p1, p2];
      match.penaltyEvents = generatePenaltyEvents(match.t1, match.t2, match.penaltyScore);
      match.winner = p1 > p2 ? match.t1 : match.t2;
    } else {
      match.winner = match.score[0] > match.score[1] ? match.t1 : match.t2;
      match.penaltyEvents = [];
    }
  });

  state.campaign.knockoutMatches.sort((a, b) => (b.t1.isUser || b.t2.isUser) - (a.t1.isUser || a.t2.isUser));

  let minute = 0;
  const interval = setInterval(() => {
    minute++;
    renderLiveMatches(state.campaign.knockoutMatches, minute);
    if (minute >= 90) {
      clearInterval(interval);
      state.campaign.isSimulating = false;
      document.getElementById('next-round-btn').disabled = false;
      const phaseNames = { 'round16': 'QUARTAS DE FINAL', 'quarterfinals': 'SEMIFINAL', 'semifinals': 'FINAL', 'final': 'CAMPEÃO' };
      document.getElementById('next-round-btn').textContent = phaseNames[state.campaign.phase];
    }
  }, 100);
}

function advanceKnockoutPhase() {
  const winners = state.campaign.knockoutMatches.map(m => m.winner);
  if (state.campaign.phase === 'round16') {
    state.campaign.phase = 'quarterfinals';
    state.campaign.knockoutMatches = [];
    for (let i = 0; i < 4; i++) state.campaign.knockoutMatches.push({ t1: winners[i * 2], t2: winners[i * 2 + 1], score: null, events: [] });
    document.querySelector('.campaign-header .campaign-info').textContent = 'QUARTAS DE FINAL';
  } else if (state.campaign.phase === 'quarterfinals') {
    state.campaign.phase = 'semifinals';
    state.campaign.knockoutMatches = [];
    for (let i = 0; i < 2; i++) state.campaign.knockoutMatches.push({ t1: winners[i * 2], t2: winners[i * 2 + 1], score: null, events: [] });
    document.querySelector('.campaign-header .campaign-info').textContent = 'SEMIFINAL';
  } else if (state.campaign.phase === 'semifinals') {
    state.campaign.phase = 'final';
    state.campaign.knockoutMatches = [{ t1: winners[0], t2: winners[1], score: null, events: [] }];
    document.querySelector('.campaign-header .campaign-info').textContent = 'FINAL';
  } else if (state.campaign.phase === 'final') {
    state.campaign.champion = winners[0];
    state.campaign.phase = 'finished';
    showChampionScreen();
    return;
  }
  simulateKnockoutRound();
}

function showChampionScreen() {
  const list = document.getElementById('fixtures-list');
  list.innerHTML = '';
  const champion = state.campaign.champion;
  const card = document.createElement('div');
  card.className = 'champion-card-final';
  card.innerHTML = `
    <div class="champion-trophy">🏆</div>
    <div class="champion-name-big">${champion.flag} ${champion.name}</div>
    <div class="champion-title">CAMPEÃO DA COPA DO MUNDO</div>
    <div class="champion-players-list">
      ${champion.players.map(p => `<div class="champ-player-item ${champion.scorers.includes(p.name) ? 'gold-text' : ''}">${p.name}</div>`).join('')}
    </div>
    <div class="stats-buttons-row">
      <button onclick="showStats('scorers')" class="stats-btn">ARTILHARIA</button>
      <button onclick="showStats('assists')" class="stats-btn">ASSISTÊNCIAS</button>
    </div>
    <button onclick="location.reload()" class="restart-btn">NOVO TORNEIO</button>
  `;
  list.appendChild(card);
  document.getElementById('groups-panel').classList.add('hidden');
  document.getElementById('next-round-btn').classList.add('hidden');
}

window.showStats = function(type) {
  const stats = state.campaign.stats[type];
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const title = type === 'scorers' ? 'ARTILHARIA' : 'ASSISTÊNCIAS';
  const listHtml = sorted.map(([name, count], i) => `<div>${i+1}. ${name} - ${count}</div>`).join('');
  const modal = document.createElement('div');
  modal.className = 'stats-modal';
  modal.innerHTML = `<div class="modal-content"><h3>${title}</h3><div class="modal-list">${listHtml}</div><button onclick="this.parentElement.parentElement.remove()" class="close-btn">FECHAR</button></div>`;
  document.body.appendChild(modal);
};

document.getElementById('next-round-btn').addEventListener('click', () => {
  if (state.campaign.phase === 'groups') {
    if (state.campaign.currentRound < 3) { state.campaign.currentRound++; simulateRound(); }
    else startKnockoutPhase();
  } else if (state.campaign.phase !== 'finished') {
    advanceKnockoutPhase();
  }
});

initPlayers();
refreshHeader();
updateSummary();

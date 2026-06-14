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
    isSimulating: false
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

// --- Lógica de Campanha Randômica ---

function startCampaign() {
  document.getElementById('main-game-layout').classList.add('hidden');
  document.getElementById('campaign-layout').classList.remove('hidden');
  
  const allTeams = [...teamsData];
  const shuffled = allTeams.sort(() => 0.5 - Math.random());
  
  const selectedTeams = shuffled.slice(0, 31).map(t => ({
    name: t.name, flag: t.flag, ovr: Math.round(t.players.reduce((s, p) => s + p.ovr, 0) / t.players.length),
    pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, isUser: false,
    players: t.players
  }));

  const userOvr = Math.round(Object.values(state.selectedPlayers).reduce((s, p) => s + p.ovr, 0) / 11);
  const userTeam = { name: 'Meu Time', flag: '🚩', ovr: userOvr, pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, isUser: true };
  
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

  roundMatches.sort((a, b) => {
    const aIsUser = a.t1.isUser || a.t2.isUser;
    const bIsUser = b.t1.isUser || b.t2.isUser;
    return bIsUser - aIsUser;
  });

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
    visibleEvents.forEach(e => {
      if (e.team === m.t1.name) liveScore[0]++;
      else liveScore[1]++;
    });

    const isUserMatch = m.t1.isUser || m.t2.isUser;
    const matchContainer = document.createElement('div');
    matchContainer.className = `match-container ${isUserMatch ? 'user-match-highlight' : ''}`;

    const item = document.createElement('div');
    item.className = 'fixture-item';
    
    const t1Class = m.t1.isUser ? 'team-user' : (isUserMatch ? 'team-opponent' : '');
    const t2Class = m.t2.isUser ? 'team-user' : (isUserMatch ? 'team-opponent' : '');

    item.innerHTML = `
      <div class="round">${state.campaign.phase === 'groups' ? 'GRUPO ' + m.group : 'MATA-MATA'}</div>
      <div class="fixture-team t1 ${t1Class}">${m.t1.flag} ${m.t1.name}</div>
      <div class="fixture-score">${liveScore[0]} - ${liveScore[1]}</div>
      <div class="fixture-team t2 ${t2Class}">${m.t2.name} ${m.t2.flag}</div>
    `;

    const details = document.createElement('div');
    details.className = 'fixture-details expanded';
    details.innerHTML = visibleEvents.map(ev => {
      const isT1 = ev.team === m.t1.name;
      return `
        <div class="match-event ${isT1 ? 'event-left' : 'event-right'} ${ev.isUser ? 'user-goal' : 'opponent-goal'}">
          <span class="minute">${ev.min}'</span>
          <span class="event-text">⚽ <strong>${ev.team}</strong> - ${ev.player}</span>
        </div>
      `;
    }).join('');

    matchContainer.appendChild(item);
    matchContainer.appendChild(details);
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
  const userPlayers = Object.values(state.selectedPlayers);
  
  for (let i = 0; i < score[0]; i++) {
    const min = Math.floor(Math.random() * 90) + 1;
    let playerName = "";
    if (t1.isUser) {
      const scorers = userPlayers.filter(p => p.pos === 'A' || p.pos === 'M');
      const pool = scorers.length > 0 ? scorers : userPlayers;
      playerName = pool[Math.floor(Math.random() * pool.length)].name;
    } else {
      const pool = t1.players || [];
      playerName = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)].name : t1.name;
    }
    events.push({ min, team: t1.name, player: playerName, isUser: t1.isUser });
  }

  for (let i = 0; i < score[1]; i++) {
    const min = Math.floor(Math.random() * 90) + 1;
    let playerName = "";
    if (t2.isUser) {
      const scorers = userPlayers.filter(p => p.pos === 'A' || p.pos === 'M');
      const pool = scorers.length > 0 ? scorers : userPlayers;
      playerName = pool[Math.floor(Math.random() * pool.length)].name;
    } else {
      const pool = t2.players || [];
      playerName = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)].name : t2.name;
    }
    events.push({ min, team: t2.name, player: playerName, isUser: t2.isUser });
  }

  return events.sort((a, b) => a.min - b.min);
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
    const sorted = [...group.teams].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const sgB = b.gp - b.gc;
      const sgA = a.gp - a.gc;
      if (sgB !== sgA) return sgB - sgA;
      return b.gp - a.gp;
    });
    
    table.innerHTML = `
      <thead><tr><th>GRUPO ${group.id}</th><th>V</th><th>E</th><th>D</th><th>GF</th><th>GS</th><th>SG</th><th>P</th></tr></thead>
      <tbody>
        ${sorted.map(t => `
          <tr class="${t.isUser ? 'user-team' : ''}">
            <td>${t.flag} ${t.name}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.gc}</td><td>${t.gp - t.gc}</td><td><strong>${t.pts}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    grid.appendChild(table);
  });
}

// ========== FASE DE MATA-MATA ==========

function startKnockoutPhase() {
  state.campaign.qualifiedTeams = [];
  state.campaign.groups.forEach(group => {
    const sorted = [...group.teams].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const sgB = b.gp - b.gc;
      const sgA = a.gp - a.gc;
      if (sgB !== sgA) return sgB - sgA;
      return b.gp - a.gp;
    });
    state.campaign.qualifiedTeams.push(sorted[0]);
    state.campaign.qualifiedTeams.push(sorted[1]);
  });

  state.campaign.knockoutMatches = [];
  for (let i = 0; i < 8; i += 2) {
    state.campaign.knockoutMatches.push({ t1: state.campaign.qualifiedTeams[i*2], t2: state.campaign.qualifiedTeams[i*2+3], score: null, events: [], finished: false });
    state.campaign.knockoutMatches.push({ t1: state.campaign.qualifiedTeams[i*2+2], t2: state.campaign.qualifiedTeams[i*2+1], score: null, events: [], finished: false });
  }

  state.campaign.phase = 'round16';
  state.campaign.currentRound = 1;
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
      match.winner = p1 > p2 ? match.t1 : match.t2;
    } else {
      match.winner = match.score[0] > match.score[1] ? match.t1 : match.t2;
    }
  });

  state.campaign.knockoutMatches.sort((a, b) => {
    const aIsUser = a.t1.isUser || a.t2.isUser;
    const bIsUser = b.t1.isUser || b.t2.isUser;
    return bIsUser - aIsUser;
  });

  let minute = 0;
  const interval = setInterval(() => {
    minute++;
    renderLiveKnockout(state.campaign.knockoutMatches, minute);
    
    if (minute >= 90) {
      clearInterval(interval);
      state.campaign.isSimulating = false;
      document.getElementById('next-round-btn').disabled = false;
      const phaseNames = { 'round16': 'QUARTAS DE FINAL', 'quarterfinals': 'SEMIFINAL', 'semifinals': 'FINAL', 'final': 'VER CAMPEÃO' };
      document.getElementById('next-round-btn').textContent = phaseNames[state.campaign.phase];
    }
  }, 100);
}

function renderLiveKnockout(matches, currentMinute) {
  const list = document.getElementById('fixtures-list');
  list.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'live-clock';
  header.innerHTML = `TEMPO DE JOGO: <strong>${currentMinute}'</strong>`;
  list.appendChild(header);

  matches.forEach((m, idx) => {
    const liveScore = [0, 0];
    const visibleEvents = m.events.filter(e => e.min <= currentMinute);
    visibleEvents.forEach(e => { if (e.team === m.t1.name) liveScore[0]++; else liveScore[1]++; });

    const isUserMatch = m.t1.isUser || m.t2.isUser;
    const matchContainer = document.createElement('div');
    matchContainer.className = `match-container ${isUserMatch ? 'user-match-highlight' : ''}`;

    const item = document.createElement('div');
    item.className = 'fixture-item';
    
    const t1Class = m.t1.isUser ? 'team-user' : (isUserMatch ? 'team-opponent' : '');
    const t2Class = m.t2.isUser ? 'team-user' : (isUserMatch ? 'team-opponent' : '');

    let scoreText = `${liveScore[0]} - ${liveScore[1]}`;
    if (currentMinute >= 90 && m.penaltyScore) {
      scoreText += ` (${m.penaltyScore[0]} - ${m.penaltyScore[1]} p.)`;
    }

    item.innerHTML = `
      <div class="round">M${idx + 1}</div>
      <div class="fixture-team t1 ${t1Class}">${m.t1.flag} ${m.t1.name}</div>
      <div class="fixture-score">${scoreText}</div>
      <div class="fixture-team t2 ${t2Class}">${m.t2.name} ${m.t2.flag}</div>
    `;

    const details = document.createElement('div');
    details.className = 'fixture-details expanded';
    details.innerHTML = visibleEvents.map(ev => {
      const isT1 = ev.team === m.t1.name;
      return `<div class="match-event ${isT1 ? 'event-left' : 'event-right'} ${ev.isUser ? 'user-goal' : 'opponent-goal'}">
        <span class="minute">${ev.min}'</span><span class="event-text">⚽ <strong>${ev.team}</strong> - ${ev.player}</span>
      </div>`;
    }).join('');

    matchContainer.appendChild(item);
    matchContainer.appendChild(details);
    list.appendChild(matchContainer);
  });
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
  const championContainer = document.createElement('div');
  championContainer.style.cssText = `text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #d2bb57 0%, #ef3d28 100%); border-radius: 8px; color: white;`;
  championContainer.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px;">${champion.flag}</div>
    <h2 style="font-size: 48px; margin: 0 0 20px 0; font-weight: 900;">CAMPEÃO!</h2>
    <p style="font-size: 32px; margin: 0 0 10px 0; font-weight: 800;">${champion.name}</p>
    ${champion.isUser ? '<p style="font-size: 24px; margin-top: 20px; font-weight: 900;">🏆 VOCÊ GANHOU A COPA! 🏆</p>' : ''}
  `;
  list.appendChild(championContainer);
  document.getElementById('next-round-btn').textContent = 'NOVO TORNEIO';
  document.getElementById('next-round-btn').onclick = () => location.reload();
}

document.getElementById('next-round-btn').addEventListener('click', () => {
  if (state.campaign.phase === 'groups') {
    if (state.campaign.currentRound < 3) {
      state.campaign.currentRound++;
      simulateRound();
    } else {
      startKnockoutPhase();
    }
  } else if (state.campaign.phase !== 'finished') {
    advanceKnockoutPhase();
  }
});

initPlayers();
refreshHeader();
updateSummary();

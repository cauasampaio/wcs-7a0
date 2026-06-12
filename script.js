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
    isStarted: false
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
  
  // Gerar Grupos Randômicos
  const allTeams = [...teamsData];
  const shuffled = allTeams.sort(() => 0.5 - Math.random());
  
  // Selecionar 15 times aleatórios + Meu Time
  const selectedTeams = shuffled.slice(0, 15).map(t => ({
    name: t.name, flag: t.flag, ovr: Math.round(t.players.reduce((s, p) => s + p.ovr, 0) / t.players.length),
    pts: 0, gp: 0, gc: 0, isUser: false
  }));

  const userOvr = Math.round(Object.values(state.selectedPlayers).reduce((s, p) => s + p.ovr, 0) / 11);
  const userTeam = { name: 'Meu Time', flag: '🚩', ovr: userOvr, pts: 0, gp: 0, gc: 0, isUser: true };
  
  const pool = [userTeam, ...selectedTeams].sort(() => 0.5 - Math.random());
  
  state.campaign.groups = [
    { id: 'A', teams: pool.slice(0, 4) },
    { id: 'B', teams: pool.slice(4, 8) },
    { id: 'C', teams: pool.slice(8, 12) },
    { id: 'D', teams: pool.slice(12, 16) }
  ];

  state.campaign.currentRound = 1;
  renderFixtures();
}

function simulateMatch(ovr1, ovr2) {
  const diff = ovr1 - ovr2;
  const base1 = Math.max(0, 1 + Math.floor(diff / 6));
  const base2 = Math.max(0, 1 - Math.floor(diff / 6));
  return [Math.floor(Math.random() * (base1 + 3)), Math.floor(Math.random() * (base2 + 3))];
}

function renderFixtures() {
  const list = document.getElementById('fixtures-list');
  list.innerHTML = '';
  
  state.campaign.groups.forEach(group => {
    const teams = group.teams;
    let pairs = [];
    if (state.campaign.currentRound === 1) pairs = [[0,1], [2,3]];
    else if (state.campaign.currentRound === 2) pairs = [[0,2], [1,3]];
    else if (state.campaign.currentRound === 3) pairs = [[0,3], [1,2]];

    pairs.forEach(p => {
      const t1 = teams[p[0]], t2 = teams[p[1]];
      const score = simulateMatch(t1.ovr, t2.ovr);
      updateStats(t1, t2, score);

      const matchContainer = document.createElement('div');
      matchContainer.className = 'match-container';

      const item = document.createElement('div');
      item.className = 'fixture-item';
      item.innerHTML = `
        <div class="round">GRUPO ${group.id} - R${state.campaign.currentRound}</div>
        <div class="fixture-team t1">${t1.flag} ${t1.name}</div>
        <div class="fixture-score">${score[0]} - ${score[1]}</div>
        <div class="fixture-team t2">${t2.name} ${t2.flag}</div>
      `;

      const details = document.createElement('div');
      details.className = 'fixture-details';
      
      // Gerar lances se for jogo do usuário
      if (t1.isUser || t2.isUser) {
        const events = generateMatchEvents(t1, t2, score);
        details.innerHTML = events.map(ev => `
          <div class="match-event">
            <span class="minute">${ev.min}'</span>
            <span class="event-icon">⚽</span>
            <span class="event-text"><strong>${ev.player}</strong> (${ev.team})</span>
          </div>
        `).join('');
        
        item.addEventListener('click', () => {
          details.classList.toggle('expanded');
        });
      }

      matchContainer.appendChild(item);
      matchContainer.appendChild(details);
      list.appendChild(matchContainer);
    });
  });

  if (state.campaign.currentRound === 3) {
    document.getElementById('groups-panel').classList.remove('hidden');
    renderGroups();
    document.getElementById('next-round-btn').textContent = 'FINALIZAR TORNEIO';
  }
}

function generateMatchEvents(t1, t2, score) {
  const events = [];
  const userPlayers = Object.values(state.selectedPlayers);
  
  // Gols do Time 1
  for (let i = 0; i < score[0]; i++) {
    const min = Math.floor(Math.random() * 90) + 1;
    let playerName = "Jogador Desconhecido";
    if (t1.isUser) {
      // Sorteia um jogador do usuário (prioridade para atacantes e meias)
      const scorers = userPlayers.filter(p => p.pos === 'A' || p.pos === 'M');
      const pool = scorers.length > 0 ? scorers : userPlayers;
      playerName = pool[Math.floor(Math.random() * pool.length)].name;
    } else {
      playerName = "Oponente";
    }
    events.push({ min, team: t1.name, player: playerName });
  }

  // Gols do Time 2
  for (let i = 0; i < score[1]; i++) {
    const min = Math.floor(Math.random() * 90) + 1;
    let playerName = "Jogador Desconhecido";
    if (t2.isUser) {
      const scorers = userPlayers.filter(p => p.pos === 'A' || p.pos === 'M');
      const pool = scorers.length > 0 ? scorers : userPlayers;
      playerName = pool[Math.floor(Math.random() * pool.length)].name;
    } else {
      playerName = "Oponente";
    }
    events.push({ min, team: t2.name, player: playerName });
  }

  return events.sort((a, b) => a.min - b.min);
}

function updateStats(t1, t2, score) {
  t1.gp += score[0]; t1.gc += score[1];
  t2.gp += score[1]; t2.gc += score[0];
  if (score[0] > score[1]) t1.pts += 3;
  else if (score[0] < score[1]) t2.pts += 3;
  else { t1.pts += 1; t2.pts += 1; }
}

function renderGroups() {
  const grid = document.getElementById('groups-grid');
  grid.innerHTML = '';
  state.campaign.groups.forEach(group => {
    const table = document.createElement('table');
    table.className = 'group-table';
    const sorted = [...group.teams].sort((a, b) => (b.pts !== a.pts) ? (b.pts - a.pts) : ((b.gp - b.gc) - (a.gp - a.gc)));
    table.innerHTML = `<thead><tr><th>GRUPO ${group.id}</th><th>P</th><th>GP</th><th>GC</th></tr></thead><tbody>${sorted.map(t => `<tr class="${t.isUser ? 'user-team' : ''}"><td>${t.flag} ${t.name}</td><td>${t.pts}</td><td>${t.gp}</td><td>${t.gc}</td></tr>`).join('')}</tbody>`;
    grid.appendChild(table);
  });
}

document.getElementById('next-round-btn').addEventListener('click', () => {
  if (state.campaign.currentRound < 3) {
    state.campaign.currentRound++;
    renderFixtures();
  } else {
    location.reload();
  }
});

initPlayers();
refreshHeader();
updateSummary();

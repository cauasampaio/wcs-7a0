// Estado Global
let currentTeam = null;
let currentFormation = "4-3-3";
let selectedPlayer = null;
let squad = {}; // { spotId: { player, teamName } }
let usedTeams = new Set();

// Elementos DOM
const teamNameEl = document.getElementById('team-name');
const playersListEl = document.getElementById('players-list');
const tacticalSpotsEl = document.getElementById('tactical-spots');
const positionsListEl = document.getElementById('positions-list');
const squadCountEl = document.getElementById('squad-count');
const progressFillEl = document.getElementById('progress-fill');
const startBtn = document.getElementById('start-tournament-btn');
const formationBtns = document.querySelectorAll('.formation-btn');

// Inicialização
function init() {
    loadNewTeam();
    renderFormation();
    setupEventListeners();
}

async function loadNewTeam() {
    // Se todas as seleções foram usadas, reseta
    if (usedTeams.size >= teamsData.length) usedTeams.clear();

    let availableTeams = teamsData.filter(t => !usedTeams.has(t.name));
    
    // Animação de Sorteio
    const duration = 800;
    const interval = 50;
    const steps = duration / interval;
    
    for (let i = 0; i < steps; i++) {
        const tempTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        teamNameEl.innerHTML = `${tempTeam.flag} ${tempTeam.name.toUpperCase()}`;
        teamNameEl.style.opacity = "0.5";
        await new Promise(r => setTimeout(r, interval));
    }

    currentTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    usedTeams.add(currentTeam.name);
    
    teamNameEl.innerHTML = `${currentTeam.flag} ${currentTeam.name.toUpperCase()}`;
    teamNameEl.style.opacity = "1";
    renderPlayers();
}

function renderPlayers() {
    playersListEl.innerHTML = '';
    
    // Verificar quais posições ainda estão disponíveis na formação atual
    const availablePositions = formations[currentFormation]
        .filter(spot => !squad[spot.id])
        .map(spot => spot.pos);

    currentTeam.players.forEach(player => {
        const isAvailable = availablePositions.includes(player.pos);
        const div = document.createElement('div');
        div.className = `player-item ${!isAvailable ? 'disabled' : ''}`;
        div.innerHTML = `
            <div class="player-info-main">
                <span class="player-ovr-badge">${player.ovr}</span>
                <span>${player.name}</span>
            </div>
            <span class="player-pos-badge">${player.pos}</span>
        `;
        
        if (isAvailable) {
            div.onclick = () => selectPlayer(player, div);
        } else {
            div.onclick = null;
        }
        
        playersListEl.appendChild(div);
    });
}

function selectPlayer(player, element) {
    // Desmarcar anterior
    document.querySelectorAll('.player-item').forEach(el => el.classList.remove('selected'));
    
    selectedPlayer = player;
    element.classList.add('selected');
    
    // Highlight compatíveis no campo e na lista da direita
    highlightCompatibleSpots(player.pos);
}

function highlightCompatibleSpots(pos) {
    // Highlight no campo
    document.querySelectorAll('.tactical-spot').forEach(spot => {
        spot.classList.remove('highlight');
        if (spot.dataset.pos === pos && !squad[spot.id]) {
            spot.classList.add('highlight');
        }
    });

    // Highlight na lista da direita
    document.querySelectorAll('.pos-item').forEach(item => {
        item.classList.remove('highlight');
        const spotId = item.querySelector('.pos-label').textContent;
        const spotData = formations[currentFormation].find(s => s.id === spotId);
        if (spotData && spotData.pos === pos && !squad[spotId]) {
            item.classList.add('highlight');
            item.onclick = () => {
                const spot = formations[currentFormation].find(s => s.id === spotId);
                placePlayer(spot);
            };
        } else {
            item.onclick = null;
        }
    });
}

function renderFormation() {
    tacticalSpotsEl.innerHTML = '';
    positionsListEl.innerHTML = '';
    
    const spots = formations[currentFormation];
    spots.forEach(spot => {
        // Render spot no campo
        const spotDiv = document.createElement('div');
        spotDiv.id = spot.id;
        spotDiv.className = 'tactical-spot';
        spotDiv.style.top = `${spot.top}%`;
        spotDiv.style.left = `${spot.left}%`;
        spotDiv.dataset.pos = spot.pos;
        spotDiv.textContent = spot.id;
        
        if (squad[spot.id]) {
            spotDiv.classList.add('occupied');
            const p = squad[spot.id].player;
            const shortName = p.name.split(' ').pop().substring(0, 5).toUpperCase();
            spotDiv.innerHTML = `<span class="spot-ovr">${p.ovr}</span><span class="spot-name">${shortName}</span>`;
        }

        spotDiv.onclick = () => placePlayer(spot);
        tacticalSpotsEl.appendChild(spotDiv);

        // Render item na lista da direita
        const posItem = document.createElement('div');
        posItem.className = 'pos-item';
        const playerInPos = squad[spot.id];
        posItem.innerHTML = `
            <span class="pos-label">${spot.id}</span>
            <span class="pos-player">${playerInPos ? playerInPos.player.name : '—'}</span>
        `;
        positionsListEl.appendChild(posItem);
    });

    updateProgress();
}

function placePlayer(spot) {
    if (!selectedPlayer) return;
    if (spot.pos !== selectedPlayer.pos) {
        alert(`Este jogador é ${selectedPlayer.pos}. Só pode jogar em posições ${selectedPlayer.pos}.`);
        return;
    }
    if (squad[spot.id]) {
        // Substituição desabilitada conforme pedido do usuário
        return;
    }

    // Escalar
    squad[spot.id] = {
        player: selectedPlayer,
        teamName: currentTeam.name
    };

    selectedPlayer = null;
    renderFormation();
    updateProgress();
    
    // Avanço automático para próxima seleção
    setTimeout(loadNewTeam, 300);
}

function updateProgress() {
    const count = Object.keys(squad).length;
    squadCountEl.textContent = `${count} / 11`;
    progressFillEl.style.width = `${(count / 11) * 100}%`;
    startBtn.disabled = count < 11;
}

function setupEventListeners() {
    formationBtns.forEach(btn => {
        btn.onclick = () => {
            formationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormation = btn.dataset.formation;
            document.getElementById('current-formation-display').textContent = `${currentFormation} · EQUILIBRADO · CLÁSSICO`;
            renderFormation();
        };
    });

    document.getElementById('skip-team-btn').onclick = loadNewTeam;
    document.getElementById('random-team-btn').onclick = loadNewTeam;
    
    document.getElementById('clear-btn').onclick = () => {
        if (confirm("Limpar toda a escalação?")) {
            squad = {};
            renderFormation();
            updateProgress();
        }
    };

    document.getElementById('start-tournament-btn').onclick = startTournament;
}

// Iniciar
window.onload = init;

// --- Simulação do Torneio ---
async function startTournament() {
    const modal = document.getElementById('tournament-modal');
    const resultsDiv = document.getElementById('tournament-results');
    modal.classList.remove('hidden');
    resultsDiv.innerHTML = "<h2>Simulando Torneio...</h2>";

    const simulation = runSimulation();
    await renderSimulationResults(simulation);
}

document.querySelector('.close-modal').onclick = () => {
    document.getElementById('tournament-modal').classList.add('hidden');
};

function runSimulation() {
    // O time do usuário é identificado como "Seu Time"
    const userTeamOriginalName = Object.values(squad)[0].teamName;
    
    // 1. Sortear 32 seleções (as 11 do usuário + 21 aleatórias do banco histórico)
    let tournamentTeams = [userTeamOriginalName];
    
    let otherTeams = teamsData.filter(t => t.name !== userTeamOriginalName);
    otherTeams.sort(() => 0.5 - Math.random());
    
    for(let i=0; i < 31 && i < otherTeams.length; i++) {
        tournamentTeams.push(otherTeams[i].name);
    }

    // 2. Dividir em 8 grupos e renomear o time do usuário
    tournamentTeams.sort(() => 0.5 - Math.random());
    let groups = [];
    for(let i=0; i<8; i++) {
        groups.push({
            name: String.fromCharCode(65 + i),
            teams: tournamentTeams.slice(i*4, i*4 + 4).map(name => {
                let displayName = (name === userTeamOriginalName) ? "Seu Time" : name;
                return { name: displayName, originalName: name, pts: 0, gp: 0, gc: 0 };
            })
        });
    }

    // 3. Simular Fase de Grupos com eventos para o "Seu Time"
    let groupMatches = [];
    groups.forEach(group => {
        for(let i=0; i<4; i++) {
            for(let j=i+1; j<4; j++) {
                let t1 = group.teams[i];
                let t2 = group.teams[j];
                let match = simulateMatch(t1, t2);
                groupMatches.push({ ...match, groupName: group.name });
                
                t1.gp += match.g1; t1.gc += match.g2;
                t2.gp += match.g2; t2.gc += match.g1;
                if(match.g1 > match.g2) t1.pts += 3;
                else if(match.g2 > match.g1) t2.pts += 3;
                else { t1.pts += 1; t2.pts += 1; }
            }
        }
        group.teams.sort((a, b) => b.pts - a.pts || (b.gp - b.gc) - (a.gp - a.gc));
    });

    // 4. Mata-Mata
    let knockout = { oitavas: [], quartas: [], semi: [], final: [] };

    const pairings = [
        [0, 1, 1, 0], [2, 1, 3, 0], [4, 1, 5, 0], [6, 1, 7, 0],
        [1, 1, 0, 0], [3, 1, 2, 0], [5, 1, 4, 0], [7, 1, 6, 0]
    ];
    
    let oitavasWinners = [];
    pairings.forEach(p => {
        let t1 = groups[p[0]].teams[p[1]];
        let t2 = groups[p[2]].teams[p[3]];
        let match = simulateMatch(t1, t2, true);
        knockout.oitavas.push(match);
        oitavasWinners.push(match.winner);
    });

    let quartasWinners = [];
    for(let i=0; i<oitavasWinners.length; i+=2) {
        let match = simulateMatch(oitavasWinners[i], oitavasWinners[i+1], true);
        knockout.quartas.push(match);
        quartasWinners.push(match.winner);
    }

    let semiWinners = [];
    for(let i=0; i<quartasWinners.length; i+=2) {
        let match = simulateMatch(quartasWinners[i], quartasWinners[i+1], true);
        knockout.semi.push(match);
        semiWinners.push(match.winner);
    }

    let finalMatch = simulateMatch(semiWinners[0], semiWinners[1], true);
    knockout.final.push(finalMatch);

    const allPlayers = Object.values(squad).map(s => s.player.name);
    return { groups, groupMatches, knockout, topScorer: allPlayers[0], topAssistant: allPlayers[1] };
}

function simulateMatch(t1, t2, isKnockout = false) {
    let g1 = Math.floor(Math.random() * 4);
    let g2 = Math.floor(Math.random() * 4);
    
    if (isKnockout && g1 === g2) {
        if (Math.random() > 0.5) g1++; else g2++;
    }
    
    let events = [];
    const isUserMatch = (t1.name === "Seu Time" || t2.name === "Seu Time");
    
    if (isUserMatch) {
        // Gerar tempos aleatórios para os gols
        for(let i=0; i<g1; i++) events.push({ time: Math.floor(Math.random() * 90), team: t1.name });
        for(let i=0; i<g2; i++) events.push({ time: Math.floor(Math.random() * 90), team: t2.name });
        events.sort((a, b) => a.time - b.time);
    }

    return {
        t1: t1.name, t2: t2.name,
        g1, g2,
        events,
        isUserMatch,
        winner: g1 > g2 ? t1 : t2
    };
}

async function renderSimulationResults(sim) {
    const resultsDiv = document.getElementById('tournament-results');
    resultsDiv.innerHTML = `<div class="simulation-container">
        <h2>A CAMPANHA</h2>
        <div id="live-simulation"></div>
    </div>`;

    const liveDiv = document.getElementById('live-simulation');

    // 1. Fase de Grupos
    liveDiv.innerHTML += `<h3>FASE DE GRUPOS</h3>`;
    const userGroup = sim.groups.find(g => g.teams.some(t => t.name === "Seu Time"));
    const userMatches = sim.groupMatches.filter(m => m.isUserMatch);

    for (let match of userMatches) {
        await renderLiveMatch(liveDiv, match);
    }

    // Mostrar tabelas dos grupos
    let groupsHtml = `<div class="group-stage">`;
    sim.groups.forEach(g => {
        groupsHtml += `
            <div class="group-card">
                <h4>GRUPO ${g.name}</h4>
                <table class="group-table">
                    ${g.teams.map((t, i) => `
                        <tr class="${i < 2 ? 'qualified' : ''} ${t.name === 'Seu Time' ? 'user-team-highlight' : ''}">
                            <td>${i+1}. ${t.name}</td>
                            <td><b>${t.pts}</b></td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    });
    groupsHtml += `</div>`;
    liveDiv.innerHTML += groupsHtml;

    // 2. Mata-Mata
    liveDiv.innerHTML += `<div class="knockout-stage"><h3>MATA-MATA</h3></div>`;
    const knockoutDiv = liveDiv.querySelector('.knockout-stage');
    
    const phases = [
        { key: 'oitavas', label: 'OITAVAS' },
        { key: 'quartas', label: 'QUARTAS' },
        { key: 'semi', label: 'SEMI' },
        { key: 'final', label: 'FINAL' }
    ];

    let userStillIn = true;
    for (let phase of phases) {
        let phaseDiv = document.createElement('div');
        phaseDiv.className = 'knockout-phase';
        phaseDiv.innerHTML = `<h4>${phase.label}</h4>`;
        knockoutDiv.appendChild(phaseDiv);

        for (let match of sim.knockout[phase.key]) {
            if (match.isUserMatch && userStillIn) {
                await renderLiveMatch(phaseDiv, match);
                if (match.winner.name !== "Seu Time") userStillIn = false;
            } else {
                phaseDiv.innerHTML += `
                    <div class="match-item">
                        <span class="match-team ${match.g1 > match.g2 ? 'winner' : ''}">${match.t1}</span>
                        <span class="match-score">${match.g1} - ${match.g2}</span>
                        <span class="match-team ${match.g2 > match.g1 ? 'winner' : ''}">${match.t2}</span>
                    </div>
                `;
            }
        }
    }

    // 3. Estatísticas Finais
    const finalWinner = sim.knockout.final[0].winner.name;
    liveDiv.innerHTML += `
        <div class="stats-section">
            <div class="stat-card">
                <h3>ARTILHEIRO</h3>
                <p><b>${sim.topScorer}</b></p>
                <small>6 Gols</small>
            </div>
            <div class="stat-card">
                <h3>ASSISTÊNCIAS</h3>
                <p><b>${sim.topAssistant}</b></p>
                <small>4 Assistências</small>
            </div>
            <div class="stat-card">
                <h3>DESEMPENHO</h3>
                <p><b>${finalWinner === "Seu Time" ? 'CAMPEÃO!' : 'FIM DA LINHA'}</b></p>
                <small>Copa do Mundo 2026</small>
            </div>
        </div>
    `;
}

async function renderLiveMatch(container, match) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match-item user-team-highlight';
    matchDiv.innerHTML = `
        <span class="match-team">${match.t1}</span>
        <span class="match-score" id="score-${match.t1}-${match.t2}">0 - 0</span>
        <span class="match-team">${match.t2}</span>
        <div class="match-events" id="events-${match.t1}-${match.t2}"></div>
    `;
    container.appendChild(matchDiv);

    const scoreEl = matchDiv.querySelector('.match-score');
    const eventsEl = matchDiv.querySelector('.match-events');
    
    let curG1 = 0;
    let curG2 = 0;

    // Simular o tempo e os gols
    for (let event of match.events) {
        await new Promise(r => setTimeout(r, 800)); // Delay entre gols
        if (event.team === match.t1) curG1++; else curG2++;
        scoreEl.textContent = `${curG1} - ${curG2}`;
        eventsEl.innerHTML += `<div class="event-item">⚽ GOL! ${event.team} (${event.time}')</div>`;
    }
    
    await new Promise(r => setTimeout(r, 500));
    scoreEl.classList.add('winner-highlight');
}

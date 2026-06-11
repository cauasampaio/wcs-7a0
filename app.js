// World Cup Simulator - Main Application
class WorldCupSimulator {
    constructor() {
        this.selectedTeam = null;
        this.selectedTeamData = null;
        this.formation = '4-3-3';
        this.lineup = [];
        this.selectedPlayer = null;
        this.tournament = null;
        this.allTeams = Object.keys(WORLD_CUP_DATA.allTeams);
        this.currentTeamIndex = 0;
        this.init();
    }

    init() {
        this.selectRandomTeam();
    }

    selectRandomTeam() {
        this.currentTeamIndex = Math.floor(Math.random() * this.allTeams.length);
        this.loadTeam(this.allTeams[this.currentTeamIndex]);
    }

    loadTeam(teamName) {
        this.selectedTeam = teamName;
        this.selectedTeamData = WORLD_CUP_DATA.allTeams[this.selectedTeam];
        this.selectedPlayer = null;
        this.renderLineupScreen();
    }

    nextTeam() {
        this.currentTeamIndex = (this.currentTeamIndex + 1) % this.allTeams.length;
        this.loadTeam(this.allTeams[this.currentTeamIndex]);
    }

    renderLineupScreen() {
        // Update header
        document.getElementById('team-name').textContent = this.selectedTeam;
        document.getElementById('team-flag').textContent = this.selectedTeamData.flag;
        document.getElementById('lineup-count').textContent = `${this.lineup.length}/11`;

        // Render player list
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';

        this.selectedTeamData.players.forEach(player => {
            const isSelected = this.lineup.some(p => p.number === player.number);
            if (!isSelected) {
                const playerEl = document.createElement('div');
                playerEl.className = `player-item ${this.selectedPlayer?.number === player.number ? 'active' : ''}`;
                playerEl.innerHTML = `
                    <span class="player-num">${player.number}</span>
                    <span class="player-name">${player.name}</span>
                    <span class="player-pos">${player.position}</span>
                    <span class="player-rate">⭐${player.rating}</span>
                `;
                playerEl.onclick = () => this.selectPlayer(player);
                playersList.appendChild(playerEl);
            }
        });

        // Render field positions
        this.renderFieldPositions();

        // Render available positions
        this.renderAvailablePositions();

        // Update button state
        const startBtn = document.getElementById('start-tournament-btn');
        startBtn.disabled = this.lineup.length < 11;
    }

    selectPlayer(player) {
        // Check if player is already in lineup
        if (this.lineup.some(p => p.number === player.number)) {
            alert('Este jogador já foi escalado!');
            return;
        }

        this.selectedPlayer = player;
        this.renderAvailablePositions();
    }

    renderAvailablePositions() {
        const positionsList = document.getElementById('positions-list');
        positionsList.innerHTML = '';

        if (!this.selectedPlayer) {
            positionsList.innerHTML = '<p class="no-selection">Selecione um jogador</p>';
            return;
        }

        const positions = this.getPositionsByFormation(this.formation);
        const availablePositions = [];

        const playerPosition = this.selectedPlayer.position;
        
        positions.forEach((pos, idx) => {
            const isOccupied = this.lineup.some(p => p.fieldPosition === idx);
            const isCompatible = this.isPositionCompatible(playerPosition, pos);
            
            if (!isOccupied && isCompatible) {
                availablePositions.push({ pos, idx });
            }
        });

        if (availablePositions.length === 0) {
            positionsList.innerHTML = '<p class="no-selection">Sem posições</p>';
            return;
        }

        availablePositions.forEach(({ pos, idx }) => {
            const posEl = document.createElement('div');
            posEl.className = 'position-item';
            posEl.innerHTML = `<span>${pos}</span>`;
            posEl.onclick = () => this.placePlayerInPosition(this.selectedPlayer, idx, pos);
            positionsList.appendChild(posEl);
        });
    }

    isPositionCompatible(playerPosition, fieldPosition) {
        const compatibility = {
            'GR': ['GR'],
            'D': ['D'],
            'M': ['M'],
            'A': ['A']
        };
        return compatibility[playerPosition]?.includes(fieldPosition) || false;
    }

    placePlayerInPosition(player, positionIndex, positionName) {
        if (this.lineup.some(p => p.fieldPosition === positionIndex)) {
            alert('Esta posição já está ocupada!');
            return;
        }

        this.lineup.push({
            ...player,
            fieldPosition: positionIndex,
            fieldPositionName: positionName
        });

        this.selectedPlayer = null;
        
        // Automatically go to next team
        this.nextTeam();
    }

    renderFieldPositions() {
        const fieldPositions = document.getElementById('field-positions');
        fieldPositions.innerHTML = '';

        const positions = this.getPositionsByFormation(this.formation);
        const fieldCoordinates = this.getFieldCoordinates(positions);

        positions.forEach((pos, idx) => {
            const player = this.lineup.find(p => p.fieldPosition === idx);
            const coord = fieldCoordinates[idx];

            const posEl = document.createElement('div');
            posEl.className = `field-position ${player ? 'filled' : 'empty'}`;
            posEl.style.left = coord.x + '%';
            posEl.style.top = coord.y + '%';

            if (player) {
                posEl.innerHTML = `<div class="field-player"><span>${player.number}</span></div>`;
                posEl.onclick = () => this.removePlayerFromPosition(idx);
                posEl.title = `${player.name} - Clique para remover`;
            } else {
                posEl.innerHTML = `<div class="field-empty">${pos}</div>`;
            }

            fieldPositions.appendChild(posEl);
        });
    }

    removePlayerFromPosition(positionIndex) {
        this.lineup = this.lineup.filter(p => p.fieldPosition !== positionIndex);
        this.selectedPlayer = null;
        this.renderLineupScreen();
    }

    getPositionsByFormation(formation) {
        const formations = {
            '4-3-3': ['GR', 'D', 'D', 'D', 'D', 'M', 'M', 'M', 'A', 'A', 'A'],
            '4-4-2': ['GR', 'D', 'D', 'D', 'D', 'M', 'M', 'M', 'M', 'A', 'A'],
            '3-5-2': ['GR', 'D', 'D', 'D', 'M', 'M', 'M', 'M', 'M', 'A', 'A'],
            '5-3-2': ['GR', 'D', 'D', 'D', 'D', 'D', 'M', 'M', 'M', 'A', 'A']
        };
        return formations[formation] || formations['4-3-3'];
    }

    getFieldCoordinates(positions) {
        const coordinatesByFormation = {
            '4-3-3': [
                { x: 50, y: 8 },
                { x: 20, y: 25 }, { x: 35, y: 25 }, { x: 65, y: 25 }, { x: 80, y: 25 },
                { x: 25, y: 50 }, { x: 50, y: 50 }, { x: 75, y: 50 },
                { x: 20, y: 80 }, { x: 50, y: 80 }, { x: 80, y: 80 }
            ],
            '4-4-2': [
                { x: 50, y: 8 },
                { x: 20, y: 25 }, { x: 35, y: 25 }, { x: 65, y: 25 }, { x: 80, y: 25 },
                { x: 20, y: 50 }, { x: 35, y: 50 }, { x: 65, y: 50 }, { x: 80, y: 50 },
                { x: 35, y: 80 }, { x: 65, y: 80 }
            ],
            '3-5-2': [
                { x: 50, y: 8 },
                { x: 30, y: 25 }, { x: 50, y: 25 }, { x: 70, y: 25 },
                { x: 15, y: 50 }, { x: 35, y: 50 }, { x: 50, y: 50 }, { x: 65, y: 50 }, { x: 85, y: 50 },
                { x: 35, y: 80 }, { x: 65, y: 80 }
            ],
            '5-3-2': [
                { x: 50, y: 8 },
                { x: 15, y: 25 }, { x: 32, y: 25 }, { x: 50, y: 25 }, { x: 68, y: 25 }, { x: 85, y: 25 },
                { x: 25, y: 55 }, { x: 50, y: 55 }, { x: 75, y: 55 },
                { x: 35, y: 80 }, { x: 65, y: 80 }
            ]
        };

        return coordinatesByFormation[this.formation] || coordinatesByFormation['4-3-3'];
    }

    changeFormation() {
        this.formation = document.getElementById('formation-select').value;
        this.lineup = [];
        this.selectedPlayer = null;
        this.renderLineupScreen();
    }

    skipPlayer() {
        this.selectedPlayer = null;
        this.nextTeam();
    }

    clearLineup() {
        if (confirm('Limpar toda a escalação?')) {
            this.lineup = [];
            this.selectedPlayer = null;
            this.renderLineupScreen();
        }
    }

    startTournament() {
        if (this.lineup.length < 11) {
            alert('Você precisa escalar 11 jogadores!');
            return;
        }

        this.tournament = new Tournament(this.formation);
        this.switchScreen('tournament-screen');
        this.renderTournament();
    }

    renderTournament() {
        const container = document.getElementById('groups-container');
        container.innerHTML = '';

        Object.keys(this.tournament.groups).forEach(groupName => {
            const group = this.tournament.groups[groupName];
            const groupEl = document.createElement('div');
            groupEl.className = 'group';
            groupEl.innerHTML = `<h3>Grupo ${groupName}</h3>`;

            const table = document.createElement('table');
            table.className = 'group-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>J</th>
                        <th>V</th>
                        <th>E</th>
                        <th>D</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>SG</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            const tbody = table.querySelector('tbody');
            group.standings.forEach(team => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${team.flag} ${team.name}</td>
                    <td>${team.played}</td>
                    <td>${team.wins}</td>
                    <td>${team.draws}</td>
                    <td>${team.losses}</td>
                    <td>${team.goalsFor}</td>
                    <td>${team.goalsAgainst}</td>
                    <td>${team.goalsFor - team.goalsAgainst}</td>
                    <td><strong>${team.points}</strong></td>
                `;
                tbody.appendChild(row);
            });

            groupEl.appendChild(table);
            container.appendChild(groupEl);
        });

        for (let i = 0; i < 3; i++) {
            this.tournament.simulateRound();
        }
        this.renderTournament();
    }

    backToLineup() {
        this.switchScreen('lineup-screen');
    }

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Tournament Class
class Tournament {
    constructor(formation) {
        this.formation = formation;
        this.groups = {};
        this.currentRound = 0;
        this.initializeGroups();
    }

    initializeGroups() {
        const allTeamNames = Object.keys(WORLD_CUP_DATA.allTeams);
        const shuffled = [...allTeamNames].sort(() => Math.random() - 0.5);
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        for (let i = 0; i < 8; i++) {
            const teamNames = shuffled.slice(i * 4, (i + 1) * 4);
            const teams = teamNames.map(name => ({
                name,
                flag: WORLD_CUP_DATA.allTeams[name].flag,
                code: WORLD_CUP_DATA.allTeams[name].code,
                players: WORLD_CUP_DATA.allTeams[name].players,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            }));

            this.groups[groupLetters[i]] = new Group(groupLetters[i], teams);
        }
    }

    simulateRound() {
        this.currentRound++;
        Object.keys(this.groups).forEach(groupName => {
            const group = this.groups[groupName];
            group.simulateRound();
        });
    }
}

// Group Class
class Group {
    constructor(name, teams) {
        this.name = name;
        this.standings = teams;
        this.matches = this.generateMatches();
    }

    generateMatches() {
        const matches = [];
        const teams = this.standings;

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matches.push({
                    home: teams[i],
                    away: teams[j],
                    homeScore: null,
                    awayScore: null,
                    played: false
                });
            }
        }

        return matches;
    }

    simulateRound() {
        this.matches.forEach(match => {
            if (!match.played) {
                const result = this.simulateMatch(match.home, match.away);
                match.homeScore = result.home;
                match.awayScore = result.away;
                match.played = true;

                match.home.played++;
                match.away.played++;
                match.home.goalsFor += result.home;
                match.home.goalsAgainst += result.away;
                match.away.goalsFor += result.away;
                match.away.goalsAgainst += result.home;

                if (result.home > result.away) {
                    match.home.wins++;
                    match.home.points += 3;
                    match.away.losses++;
                } else if (result.away > result.home) {
                    match.away.wins++;
                    match.away.points += 3;
                    match.home.losses++;
                } else {
                    match.home.draws++;
                    match.away.draws++;
                    match.home.points += 1;
                    match.away.points += 1;
                }
            }
        });

        this.standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
        });
    }

    simulateMatch(home, away) {
        const homeRating = home.players.reduce((sum, p) => sum + p.rating, 0) / home.players.length;
        const awayRating = away.players.reduce((sum, p) => sum + p.rating, 0) / away.players.length;

        const homeScore = Math.floor(Math.random() * 4 + (homeRating / 25));
        const awayScore = Math.floor(Math.random() * 4 + (awayRating / 25));

        return { home: homeScore, away: awayScore };
    }
}

const app = new WorldCupSimulator();

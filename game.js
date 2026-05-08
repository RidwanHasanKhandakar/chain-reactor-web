const ROWS = 6;
const COLS = 9;

let players = ["red", "green", "blue", "yellow"];
let currentPlayer = 0;
let gameOver = false;
let winnerIndex = null;
let playerAlive = [];
let playerHasPlayed = [];
let totalMoves = 0;
let totalExplosions = 0;
let maxExplosionsInMove = 0;
let lastMoveExplosions = 0;

class Cell {
    constructor() {
        this.count = 0;
        this.owner = null;
        this.neighbors = [];
    }
}

let grid = [];

function initGrid(customPlayers = null) {

    if (customPlayers) {
        players = customPlayers;
    }

    currentPlayer = 0;
    gameOver = false;
    winnerIndex = null;
    totalMoves = 0;
    totalExplosions = 0;
    maxExplosionsInMove = 0;
    lastMoveExplosions = 0;
    playerAlive = new Array(players.length).fill(true);
    playerHasPlayed = new Array(players.length).fill(false);
    grid = [];

    for (let i = 0; i < ROWS; i++) {
        let row = [];

        for (let j = 0; j < COLS; j++) {
            row.push(new Cell());
        }

        grid.push(row);
    }

    setNeighbors();
}

function setNeighbors() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {

            let cell = grid[i][j];
            cell.neighbors = [];

            if (i > 0) cell.neighbors.push(grid[i - 1][j]);
            if (i < ROWS - 1) cell.neighbors.push(grid[i + 1][j]);
            if (j > 0) cell.neighbors.push(grid[i][j - 1]);
            if (j < COLS - 1) cell.neighbors.push(grid[i][j + 1]);
        }
    }
}

function placeOrb(i, j) {

    let cell = grid[i][j];

    if (gameOver) return false;
    if (!playerAlive[currentPlayer]) return false;
    if (cell.owner !== null && cell.owner !== players[currentPlayer]) return false;

    cell.owner = players[currentPlayer];
    cell.count++;

    playerHasPlayed[currentPlayer] = true;
    totalMoves++;

    lastMoveExplosions = 0;
    explode();
    totalExplosions += lastMoveExplosions;
    if (lastMoveExplosions > maxExplosionsInMove) maxExplosionsInMove = lastMoveExplosions;

    updateEliminationsAndWinner();
    advanceToNextAlivePlayer();
    return true;
}

function explode() {

    // Use a queue with a moving head index (avoid O(n^2) shift()).
    // Also dedupe queued cells so chain reactions don't balloon the queue.
    const queue = [];
    let head = 0;
    const inQueue = new Set();

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = grid[i][j];
            if (cell.count >= cell.neighbors.length && !inQueue.has(cell)) {
                queue.push(cell);
                inQueue.add(cell);
            }
        }
    }

    while (head < queue.length) {
        const cell = queue[head++];
        inQueue.delete(cell);

        const limit = cell.neighbors.length;
        if (cell.count < limit) continue;

        const owner = cell.owner;
        lastMoveExplosions++;

        cell.count = 0;
        cell.owner = null;

        for (const n of cell.neighbors) {
            n.count++;
            n.owner = owner;

            if (n.count >= n.neighbors.length && !inQueue.has(n)) {
                queue.push(n);
                inQueue.add(n);
            }
        }
    }
}

function advanceToNextAlivePlayer() {
    if (gameOver) return;
    if (playerAlive.every((x) => !x)) return;

    let tries = 0;
    do {
        currentPlayer = (currentPlayer + 1) % players.length;
        tries++;
    } while (!playerAlive[currentPlayer] && tries <= players.length + 1);
}

function updateEliminationsAndWinner() {
    if (!playerHasPlayed.every(Boolean)) return;

    const counts = new Array(players.length).fill(0);

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const owner = grid[i][j].owner;
            if (!owner) continue;
            const idx = players.indexOf(owner);
            if (idx >= 0) counts[idx]++;
        }
    }

    for (let p = 0; p < players.length; p++) {
        if (!playerAlive[p]) continue;
        if (counts[p] === 0) playerAlive[p] = false;
    }

    const aliveIdx = [];
    for (let p = 0; p < players.length; p++) if (playerAlive[p]) aliveIdx.push(p);

    if (aliveIdx.length === 1) {
        gameOver = true;
        winnerIndex = aliveIdx[0];
    }
}

function getWinnerIndex() {
    return winnerIndex;
}

function getGameStats() {
    const perPlayer = players.map(() => ({ cells: 0, orbs: 0 }));

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const c = grid[i][j];
            if (!c.owner) continue;
            const idx = players.indexOf(c.owner);
            if (idx < 0) continue;
            perPlayer[idx].cells += 1;
            perPlayer[idx].orbs += c.count;
        }
    }

    return {
        moves: totalMoves,
        explosions: totalExplosions,
        maxExplosionsInMove,
        lastMoveExplosions,
        perPlayer,
        alive: [...playerAlive],
        hasPlayed: [...playerHasPlayed],
        winnerIndex,
        gameOver,
    };
}
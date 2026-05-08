const ROWS = 6;
const COLS = 9;

let players = ["red", "green", "blue", "yellow"];
let currentPlayer = 0;

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

    if (cell.owner !== null && cell.owner !== players[currentPlayer]) return;

    cell.owner = players[currentPlayer];
    cell.count++;

    explode();

    currentPlayer = (currentPlayer + 1) % players.length;
}

function explode() {

    let queue = [];

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {

            let cell = grid[i][j];

            if (cell.count >= cell.neighbors.length) {
                queue.push(cell);
            }
        }
    }

    while (queue.length > 0) {

        let cell = queue.shift();
        let limit = cell.neighbors.length;

        if (cell.count < limit) continue;

        let owner = cell.owner;

        cell.count = 0;
        cell.owner = null;

        for (let n of cell.neighbors) {

            n.count++;
            n.owner = owner;

            if (n.count >= n.neighbors.length) {
                queue.push(n);
            }
        }
    }
}
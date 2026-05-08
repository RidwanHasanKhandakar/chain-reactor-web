const board = document.getElementById("board");
const turnText = document.getElementById("turn");
const setup = document.getElementById("setup");
const namesDiv = document.getElementById("names");
const playerCountSelect = document.getElementById("playerCount");
const playersList = document.getElementById("playersList");
const restartBtn = document.getElementById("restartBtn");
const newGameBtn = document.getElementById("newGameBtn");
const themeToggle = document.getElementById("themeToggle");
const gameOverModal = document.getElementById("gameOver");
const gameOverSubtitle = document.getElementById("gameOverSubtitle");
const statsGrid = document.getElementById("statsGrid");
const playAgainBtn = document.getElementById("playAgainBtn");
const closeGameOverBtn = document.getElementById("closeGameOverBtn");

let playerNames = [];
let playerColors = ["red", "green", "blue", "yellow"];

initTheme();

// setup inputs
playerCountSelect.addEventListener("change", updateNameInputs);

themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "light" ? "dark" : "light";
    setTheme(next);
});

newGameBtn?.addEventListener("click", () => {
    setup.style.display = "flex";
    document.getElementById("gameContainer").style.display = "none";
    turnText.style.display = "none";
    restartBtn.style.display = "none";
    if (playersList) playersList.innerHTML = "";
    hideGameOver();
});

restartBtn?.addEventListener("click", () => {
    if (!playerNames.length) return;
    let count = parseInt(playerCountSelect.value);
    initGrid(playerColors.slice(0, count));
    updateBoard();
    updateTurnUI();
    renderPlayersList();
    hideGameOver();
});

playAgainBtn?.addEventListener("click", () => {
    hideGameOver();
    setup.style.display = "flex";
    document.getElementById("gameContainer").style.display = "none";
    turnText.style.display = "none";
    restartBtn.style.display = "none";
});

closeGameOverBtn?.addEventListener("click", () => {
    hideGameOver();
});

function updateNameInputs() {

    namesDiv.innerHTML = "";

    let count = parseInt(playerCountSelect.value);

    for (let i = 0; i < count; i++) {
        namesDiv.innerHTML += `
            <input class="input" id="p${i}" placeholder="Player ${i + 1} name" autocomplete="off">
        `;
    }
}

function initTheme() {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
    }

    const prefersLight =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(prefersLight ? "light" : "dark");
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeToggle) themeToggle.textContent = theme === "light" ? "Light" : "Dark";
}

updateNameInputs();

// START GAME
function startGame() {

    let count = parseInt(playerCountSelect.value);

    playerNames = [];

    for (let i = 0; i < count; i++) {
        let input = document.getElementById("p" + i);
        playerNames.push(input.value || "Player " + (i + 1));
    }

    setup.style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    turnText.style.display = "block";
    restartBtn.style.display = "inline-flex";

    initGrid(playerColors.slice(0, count));

    buildBoard();
    updateBoard();
    updateTurnUI();

    renderPlayersList();
    hideGameOver();
}

// BUILD BOARD
function buildBoard() {

    board.innerHTML = "";

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {

            let div = document.createElement("div");
            div.classList.add("cell");

            div.addEventListener("click", () => handleClick(i, j));
            div.addEventListener("touchstart", (e) => {
                e.preventDefault();
                handleClick(i, j);
            });

            board.appendChild(div);
        }
    }
}

// CLICK HANDLER
function handleClick(i, j) {

    const placed = placeOrb(i, j);
    if (!placed) return;

    updateBoard();
    updateTurnUI();
    renderPlayersList();

    animate(i, j);
}

// ANIMATION
function animate(i, j) {

    let index = i * COLS + j;
    let div = document.getElementsByClassName("cell")[index];

    div.classList.remove("pop");
    void div.offsetWidth;
    div.classList.add("pop");
}

// RENDER BOARD
function updateBoard() {

    let cells = document.getElementsByClassName("cell");
    let index = 0;

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {

            let cell = grid[i][j];
            let div = cells[index];

            div.style.background = "rgba(255,255,255,0.04)";
            div.innerHTML = "";

            if (cell.owner) {
                div.style.background = cell.owner;
                div.style.boxShadow = `0 14px 30px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.10) inset, 0 0 22px ${cell.owner}55`;
            } else {
                div.style.boxShadow = "";
            }

            if (cell.count > 0) {
                div.innerHTML = cell.count;
            }

            if (cell.owner === "yellow") {
                div.style.color = "#111";
                div.style.textShadow = "none";
            } else if (cell.owner) {
                div.style.color = "#fff";
                div.style.textShadow = "0 1px 0 rgba(0,0,0,.35)";
            } else {
                div.style.color = "rgba(234,240,255,.80)";
                div.style.textShadow = "none";
            }

            div.classList.remove("shake");

            if (cell.count > 0) {
                div.classList.add("shake");
            }

            index++;
        }
    }
}

// TURN UI
function updateTurnUI() {

    const winner = typeof getWinnerIndex === "function" ? getWinnerIndex() : null;
    const turnColor = players[currentPlayer];

    document.documentElement.style.setProperty("--turnBorder", turnColor);

    if (winner !== null && winner !== undefined) {
        turnText.innerText = "Winner: " + playerNames[winner];
        turnText.style.color = players[winner];
        showGameOver();
        return;
    }

    turnText.innerText = "Turn: " + playerNames[currentPlayer];
    turnText.style.color = turnColor;
}

function renderPlayersList() {
    if (!playersList || !playerNames.length) return;

    const stats = typeof getGameStats === "function" ? getGameStats() : null;

    playersList.innerHTML = "";

    for (let i = 0; i < playerNames.length; i++) {
        const pill = document.createElement("div");
        const isOut = typeof playerAlive !== "undefined" && playerAlive?.[i] === false;
        const isActive = !isOut && i === currentPlayer;
        pill.className = "playerPill" + (isActive ? " playerPill--active" : "");

        const left = document.createElement("div");
        left.className = "playerPill__left";

        const dot = document.createElement("div");
        dot.className = "dot";
        dot.style.background = players[i];
        dot.style.boxShadow = `0 0 0 3px rgba(255,255,255,0.08), 0 0 18px ${players[i]}66`;
        if (isOut) dot.style.opacity = "0.35";

        const name = document.createElement("div");
        name.className = "playerName";
        name.textContent = playerNames[i];
        if (isOut) name.style.opacity = "0.55";

        left.appendChild(dot);
        left.appendChild(name);

        const meta = document.createElement("div");
        meta.className = "playerMeta";
        if (isOut) meta.textContent = "OUT";
        else if (stats?.perPlayer?.[i]) meta.textContent = `${stats.perPlayer[i].cells} cells • ${stats.perPlayer[i].orbs} orbs`;
        else meta.textContent = i === currentPlayer ? "Now" : "";

        pill.appendChild(left);
        pill.appendChild(meta);

        playersList.appendChild(pill);
    }
}

function showGameOver() {
    if (!gameOverModal) return;
    const stats = typeof getGameStats === "function" ? getGameStats() : null;
    const winner = typeof getWinnerIndex === "function" ? getWinnerIndex() : null;

    if (winner === null || winner === undefined) return;

    if (gameOverSubtitle) {
        gameOverSubtitle.textContent = `${playerNames[winner]} wins in ${stats?.moves ?? 0} moves`;
        gameOverSubtitle.style.color = players[winner];
    }

    if (statsGrid && stats) {
        statsGrid.innerHTML = "";
        addStat("Total moves", String(stats.moves));
        addStat("Total explosions", String(stats.explosions));
        addStat("Biggest chain", String(stats.maxExplosionsInMove));
        addStat("Last move chain", String(stats.lastMoveExplosions));
    }

    gameOverModal.style.display = "flex";
}

function hideGameOver() {
    if (!gameOverModal) return;
    gameOverModal.style.display = "none";
}

function addStat(label, value) {
    if (!statsGrid) return;
    const card = document.createElement("div");
    card.className = "stat";
    const l = document.createElement("div");
    l.className = "stat__label";
    l.textContent = label;
    const v = document.createElement("div");
    v.className = "stat__value";
    v.textContent = value;
    card.appendChild(l);
    card.appendChild(v);
    statsGrid.appendChild(card);
}
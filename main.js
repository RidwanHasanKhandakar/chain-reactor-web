const board = document.getElementById("board");
const turnText = document.getElementById("turn");
const setup = document.getElementById("setup");
const namesDiv = document.getElementById("names");
const playerCountSelect = document.getElementById("playerCount");
const playersList = document.getElementById("playersList");
const restartBtn = document.getElementById("restartBtn");
const newGameBtn = document.getElementById("newGameBtn");

let playerNames = [];
let playerColors = ["red", "green", "blue", "yellow"];

// setup inputs
playerCountSelect.addEventListener("change", updateNameInputs);

newGameBtn?.addEventListener("click", () => {
    setup.style.display = "flex";
    document.getElementById("gameContainer").style.display = "none";
    turnText.style.display = "none";
    restartBtn.style.display = "none";
    if (playersList) playersList.innerHTML = "";
});

restartBtn?.addEventListener("click", () => {
    if (!playerNames.length) return;
    let count = parseInt(playerCountSelect.value);
    initGrid(playerColors.slice(0, count));
    updateBoard();
    updateTurnUI();
    renderPlayersList();
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
        return;
    }

    turnText.innerText = "Turn: " + playerNames[currentPlayer];
    turnText.style.color = turnColor;
}

function renderPlayersList() {
    if (!playersList || !playerNames.length) return;

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
        else meta.textContent = i === currentPlayer ? "Now" : "";

        pill.appendChild(left);
        pill.appendChild(meta);

        playersList.appendChild(pill);
    }
}
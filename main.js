const board = document.getElementById("board");
const turnText = document.getElementById("turn");
const setup = document.getElementById("setup");
const namesDiv = document.getElementById("names");
const playerCountSelect = document.getElementById("playerCount");

let playerNames = [];
let playerColors = ["red", "green", "blue", "yellow"];

// setup inputs
playerCountSelect.addEventListener("change", updateNameInputs);

function updateNameInputs() {

    namesDiv.innerHTML = "";

    let count = parseInt(playerCountSelect.value);

    for (let i = 0; i < count; i++) {
        namesDiv.innerHTML += `
            <input id="p${i}" placeholder="Player ${i+1} name"><br>
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

    initGrid(playerColors.slice(0, count));

    buildBoard();
    updateBoard();
    updateTurnUI();
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

    placeOrb(i, j);

    updateBoard();
    updateTurnUI();

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

            div.style.background = "#111";
            div.innerHTML = "";

            if (cell.owner) {
                div.style.background = cell.owner;
            }

            if (cell.count > 0) {
                div.innerHTML = cell.count;
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

    let color = players[currentPlayer];

    turnText.innerText = "Turn: " + playerNames[currentPlayer];
    turnText.style.color = color;
}
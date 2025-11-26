const rollBtn = document.getElementById("roll-btn");
const holdBtn = document.getElementById("hold-btn");
const resetBtn = document.getElementById("reset-btn");
const startBtn = document.getElementById("start-btn");

const statusDiv = document.getElementById("status");
const diceDiv = document.getElementById("dice");

const p1Round = document.getElementById("p1-round");
const p1Total = document.getElementById("p1-total");
const p2Round = document.getElementById("p2-round");
const p2Total = document.getElementById("p2-total");

const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const targetInput = document.getElementById("target");

const highscoreBody = document.getElementById("highscore-body");
const overlay = document.getElementById("overlay");
const overlayImg = overlay.querySelector("img");
const chickenContainer = document.getElementById("chicken-container");

let players = ["Spelare 1", "Spelare 2"];
let scores = [0, 0];
let roundScores = [0, 0];
let currentPlayer = 0;
let targetScore = 100;
let gameActive = false;

startBtn.addEventListener("click", () => {
  players[0] = player1Input.value || "Spelare 1";
  players[1] = player2Input.value || "Spelare 2";
  targetScore = parseInt(targetInput.value) || 100;

  scores = [0, 0];
  roundScores = [0, 0];
  currentPlayer = 0;
  gameActive = true;

  updateUI();
  updateChicken();
  rollBtn.disabled = false;
  holdBtn.disabled = false;
  statusDiv.textContent = `Tur: ${players[currentPlayer]}`;
});

rollBtn.addEventListener("click", () => {
  if (!gameActive) return;
  const roll = Math.floor(Math.random() * 6) + 1;
  diceDiv.textContent = roll;

  if (roll === 1) {
    // Bust på kast → jumpscare
    roundScores[currentPlayer] = 0;
    showOverlay("bustjumpscare.png", () => {
      switchPlayer();
      updateUI();
    });
  } else {
    roundScores[currentPlayer] += roll;

    // Kolla om totalsumman + rundan redan spräcker målet
    if (scores[currentPlayer] + roundScores[currentPlayer] > targetScore) {
      showOverlay("bustjumpscare.png", () => {
        endGame(currentPlayer === 0 ? 1 : 0);
      });
    }
  }
  updateUI();
});

holdBtn.addEventListener("click", () => {
  if (!gameActive) return;

  scores[currentPlayer] += roundScores[currentPlayer];
  roundScores[currentPlayer] = 0;

  if (scores[currentPlayer] > targetScore) {
    // Bust → jumpscare
    showOverlay("bustjumpscare.png", () => {
      endGame(currentPlayer === 0 ? 1 : 0);
    });
  } else if (scores[currentPlayer] === targetScore) {
    endGame(currentPlayer);
  } else {
    // Stanna → nice.png och byt spelare
    showOverlay("nice.png", () => {
      switchPlayer();
      updateUI();
    });
  }
  updateUI();
});

resetBtn.addEventListener("click", () => {
  scores = [0, 0];
  roundScores = [0, 0];
  currentPlayer = 0;
  gameActive = false;
  rollBtn.disabled = true;
  holdBtn.disabled = true;
  diceDiv.textContent = "–";
  statusDiv.textContent = "Spelet återställt. Starta nytt spel!";
  updateUI();
});

function switchPlayer() {
  currentPlayer = currentPlayer === 0 ? 1 : 0;
  statusDiv.textContent = `Tur: ${players[currentPlayer]}`;
  updateChicken();
}

function endGame(winnerIndex) {
  gameActive = false;
  rollBtn.disabled = true;
  holdBtn.disabled = true;
  statusDiv.textContent = `${players[winnerIndex]} vann spelet!`;

  fetch("/update_highscore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ winner: players[winnerIndex] })
  })
    .then(res => res.json())
    .then(data => renderHighscoreFromServer(data));
}

function updateUI() {
  p1Round.textContent = roundScores[0];
  p1Total.textContent = scores[0];
  p2Round.textContent = roundScores[1];
  p2Total.textContent = scores[1];
}

function updateChicken() {
  // Update chicken animation based on current player
  chickenContainer.className = currentPlayer === 0 ? "player1" : "player2";
  
  // Create or update chicken image
  let chickenImg = chickenContainer.querySelector("img");
  if (!chickenImg) {
    chickenImg = document.createElement("img");
    chickenImg.src = "whitechickenmovement1.GIF";
    chickenImg.alt = "Chicken idle animation";
    chickenContainer.appendChild(chickenImg);
  }
}

function renderHighscoreFromServer(data) {
  highscoreBody.innerHTML = "";
  for (const [name, wins] of Object.entries(data)) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${name}</td><td>${wins}</td>`;
    highscoreBody.appendChild(row);
  }
}

function loadHighscore() {
  fetch("/highscore")
    .then(res => res.json())
    .then(data => renderHighscoreFromServer(data))
    .catch(() => {});
}
loadHighscore();

// Overlay-funktion
function showOverlay(imgSrc, callback) {
  overlayImg.src = imgSrc;
  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.style.display = "none";
    if (callback) callback();
  }, 2000); // visas i 2 sekunder
}

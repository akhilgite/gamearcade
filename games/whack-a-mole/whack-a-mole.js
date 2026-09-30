(function () {
  const board = document.getElementById("board");
  const scoreLabel = document.getElementById("score");
  const timeLabel = document.getElementById("time");
  const status = document.getElementById("status");
  const startButton = document.getElementById("start");
  let holes = [];
  let active = -1;
  let score = 0;
  let timeLeft = 30;
  let running = false;
  let roundTimer;
  let moleTimer;

  function setMole() {
    if (!running) return;
    const next = Math.floor(Math.random() * holes.length);
    active = holes.length > 1 && next === active ? (next + 1 + Math.floor(Math.random() * (holes.length - 1))) % holes.length : next;
    holes.forEach((hole, index) => {
      const isActive = index === active;
      hole.classList.toggle("is-active", isActive);
      hole.textContent = isActive ? "🐹" : "";
      hole.setAttribute("aria-label", isActive ? "Mole: hit" : "Empty hole");
    });
    moleTimer = setTimeout(setMole, 650 + Math.random() * 350);
  }

  function finish() {
    running = false;
    active = -1;
    clearTimeout(moleTimer);
    clearInterval(roundTimer);
    holes.forEach((hole) => { hole.textContent = ""; hole.classList.remove("is-active"); });
    status.textContent = "Time! You scored " + score + ".";
    startButton.textContent = "Play again";
  }

  function start() {
    clearTimeout(moleTimer);
    clearInterval(roundTimer);
    score = 0; timeLeft = 30; running = true; active = -1;
    scoreLabel.textContent = score; timeLabel.textContent = timeLeft;
    status.textContent = "Go!"; startButton.textContent = "Restart";
    setMole();
    roundTimer = setInterval(() => {
      timeLeft -= 1; timeLabel.textContent = timeLeft;
      if (timeLeft <= 0) finish();
    }, 1000);
  }

  for (let index = 0; index < 9; index += 1) {
    const hole = document.createElement("button");
    hole.type = "button"; hole.className = "board-cell mole-hole"; hole.setAttribute("aria-label", "Empty hole");
    hole.addEventListener("click", () => {
      if (!running || index !== active) return;
      score += 1; scoreLabel.textContent = score; active = -1;
      hole.textContent = ""; hole.classList.remove("is-active"); hole.setAttribute("aria-label", "Empty hole");
    });
    holes.push(hole); board.appendChild(hole);
  }
  startButton.addEventListener("click", start);
})();
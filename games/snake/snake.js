(function () {
  const canvas = document.getElementById("game");
  const context = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const bestElement = document.getElementById("best");
  const startButton = document.getElementById("start");
  const cellSize = 24;
  const cells = canvas.width / cellSize;
  const scoreKey = "snake:best";
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  let snake;
  let food;
  let direction;
  let nextDirection;
  let score = 0;
  let best = readBest();
  let state = "ready";
  let elapsed = 0;
  let lastTime = 0;

  function readBest() {
    try { return Number(localStorage.getItem(scoreKey)) || 0; } catch (error) { return 0; }
  }

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  }

  function reset() {
    snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
    direction = directions.right;
    nextDirection = direction;
    score = 0;
    scoreElement.textContent = score;
    state = "ready";
    placeFood();
    startButton.textContent = "Start game";
    draw();
  }

  function start() {
    if (state === "over") reset();
    if (state !== "playing") {
      state = "playing";
      startButton.textContent = "Restart";
      lastTime = 0;
      requestAnimationFrame(loop);
    }
  }

  function setDirection(name) {
    const candidate = directions[name];
    if (!candidate) return;
    if (candidate.x !== -direction.x || candidate.y !== -direction.y) nextDirection = candidate;
    if (state === "ready") start();
  }

  function finish() {
    state = "over";
    if (score > best) {
      best = score;
      try { localStorage.setItem(scoreKey, String(best)); } catch (error) { /* Storage is optional. */ }
    }
    bestElement.textContent = best;
    startButton.textContent = "Play again";
    draw();
  }

  function update() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const ateFood = head.x === food.x && head.y === food.y;
    const body = ateFood ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells || body.some((segment) => segment.x === head.x && segment.y === head.y)) {
      finish();
      return;
    }
    snake.unshift(head);
    if (ateFood) {
      score += 1;
      scoreElement.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function draw() {
    context.fillStyle = "#101c27";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#1b2b35";
    for (let line = 0; line <= cells; line += 1) {
      context.beginPath();
      context.moveTo(line * cellSize, 0);
      context.lineTo(line * cellSize, canvas.height);
      context.moveTo(0, line * cellSize);
      context.lineTo(canvas.width, line * cellSize);
      context.stroke();
    }
    context.fillStyle = "#f16e62";
    context.beginPath();
    context.arc((food.x + 0.5) * cellSize, (food.y + 0.5) * cellSize, cellSize * 0.34, 0, Math.PI * 2);
    context.fill();
    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? "#76e0b3" : "#3bb184";
      context.beginPath();
      context.roundRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4, 6);
      context.fill();
    });
    if (state !== "playing") {
      context.fillStyle = "rgba(8, 16, 22, 0.68)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";
      context.textAlign = "center";
      context.font = "700 34px system-ui, sans-serif";
      context.fillText(state === "over" ? "Game over" : "Snake", canvas.width / 2, canvas.height / 2 - 8);
      context.font = "18px system-ui, sans-serif";
      context.fillText(state === "over" ? "Press Play again" : "Press Start or a direction", canvas.width / 2, canvas.height / 2 + 28);
    }
  }

  function loop(timestamp) {
    if (state !== "playing") return;
    if (!lastTime) lastTime = timestamp;
    elapsed += timestamp - lastTime;
    lastTime = timestamp;
    while (elapsed >= 115 && state === "playing") {
      update();
      elapsed -= 115;
    }
    draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (event) => {
    const keyMap = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    if (keyMap[event.key]) {
      event.preventDefault();
      setDirection(keyMap[event.key]);
    } else if (event.code === "Space" && state !== "playing") {
      event.preventDefault();
      start();
    }
  });
  document.querySelectorAll("[data-direction]").forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.direction)));
  startButton.addEventListener("click", () => { if (state === "playing") reset(); else start(); });
  canvas.addEventListener("pointerdown", () => { if (state !== "playing") start(); });
  bestElement.textContent = best;
  reset();
})();
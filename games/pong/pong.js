(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const playerLabel = document.getElementById("player-score");
  const cpuLabel = document.getElementById("cpu-score");
  const startButton = document.getElementById("start");
  const paddleHeight = 74;
  let playerY;
  let cpuY;
  let ball;
  let playerScore;
  let cpuScore;
  let state = "ready";
  let keys = {};
  let lastTime = 0;

  function serve(towardPlayer) {
    ball = { x: canvas.width / 2, y: canvas.height / 2, vx: (towardPlayer ? -1 : 1) * 235, vy: (Math.random() * 2 - 1) * 135, radius: 8 };
  }

  function reset() {
    playerY = cpuY = (canvas.height - paddleHeight) / 2;
    playerScore = cpuScore = 0; playerLabel.textContent = 0; cpuLabel.textContent = 0;
    state = "ready"; startButton.textContent = "Start game"; serve(false); draw();
  }

  function start() {
    if (state === "over") reset();
    state = "playing"; startButton.textContent = "Restart"; lastTime = 0; requestAnimationFrame(loop);
  }

  function draw() {
    ctx.fillStyle = "#101c27"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([8, 10]); ctx.strokeStyle = "#42515b"; ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#75d9b1"; ctx.beginPath(); ctx.roundRect(18, playerY, 12, paddleHeight, 6); ctx.fill();
    ctx.fillStyle = "#f16e62"; ctx.beginPath(); ctx.roundRect(canvas.width - 30, cpuY, 12, paddleHeight, 6); ctx.fill();
    ctx.fillStyle = "#f4d269"; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
    if (state !== "playing") {
      ctx.fillStyle = "rgba(8, 16, 22, 0.62)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "700 26px system-ui, sans-serif";
      ctx.fillText(state === "over" ? (playerScore > cpuScore ? "You win!" : "CPU wins!") : "Pong", canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = "17px system-ui, sans-serif"; ctx.fillText(state === "ready" ? "Press Start to serve" : "Press Play again", canvas.width / 2, canvas.height / 2 + 24);
    }
  }

  function scorePoint(player) {
    if (player) playerScore += 1; else cpuScore += 1;
    playerLabel.textContent = playerScore; cpuLabel.textContent = cpuScore;
    if (playerScore >= 5 || cpuScore >= 5) { state = "over"; startButton.textContent = "Play again"; }
    else serve(!player);
  }

  function step(dt) {
    if (keys.ArrowUp || keys.w) playerY -= 300 * dt;
    if (keys.ArrowDown || keys.s) playerY += 300 * dt;
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
    const target = ball.y - paddleHeight / 2;
    cpuY += Math.max(-245 * dt, Math.min(245 * dt, target - cpuY));
    cpuY = Math.max(0, Math.min(canvas.height - paddleHeight, cpuY));
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) ball.vy *= -1;
    if (ball.vx < 0 && ball.x - ball.radius < 30 && ball.x > 14 && ball.y > playerY - ball.radius && ball.y < playerY + paddleHeight + ball.radius) {
      ball.vx = Math.abs(ball.vx) * 1.04; ball.vy += ((ball.y - (playerY + paddleHeight / 2)) / (paddleHeight / 2)) * 90;
    }
    if (ball.vx > 0 && ball.x + ball.radius > canvas.width - 30 && ball.x < canvas.width - 14 && ball.y > cpuY - ball.radius && ball.y < cpuY + paddleHeight + ball.radius) {
      ball.vx = -Math.abs(ball.vx) * 1.04; ball.vy += ((ball.y - (cpuY + paddleHeight / 2)) / (paddleHeight / 2)) * 80;
    }
    if (ball.x < 0) scorePoint(false);
    if (ball.x > canvas.width) scorePoint(true);
  }

  function loop(time) {
    if (state !== "playing") { draw(); return; }
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.04); lastTime = time;
    step(dt); draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, (event.clientY - rect.top) / rect.height * canvas.height - paddleHeight / 2));
  });
  canvas.addEventListener("pointerdown", () => { if (state !== "playing") start(); });
  document.addEventListener("keydown", (event) => { keys[event.key] = true; if (["ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault(); });
  document.addEventListener("keyup", (event) => { keys[event.key] = false; });
  startButton.addEventListener("click", () => { if (state === "playing") reset(); else start(); });
  reset();
})();
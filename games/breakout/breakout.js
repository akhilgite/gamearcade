(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreLabel = document.getElementById("score");
  const livesLabel = document.getElementById("lives");
  const startButton = document.getElementById("start");
  const colors = ["#f16e62", "#f2bc55", "#62c9ae", "#5da8db", "#b191d1"];
  let bricks;
  let paddle;
  let ball;
  let score;
  let lives;
  let state = "ready";
  let keys = {};
  let lastTime = 0;

  function reset() {
    bricks = Array.from({ length: 5 }, (_, row) => Array.from({ length: 9 }, (_, col) => ({ x: 24 + col * 48, y: 48 + row * 25, alive: true, color: colors[row] })));
    paddle = { x: 200, y: 386, width: 80, height: 12 };
    ball = { x: 240, y: 340, vx: 170, vy: -210, radius: 8 };
    score = 0; lives = 3; state = "ready";
    scoreLabel.textContent = score; livesLabel.textContent = lives;
    startButton.textContent = "Start game";
    draw();
  }

  function start() {
    if (state === "over" || state === "won") reset();
    if (state !== "playing") { state = "playing"; startButton.textContent = "Restart"; lastTime = 0; requestAnimationFrame(loop); }
  }

  function draw() {
    ctx.fillStyle = "#101c27"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    bricks.flat().forEach((brick) => {
      if (!brick.alive) return;
      ctx.fillStyle = brick.color; ctx.beginPath(); ctx.roundRect(brick.x, brick.y, 40, 16, 4); ctx.fill();
    });
    ctx.fillStyle = "#75d9b1"; ctx.beginPath(); ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6); ctx.fill();
    ctx.fillStyle = "#f4d269"; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
    if (state !== "playing") {
      ctx.fillStyle = "rgba(8, 16, 22, 0.66)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "700 28px system-ui, sans-serif";
      ctx.fillText(state === "won" ? "All clear!" : state === "over" ? "Game over" : "Breakout", canvas.width / 2, 205);
      ctx.font = "17px system-ui, sans-serif"; ctx.fillText(state === "ready" ? "Press Start to play" : "Press Play again", canvas.width / 2, 238);
    }
  }

  function step(dt) {
    if (keys.ArrowLeft || keys.a) paddle.x -= 330 * dt;
    if (keys.ArrowRight || keys.d) paddle.x += 330 * dt;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.vx *= -1;
    if (ball.y < ball.radius) ball.vy = Math.abs(ball.vy);
    if (ball.vy > 0 && ball.y + ball.radius >= paddle.y && ball.y < paddle.y + paddle.height && ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
      const offset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.vx = offset * 270; ball.vy = -Math.max(170, Math.sqrt(420 * 420 - ball.vx * ball.vx));
    }
    let remaining = 0;
    for (const row of bricks) for (const brick of row) {
      if (!brick.alive) continue;
      remaining += 1;
      if (ball.x > brick.x && ball.x < brick.x + 40 && ball.y - ball.radius < brick.y + 16 && ball.y + ball.radius > brick.y) {
        brick.alive = false; ball.vy *= -1; score += 10; scoreLabel.textContent = score; remaining -= 1;
      }
    }
    if (!remaining) { state = "won"; startButton.textContent = "Play again"; }
    if (ball.y > canvas.height + ball.radius) {
      lives -= 1; livesLabel.textContent = lives;
      if (lives <= 0) { state = "over"; startButton.textContent = "Play again"; }
      else { ball = { x: paddle.x + paddle.width / 2, y: paddle.y - 16, vx: 170 * (Math.random() < 0.5 ? -1 : 1), vy: -210, radius: 8 }; }
    }
  }

  function loop(time) {
    if (state !== "playing") { draw(); return; }
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.04); lastTime = time;
    step(dt); draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  function steer(event) {
    const rect = canvas.getBoundingClientRect();
    paddle.x = (event.clientX - rect.left) / rect.width * canvas.width - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
  }
  canvas.addEventListener("pointermove", steer);
  canvas.addEventListener("pointerdown", () => { if (state !== "playing") start(); });
  document.addEventListener("keydown", (event) => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault(); keys[event.key] = true; });
  document.addEventListener("keyup", (event) => { keys[event.key] = false; });
  startButton.addEventListener("click", () => { if (state === "playing") reset(); else start(); });
  reset();
})();
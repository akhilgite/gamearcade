// Flappy Bird on a 400x600 canvas. No dependencies.
(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const GROUND_HEIGHT = 90;
  const GROUND_Y = HEIGHT - GROUND_HEIGHT;

  // Physics, in pixels and seconds
  const GRAVITY = 1500;
  const FLAP_VELOCITY = -420;
  const MAX_FALL_SPEED = 620;
  const SCROLL_SPEED = 150;

  const BIRD_X = 110;
  const BIRD_RADIUS = 15;

  const PIPE_WIDTH = 66;
  const PIPE_GAP = 160;
  const PIPE_SPACING = 220;
  const PIPE_MARGIN = 60; // minimum pipe length at top and bottom

  const BEST_SCORE_KEY = "flappy-bird:best";

  const State = { READY: "ready", PLAYING: "playing", GAME_OVER: "gameOver" };

  let state = State.READY;
  let bird;
  let pipes;
  let score;
  let best = loadBest();
  let groundOffset = 0;
  let elapsed = 0;
  let gameOverAt = 0;
  let lastTime = 0;

  function loadBest() {
    try {
      return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(best));
    } catch (e) {
      // Storage unavailable: the best score just won't persist.
    }
  }

  function reset() {
    bird = { y: HEIGHT * 0.42, velocity: 0, rotation: 0 };
    pipes = [];
    score = 0;
    state = State.READY;
  }

  function spawnPipe(x) {
    const minTop = PIPE_MARGIN;
    const maxTop = GROUND_Y - PIPE_GAP - PIPE_MARGIN;
    pipes.push({
      x: x,
      gapTop: minTop + Math.random() * (maxTop - minTop),
      passed: false,
    });
  }

  function flap() {
    if (state === State.READY) {
      state = State.PLAYING;
      spawnPipe(WIDTH + 120);
      bird.velocity = FLAP_VELOCITY;
    } else if (state === State.PLAYING) {
      bird.velocity = FLAP_VELOCITY;
    } else if (elapsed - gameOverAt > 0.5) {
      // Short delay so a panic tap doesn't skip the game-over screen
      reset();
    }
  }

  function endGame() {
    state = State.GAME_OVER;
    gameOverAt = elapsed;
    if (score > best) {
      best = score;
      saveBest();
    }
  }

  function hitsPipe(pipe) {
    const withinX =
      BIRD_X + BIRD_RADIUS > pipe.x && BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
    if (!withinX) return false;
    return (
      bird.y - BIRD_RADIUS < pipe.gapTop ||
      bird.y + BIRD_RADIUS > pipe.gapTop + PIPE_GAP
    );
  }

  function update(dt) {
    elapsed += dt;

    if (state === State.READY) {
      bird.y = HEIGHT * 0.42 + Math.sin(elapsed * 5) * 8;
      bird.rotation = 0;
      groundOffset = (groundOffset + SCROLL_SPEED * dt) % 24;
      return;
    }

    bird.velocity = Math.min(bird.velocity + GRAVITY * dt, MAX_FALL_SPEED);
    bird.y += bird.velocity * dt;
    bird.rotation = Math.max(-0.45, Math.min(1.3, bird.velocity / 450));

    if (bird.y + BIRD_RADIUS >= GROUND_Y) {
      bird.y = GROUND_Y - BIRD_RADIUS;
      if (state === State.PLAYING) endGame();
    }

    if (state !== State.PLAYING) return;

    if (bird.y < BIRD_RADIUS) {
      bird.y = BIRD_RADIUS;
      bird.velocity = 0;
    }

    groundOffset = (groundOffset + SCROLL_SPEED * dt) % 24;

    for (const pipe of pipes) {
      pipe.x -= SCROLL_SPEED * dt;
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
        pipe.passed = true;
        score += 1;
      }
      if (hitsPipe(pipe)) endGame();
    }

    if (pipes.length && pipes[0].x + PIPE_WIDTH < 0) pipes.shift();
    const last = pipes[pipes.length - 1];
    if (last.x < WIDTH - PIPE_SPACING + PIPE_WIDTH) spawnPipe(last.x + PIPE_SPACING);
  }

  // ---------- Drawing ----------

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, "#4ec0ca");
    sky.addColorStop(1, "#c9f0f2");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, GROUND_Y);

    ctx.fillStyle = "#ffffff";
    [[70, 120, 26], [110, 128, 20], [280, 80, 30], [325, 90, 22], [200, 200, 18]].forEach(
      function (c) {
        ctx.beginPath();
        ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2);
        ctx.fill();
      },
    );

    // Distant bushes along the horizon
    ctx.fillStyle = "#8fd67c";
    for (let x = -20; x < WIDTH + 40; x += 56) {
      ctx.beginPath();
      ctx.arc(x, GROUND_Y + 6, 38, Math.PI, 0);
      ctx.fill();
    }
  }

  function drawPipeSegment(x, y, height, capAtBottom) {
    if (height <= 0) return;
    const body = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
    body.addColorStop(0, "#5aa82f");
    body.addColorStop(0.35, "#9be65a");
    body.addColorStop(1, "#4a9126");
    ctx.fillStyle = body;
    ctx.strokeStyle = "#2f5d18";
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, PIPE_WIDTH, height);
    ctx.strokeRect(x, y, PIPE_WIDTH, height);

    const capHeight = 26;
    const capY = capAtBottom ? y + height - capHeight : y;
    ctx.fillRect(x - 5, capY, PIPE_WIDTH + 10, capHeight);
    ctx.strokeRect(x - 5, capY, PIPE_WIDTH + 10, capHeight);
  }

  function drawPipes() {
    for (const pipe of pipes) {
      drawPipeSegment(pipe.x, -4, pipe.gapTop + 4, true);
      const bottomY = pipe.gapTop + PIPE_GAP;
      drawPipeSegment(pipe.x, bottomY, GROUND_Y - bottomY, false);
    }
  }

  function drawGround() {
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, GROUND_Y, WIDTH, GROUND_HEIGHT);
    ctx.fillStyle = "#73bf2e";
    ctx.fillRect(0, GROUND_Y, WIDTH, 18);
    ctx.fillStyle = "#9be65a";
    for (let x = -groundOffset; x < WIDTH; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 18);
      ctx.lineTo(x + 12, GROUND_Y);
      ctx.lineTo(x + 24, GROUND_Y);
      ctx.lineTo(x + 12, GROUND_Y + 18);
      ctx.fill();
    }
    ctx.fillStyle = "#54822a";
    ctx.fillRect(0, GROUND_Y + 18, WIDTH, 3);
  }

  function drawBird() {
    ctx.save();
    ctx.translate(BIRD_X, bird.y);
    ctx.rotate(bird.rotation);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#4a3b15";

    // Body
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wing, flapping while alive
    const wingLift = state === State.GAME_OVER ? 0 : Math.sin(elapsed * 22) * 5;
    ctx.fillStyle = "#fff3b0";
    ctx.beginPath();
    ctx.ellipse(-7, 2 + wingLift, 10, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(9, -6, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#222222";
    ctx.beginPath();
    ctx.arc(11, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#ff8a3d";
    ctx.beginPath();
    ctx.moveTo(14, 1);
    ctx.lineTo(28, 5);
    ctx.lineTo(14, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawText(text, x, y, size, fill) {
    ctx.font = "800 " + size + "px system-ui, -apple-system, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(4, size / 7);
    ctx.strokeStyle = "#3b2f2f";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill || "#ffffff";
    ctx.fillText(text, x, y);
  }

  function drawPanel(x, y, w, h) {
    ctx.fillStyle = "#fdf3c8";
    ctx.strokeStyle = "#3b2f2f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();
  }

  function drawOverlay() {
    if (state === State.READY) {
      drawText("Flappy Bird", WIDTH / 2, 130, 48, "#ffd84d");
      drawText("Tap or press Space", WIDTH / 2, 360, 24);
      drawText("Best: " + best, WIDTH / 2, 400, 20);
      return;
    }

    if (state === State.PLAYING) {
      drawText(String(score), WIDTH / 2, 80, 56);
      return;
    }

    drawText("Game Over", WIDTH / 2, 150, 46, "#ff6b5a");
    drawPanel(WIDTH / 2 - 120, 205, 240, 130);
    drawText("Score", WIDTH / 2 - 55, 240, 20, "#ffb347");
    drawText(String(score), WIDTH / 2 - 55, 285, 40);
    drawText("Best", WIDTH / 2 + 55, 240, 20, "#ffb347");
    drawText(String(best), WIDTH / 2 + 55, 285, 40);
    if (elapsed - gameOverAt > 0.5) {
      drawText("Tap to play again", WIDTH / 2, 385, 24);
    }
  }

  function draw() {
    drawBackground();
    drawPipes();
    drawGround();
    drawBird();
    drawOverlay();
  }

  function loop(time) {
    // Cap the step so a background tab doesn't cause a huge jump
    const dt = Math.min((time - lastTime) / 1000, 1 / 30);
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // ---------- Input ----------

  document.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      if (!event.repeat) flap();
    }
  });

  canvas.addEventListener("pointerdown", function (event) {
    event.preventDefault();
    flap();
  });

  reset();
  requestAnimationFrame(function (time) {
    lastTime = time;
    requestAnimationFrame(loop);
  });
})();

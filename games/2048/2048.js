(function () {
  const boardElement = document.getElementById("board");
  const scoreElement = document.getElementById("score");
  const bestElement = document.getElementById("best");
  const status = document.getElementById("status");
  const bestKey = "2048:best";
  let grid;
  let score;
  let best;
  let ended;
  let touchStart;

  try { best = Number(localStorage.getItem(bestKey)) || 0; } catch (error) { best = 0; }

  function addTile() {
    const empty = [];
    grid.forEach((value, index) => { if (!value) empty.push(index); });
    if (empty.length) grid[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    boardElement.replaceChildren();
    grid.forEach((value) => {
      const cell = document.createElement("div");
      cell.className = "board-cell" + (value ? (value <= 64 ? " tile-" + value : " tile-high") : "");
      cell.textContent = value || "";
      cell.setAttribute("aria-label", value ? String(value) : "Empty");
      boardElement.appendChild(cell);
    });
    scoreElement.textContent = score;
    bestElement.textContent = best;
  }

  function canMove() {
    if (grid.some((value) => !value)) return true;
    for (let row = 0; row < 4; row += 1) for (let col = 0; col < 4; col += 1) {
      const index = row * 4 + col;
      if (col < 3 && grid[index] === grid[index + 1] || row < 3 && grid[index] === grid[index + 4]) return true;
    }
    return false;
  }

  function move(direction) {
    if (ended) return;
    const before = grid.join(",");
    for (let line = 0; line < 4; line += 1) {
      const indices = Array.from({ length: 4 }, (_, offset) => direction === "left" ? line * 4 + offset : direction === "right" ? line * 4 + 3 - offset : direction === "up" ? offset * 4 + line : (3 - offset) * 4 + line);
      const values = indices.map((index) => grid[index]).filter(Boolean);
      for (let i = 0; i < values.length - 1; i += 1) {
        if (values[i] === values[i + 1]) {
          values[i] *= 2;
          score += values[i];
          values.splice(i + 1, 1);
        }
      }
      while (values.length < 4) values.push(0);
      indices.forEach((index, offset) => { grid[index] = values[offset]; });
    }
    if (before === grid.join(",")) return;
    addTile();
    if (score > best) {
      best = score;
      try { localStorage.setItem(bestKey, String(best)); } catch (error) { /* Storage is optional. */ }
    }
    if (grid.includes(2048)) status.textContent = "2048! Keep playing or start a new game.";
    if (!canMove()) { ended = true; status.textContent = "No moves left. Start a new game to play again."; }
    render();
  }

  function reset() {
    grid = Array(16).fill(0);
    score = 0;
    ended = false;
    status.textContent = "";
    addTile(); addTile(); render();
  }

  const keys = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right", ArrowUp: "up", w: "up", ArrowDown: "down", s: "down" };
  document.addEventListener("keydown", (event) => {
    if (keys[event.key]) { event.preventDefault(); move(keys[event.key]); }
  });
  boardElement.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0]; }, { passive: true });
  boardElement.addEventListener("touchend", (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.clientX;
    const dy = touch.clientY - touchStart.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up");
    touchStart = null;
  }, { passive: true });
  document.getElementById("restart").addEventListener("click", reset);
  reset();
})();
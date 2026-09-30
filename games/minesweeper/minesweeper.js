(function () {
  const width = 10;
  const mineCount = 12;
  const boardElement = document.getElementById("board");
  const status = document.getElementById("status");
  const remaining = document.getElementById("remaining");
  const flagButton = document.getElementById("flag-mode");
  let cells;
  let started;
  let ended;
  let flagMode = false;

  function neighbors(index) {
    const row = Math.floor(index / width); const col = index % width;
    const result = [];
    for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
      const y = row + dy; const x = col + dx;
      if ((dx || dy) && x >= 0 && x < width && y >= 0 && y < width) result.push(y * width + x);
    }
    return result;
  }

  function render() {
    boardElement.replaceChildren();
    cells.forEach((cell, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "board-cell" + (cell.revealed ? " is-revealed" : "") + (cell.revealed && cell.mine ? " is-mine" : "");
      button.textContent = cell.flagged ? "⚑" : cell.revealed ? cell.mine ? "✹" : cell.count || "" : "";
      button.setAttribute("aria-label", cell.flagged ? "Flagged square" : cell.revealed ? cell.mine ? "Mine" : cell.count + " neighboring mines" : "Hidden square");
      button.disabled = cell.revealed || ended;
      button.addEventListener("click", () => { if (flagMode) toggleFlag(index); else reveal(index); });
      button.addEventListener("contextmenu", (event) => { event.preventDefault(); toggleFlag(index); });
      boardElement.appendChild(button);
    });
    remaining.textContent = Math.max(0, mineCount - cells.filter((cell) => cell.flagged).length);
  }

  function placeMines(firstIndex) {
    const protectedCells = new Set([firstIndex, ...neighbors(firstIndex)]);
    let placed = 0;
    while (placed < mineCount) {
      const index = Math.floor(Math.random() * cells.length);
      if (protectedCells.has(index) || cells[index].mine) continue;
      cells[index].mine = true; placed += 1;
    }
    cells.forEach((cell, index) => { cell.count = neighbors(index).filter((neighbor) => cells[neighbor].mine).length; });
  }

  function reveal(index) {
    if (ended || cells[index].revealed || cells[index].flagged) return;
    if (!started) { started = true; placeMines(index); status.textContent = ""; }
    const cell = cells[index];
    cell.revealed = true;
    if (cell.mine) {
      ended = true; status.textContent = "Mine hit. Start a new game to try again.";
      cells.forEach((item) => { if (item.mine) item.revealed = true; });
      render(); return;
    }
    if (cell.count === 0) neighbors(index).forEach((neighbor) => { if (!cells[neighbor].revealed) reveal(neighbor); });
    if (cells.filter((item) => !item.mine && item.revealed).length === cells.length - mineCount) {
      ended = true; status.textContent = "Field cleared. Nice work!";
    }
    render();
  }

  function toggleFlag(index) {
    if (ended || cells[index].revealed) return;
    cells[index].flagged = !cells[index].flagged;
    render();
  }

  function reset() {
    cells = Array.from({ length: width * width }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }));
    started = false; ended = false; status.textContent = "Reveal a square to begin."; render();
  }

  flagButton.addEventListener("click", () => {
    flagMode = !flagMode;
    flagButton.textContent = "Flag mode: " + (flagMode ? "on" : "off");
    flagButton.setAttribute("aria-pressed", String(flagMode));
  });
  document.getElementById("restart").addEventListener("click", reset);
  reset();
})();
(function () {
  const boardElement = document.getElementById("board");
  const status = document.getElementById("status");
  const turnLabel = document.getElementById("turn");
  const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let board;
  let active;
  let finished;
  let computerTurn;

  function winner(cells) {
    return wins.find((line) => cells[line[0]] && line.every((index) => cells[index] === cells[line[0]]));
  }

  function render() {
    boardElement.replaceChildren();
    board.forEach((mark, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "board-cell ttt-cell";
      button.textContent = mark;
      button.setAttribute("aria-label", "Square " + (index + 1) + (mark ? ": " + mark : ": empty"));
      button.disabled = Boolean(mark) || finished || !active;
      button.addEventListener("click", () => play(index));
      boardElement.appendChild(button);
    });
    turnLabel.textContent = active ? "X" : "O";
  }

  function conclude() {
    const line = winner(board);
    if (line) {
      finished = true;
      status.textContent = board[line[0]] === "X" ? "You win!" : "Computer wins this round.";
      line.forEach((index) => boardElement.children[index].classList.add("is-winner"));
    } else if (board.every(Boolean)) {
      finished = true;
      status.textContent = "It's a draw.";
    }
  }

  function play(index) {
    if (finished || !active || board[index]) return;
    board[index] = "X";
    active = false;
    render();
    conclude();
    if (finished) return;
    status.textContent = "Computer thinking…";
    computerTurn = setTimeout(() => {
      const open = board.map((mark, cellIndex) => mark ? -1 : cellIndex).filter((cellIndex) => cellIndex >= 0);
      const choice = open.find((cellIndex) => {
        const trial = board.slice(); trial[cellIndex] = "O"; return Boolean(winner(trial));
      }) ?? open.find((cellIndex) => {
        const trial = board.slice(); trial[cellIndex] = "X"; return Boolean(winner(trial));
      }) ?? (board[4] ? undefined : 4) ?? open[Math.floor(Math.random() * open.length)];
      if (choice !== undefined) board[choice] = "O";
      active = true;
      render();
      conclude();
      if (finished) render();
      if (!finished) status.textContent = "Your turn";
    }, 320);
  }

  function reset() {
    clearTimeout(computerTurn);
    board = Array(9).fill("");
    active = true;
    finished = false;
    status.textContent = "Your turn";
    render();
  }

  document.getElementById("restart").addEventListener("click", reset);
  reset();
})();
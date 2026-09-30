(function () {
  const icons = ["🍋", "🍉", "🍇", "🍒", "🥝", "🍍", "🍓", "🥥"];
  const board = document.getElementById("board");
  const movesElement = document.getElementById("moves");
  const pairsElement = document.getElementById("pairs");
  const status = document.getElementById("status");
  let cards = [];
  let opened = [];
  let moves = 0;
  let matched = 0;
  let locked = false;
  let timer;

  function start() {
    clearTimeout(timer);
    cards = [...icons, ...icons].map((icon, id) => ({ icon, id })).sort(() => Math.random() - 0.5);
    opened = [];
    moves = 0;
    matched = 0;
    locked = false;
    movesElement.textContent = moves;
    pairsElement.textContent = "0/8";
    status.textContent = "";
    board.replaceChildren();
    cards.forEach((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "board-cell memory-card";
      button.textContent = "?";
      button.setAttribute("aria-label", "Hidden card " + (index + 1));
      button.addEventListener("click", () => flip(index));
      board.appendChild(button);
    });
  }

  function flip(index) {
    if (locked || opened.includes(index) || board.children[index].classList.contains("is-matched")) return;
    const button = board.children[index];
    button.textContent = cards[index].icon;
    button.classList.add("is-open");
    button.setAttribute("aria-label", cards[index].icon);
    opened.push(index);
    if (opened.length < 2) return;
    moves += 1;
    movesElement.textContent = moves;
    const [first, second] = opened;
    if (cards[first].icon === cards[second].icon) {
      [first, second].forEach((cardIndex) => {
        board.children[cardIndex].classList.add("is-matched");
        board.children[cardIndex].disabled = true;
      });
      matched += 1;
      pairsElement.textContent = matched + "/8";
      opened = [];
      if (matched === icons.length) status.textContent = "All pairs found in " + moves + " moves!";
    } else {
      locked = true;
      timer = setTimeout(() => {
        [first, second].forEach((cardIndex) => {
          board.children[cardIndex].textContent = "?";
          board.children[cardIndex].classList.remove("is-open");
          board.children[cardIndex].setAttribute("aria-label", "Hidden card");
        });
        opened = [];
        locked = false;
      }, 700);
    }
  }

  document.getElementById("restart").addEventListener("click", start);
  start();
})();
// Renders one tile per entry in window.GAMES.
(function () {
  const grid = document.getElementById("game-grid");

  function readBestScore(key) {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch (e) {
      return 0;
    }
  }

  function createTile(game) {
    const tile = document.createElement("a");
    tile.className = "game-tile";
    tile.href = game.url;
    tile.setAttribute("aria-label", "Play " + game.title);

    const art = document.createElement("div");
    art.className = "game-tile-art";
    art.style.background = game.color;
    art.textContent = game.icon;

    const body = document.createElement("div");
    body.className = "game-tile-body";

    const title = document.createElement("h2");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description;

    const footer = document.createElement("div");
    footer.className = "game-tile-footer";

    const best = document.createElement("span");
    best.className = "game-tile-best";
    best.textContent = "Best: " + readBestScore(game.bestScoreKey);

    const play = document.createElement("span");
    play.className = "game-tile-play";
    play.textContent = "Play";

    footer.append(best, play);
    body.append(title, description, footer);
    tile.append(art, body);
    return tile;
  }

  window.GAMES.forEach(function (game) {
    grid.appendChild(createTile(game));
  });
})();

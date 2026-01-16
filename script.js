const gridElement = document.getElementById("grid");
const CELL_SIZE = 30;
const PADDING = 32;

const buildGrid = () => {
  const availableWidth = window.innerWidth - PADDING;
  const availableHeight = window.innerHeight - PADDING;

  const columns = Math.max(1, Math.floor(availableWidth / CELL_SIZE));
  const rows = Math.max(1, Math.floor(availableHeight / CELL_SIZE));

  gridElement.style.gridTemplateColumns = `repeat(${columns}, ${CELL_SIZE}px)`;
  gridElement.style.gridTemplateRows = `repeat(${rows}, ${CELL_SIZE}px)`;

  gridElement.innerHTML = "";

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < columns * rows; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.setAttribute("aria-pressed", "false");
    cell.addEventListener("click", () => {
      const isAlive = cell.classList.toggle("is-alive");
      cell.setAttribute("aria-pressed", String(isAlive));
    });
    fragment.appendChild(cell);
  }

  gridElement.appendChild(fragment);
};

window.addEventListener("resize", () => {
  buildGrid();
});

buildGrid();

const gridElement = document.getElementById("grid");
const toggleRunButton = document.getElementById("toggle-run");
const stepButton = document.getElementById("step");
const clearButton = document.getElementById("clear");

const CELL_SIZE = 30;
const PADDING = 64;
const TICK_MS = 200;

let columns = 0;
let rows = 0;
let cells = [];
let isRunning = false;
let timerId = null;

const createEmptyState = (count) => Array.from({ length: count }, () => 0);

const buildGrid = () => {
  const availableWidth = window.innerWidth - PADDING;
  const availableHeight = window.innerHeight - PADDING - 140;

  columns = Math.max(1, Math.floor(availableWidth / CELL_SIZE));
  rows = Math.max(1, Math.floor(availableHeight / CELL_SIZE));

  gridElement.style.gridTemplateColumns = `repeat(${columns}, ${CELL_SIZE}px)`;
  gridElement.style.gridTemplateRows = `repeat(${rows}, ${CELL_SIZE}px)`;

  gridElement.innerHTML = "";
  cells = createEmptyState(columns * rows);

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < columns * rows; index += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = String(index);
    cell.setAttribute("aria-pressed", "false");
    cell.addEventListener("click", () => {
      const current = cells[index];
      const next = current === 1 ? 0 : 1;
      cells[index] = next;
      cell.classList.toggle("is-alive", next === 1);
      cell.setAttribute("aria-pressed", String(next === 1));
    });
    fragment.appendChild(cell);
  }

  gridElement.appendChild(fragment);
};

const getIndex = (row, col) => row * columns + col;

const countAliveNeighbors = (row, col, state) => {
  let count = 0;
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }
      const neighborRow = row + rowOffset;
      const neighborCol = col + colOffset;
      if (neighborRow < 0 || neighborRow >= rows || neighborCol < 0 || neighborCol >= columns) {
        continue;
      }
      const neighborIndex = getIndex(neighborRow, neighborCol);
      if (state[neighborIndex] === 1) {
        count += 1;
      }
    }
  }
  return count;
};

const applyRules = () => {
  const nextState = createEmptyState(columns * rows);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const index = getIndex(row, col);
      const alive = cells[index] === 1;
      const neighbors = countAliveNeighbors(row, col, cells);

      if (alive && (neighbors === 2 || neighbors === 3)) {
        nextState[index] = 1;
      } else if (!alive && neighbors === 3) {
        nextState[index] = 1;
      }
    }
  }

  cells = nextState;
  renderState();
};

const renderState = () => {
  const cellNodes = gridElement.querySelectorAll(".cell");
  cellNodes.forEach((cell, index) => {
    const alive = cells[index] === 1;
    cell.classList.toggle("is-alive", alive);
    cell.setAttribute("aria-pressed", String(alive));
  });
};

const setRunning = (nextRunning) => {
  isRunning = nextRunning;
  toggleRunButton.textContent = isRunning ? "暂停" : "开始";

  if (isRunning) {
    timerId = window.setInterval(applyRules, TICK_MS);
  } else if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
};

const clearGrid = () => {
  cells = createEmptyState(columns * rows);
  renderState();
};

toggleRunButton.addEventListener("click", () => {
  setRunning(!isRunning);
});

stepButton.addEventListener("click", () => {
  if (!isRunning) {
    applyRules();
  }
});

clearButton.addEventListener("click", () => {
  if (isRunning) {
    setRunning(false);
  }
  clearGrid();
});

window.addEventListener("resize", () => {
  buildGrid();
  if (isRunning) {
    setRunning(false);
  }
});

buildGrid();

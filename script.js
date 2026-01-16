const gridElement = document.getElementById("grid");
const toggleRunButton = document.getElementById("toggle-run");
const stepButton = document.getElementById("step");
const clearButton = document.getElementById("clear");
const sizeSelect = document.getElementById("size");
const speedSelect = document.getElementById("speed");

const PADDING = 64;
const SIZE_CONFIG = {
  small: { columns: 40, rows: 40 },
  medium: { columns: 70, rows: 70 },
  large: { columns: 100, rows: 100 },
};
const SPEED_MS = {
  slow: 450,
  medium: 250,
  fast: 120,
};

let columns = 0;
let rows = 0;
let cells = [];
let isRunning = false;
let timerId = null;
let isDrawing = false;
let drawMode = 1;
let currentTick = SPEED_MS.medium;

const createEmptyState = (count) => Array.from({ length: count }, () => 0);

const buildGrid = () => {
  const availableWidth = window.innerWidth - PADDING;
  const availableHeight = window.innerHeight - PADDING - 180;
  const config = SIZE_CONFIG[sizeSelect.value] ?? SIZE_CONFIG.medium;

  columns = config.columns;
  rows = config.rows;
  const cellSize = Math.max(
    6,
    Math.floor(Math.min(availableWidth / columns, availableHeight / rows)),
  );

  gridElement.style.setProperty("--cell-size", `${cellSize}px`);
  gridElement.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
  gridElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  gridElement.innerHTML = "";
  cells = createEmptyState(columns * rows);

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < columns * rows; index += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = String(index);
    cell.setAttribute("aria-pressed", "false");
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

const updateCell = (index, nextValue) => {
  if (index < 0 || index >= cells.length) {
    return;
  }
  cells[index] = nextValue;
  const cell = gridElement.querySelector(`.cell[data-index="${index}"]`);
  if (cell) {
    cell.classList.toggle("is-alive", nextValue === 1);
    cell.setAttribute("aria-pressed", String(nextValue === 1));
  }
};

const setRunning = (nextRunning) => {
  isRunning = nextRunning;
  toggleRunButton.textContent = isRunning ? "暂停" : "开始";

  if (isRunning) {
    timerId = window.setInterval(applyRules, currentTick);
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

sizeSelect.addEventListener("change", () => {
  buildGrid();
  if (isRunning) {
    setRunning(false);
  }
});

speedSelect.addEventListener("change", () => {
  currentTick = SPEED_MS[speedSelect.value] ?? SPEED_MS.medium;
  if (isRunning) {
    setRunning(false);
    setRunning(true);
  }
});

gridElement.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

gridElement.addEventListener("pointerdown", (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const indexValue = event.target.dataset.index;
  if (!indexValue) {
    return;
  }
  const index = Number(indexValue);
  drawMode = event.button === 2 ? 0 : 1;
  isDrawing = true;
  updateCell(index, drawMode);
});

gridElement.addEventListener("pointerover", (event) => {
  if (!isDrawing) {
    return;
  }
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const indexValue = event.target.dataset.index;
  if (!indexValue) {
    return;
  }
  updateCell(Number(indexValue), drawMode);
});

window.addEventListener("pointerup", () => {
  isDrawing = false;
});

window.addEventListener("resize", () => {
  buildGrid();
  if (isRunning) {
    setRunning(false);
  }
});

currentTick = SPEED_MS[speedSelect.value] ?? SPEED_MS.medium;
buildGrid();

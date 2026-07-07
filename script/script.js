const cases = [
  {
    title: 'Pós-operatório orientado',
    risk: 'Baixo risco',
    riskClass: 'low',
    size: 14,
    pathTitle: 'Base do cuidado',
    transitionText: 'O cuidado comeca pelo basico bem feito: validar, orientar, posicionar e registrar com clareza.',
    description: 'Paciente comunicativa, com dor relacionada ao procedimento e boa compreensão das orientações.',
    factors: ['Dor procedural recente', 'Comunicação preservada', 'Ansiedade leve ao movimento', 'Rede familiar presente'],
    words: ['VALIDAÇÃO', 'COMUNICAÇÃO', 'CONFORTO', 'RESPIRAÇÃO', 'METAS', 'REGISTRO', 'POSICIONAMENTO'],
    hint: 'Procure condutas básicas e proporcionais para um caso de baixo risco.'
  },
  {
    title: 'Imobilidade e medo do movimento',
    risk: 'Risco moderado',
    riskClass: 'moderate',
    size: 15,
    pathTitle: 'Integracao funcional',
    transitionText: 'Agora o plano precisa conectar dor, movimento, seguranca e confianca funcional.',
    description: 'Paciente com dor musculoesquelética após internação prolongada, insegurança para sentar e baixa confiança funcional.',
    factors: ['Dor associada à imobilidade', 'Medo do movimento', 'Baixa autoeficácia', 'Limitação funcional'],
    words: ['ESCUTA', 'AUTONOMIA', 'EDUCAÇÃO', 'ALONGAMENTOS', 'CONFIANÇA', 'SEGURANÇA', 'METAS', 'SEDESTAÇÃO', 'MOBILIZAÇÃO', 'TERMOTERAPIA'],
    hint: 'Encontre palavras ligadas à recuperação funcional e à reconstrução da confiança.'
  },
  {
    title: 'Dor intensa, vulnerabilidade e crenças',
    risk: 'Alto risco',
    riskClass: 'high',
    size: 16,
    pathTitle: 'Cuidado ampliado',
    transitionText: 'Neste caso, a dor nao esta sozinha: ela atravessa medo, valores, familia, contexto social e equipe.',
    description: 'Paciente com dor intensa e persistente, medo de piora, vulnerabilidade social, distância da família e crenças importantes sobre adoecimento.',
    factors: ['Dor intensa e persistente', 'Ansiedade e medo', 'Vulnerabilidade social', 'Crenças, fé e valores relevantes', 'Necessidade de plano integrado'],
    words: ['ACOLHIMENTO', 'FAMÍLIA', 'INCLUSÃO', 'RELAXAMENTO', 'BEMESTAR', 'HUMANIZAÇÃO', 'ESCUTA', 'CRENÇAS', 'VALORES', 'INTERDISCIPLINAR', 'ELETROTERAPIA', 'MOBILIZAÇÃO'],
    hint: 'O alto risco aumenta a dificuldade e integra fatores físicos, emocionais, sociais, familiares e culturais.'
  }
];

const pathSteps = ['Base do cuidado', 'Integracao funcional', 'Cuidado ampliado'];

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const directions = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: -1, col: 1 }
];

let playerName = 'Profissional';
let currentCaseIndex = 0;
let score = 0;
let grid = [];
let placedWords = [];
let foundWords = new Set();
let selectedCells = [];
let isSelecting = false;
let selectionStartCell = null;
let suppressNextClick = false;
let results = [];

const screens = {
  intro: document.getElementById('intro'),
  video: document.getElementById('video-screen'),
  game: document.getElementById('game-area'),
  final: document.getElementById('final-screen')
};

const gameContainer = document.getElementById('game-container');
const logo = document.getElementById('logo');
const video = document.getElementById('intro-video');
const videoFallback = document.getElementById('video-fallback');
const bgAudio = document.getElementById('sound-bg');
const correctAudio = new Audio('audio/certo.mp3');
const victoryAudio = new Audio('audio/vitoria.mp3');
const finalAudio = new Audio('audio/final.mp3');
const phaseVoiceAudios = [
  new Audio('audio/voz01.mp3'),
  new Audio('audio/voz02.mp3')
];
const backToTopButton = document.getElementById('back-to-top');
const board = document.getElementById('word-search');
const phaseModal = document.getElementById('phase-modal');
const phaseModalMessage = document.getElementById('phase-modal-message');
const phaseModalButton = document.getElementById('phase-modal-btn');
const phaseStars = document.getElementById('phase-stars');
const finalStars = document.getElementById('final-stars');
const phaseMessages = [
  'Parabéns, você achou os manejos para esse paciente. E agora vamos para o próximo! A estratificação de risco agora é um pouco maior. Boa sorte.',
  'Você está evoluindo muito bem! Vamos para o paciente mais difícil agora. Não perca tempo.'
];

document.getElementById('case-total').textContent = cases.length;

document.getElementById('start-intro-btn').addEventListener('click', () => showScreen('video'));

document.getElementById('start-btn').addEventListener('click', () => {
  const typedName = document.getElementById('player-name').value.trim();
  playerName = typedName || 'Profissional';
  document.getElementById('player-display').textContent = playerName;
  stopIntroVideo();
  showScreen('game');
  loadCase(0);
  tryPlayAudio();
});

document.getElementById('next-case').addEventListener('click', () => {
  if (currentCaseIndex + 1 < cases.length) {
    loadCase(currentCaseIndex + 1);
  } else {
    showFinalScreen();
  }
});

phaseModalButton.addEventListener('click', () => {
  const nextIndex = Number(phaseModalButton.dataset.nextIndex);
  closePhaseModal();
  loadCase(nextIndex);
});

logo.addEventListener('error', () => {
  logo.style.display = 'none';
  document.querySelector('.brand-fallback').style.display = 'inline-block';
});

video.addEventListener('error', () => {
  video.style.display = 'none';
  videoFallback.classList.add('active');
});

video.addEventListener('canplay', () => {
  videoFallback.classList.remove('active');
});

backToTopButton.addEventListener('click', () => {
  document.getElementById('game-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

window.addEventListener('scroll', updateBackToTopVisibility);
window.addEventListener('pointerup', finishSelection);

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
  gameContainer.classList.toggle('intro-mode', name === 'intro');
  document.body.classList.toggle('game-started', name === 'game');
  if (name === 'video') {
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {});
  } else {
    stopIntroVideo();
  }
  updateBackToTopVisibility();
}

function stopIntroVideo() {
  video.pause();
  video.currentTime = 0;
}

function tryPlayAudio() {
  bgAudio.volume = 0.28;
  bgAudio.play().catch(() => {});
}

function playEffect(audio, volume = 0.78) {
  audio.pause();
  audio.currentTime = 0;
  audio.volume = volume;
  audio.play().catch(() => {});
}

function playVictoryThenVoice(voiceAudio) {
  victoryAudio.pause();
  victoryAudio.currentTime = 0;
  victoryAudio.volume = 0.85;
  victoryAudio.onended = null;
  victoryAudio.play().catch(() => {});

  if (voiceAudio) {
    playEffect(voiceAudio, 0.95);
  }
}

function closePhaseModal() {
  phaseModal.classList.remove('active');
  phaseModal.setAttribute('aria-hidden', 'true');
  phaseVoiceAudios.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function showPhaseModal(nextIndex) {
  const messageIndex = nextIndex - 1;
  phaseModalMessage.textContent = phaseMessages[messageIndex];
  renderStars(phaseStars, nextIndex);
  phaseModalButton.dataset.nextIndex = String(nextIndex);
  phaseModal.classList.add('active');
  phaseModal.setAttribute('aria-hidden', 'false');
}

function renderStars(target, activeCount) {
  target.innerHTML = Array.from({ length: 3 }, (_, index) => {
    const className = index < activeCount ? 'star lit' : 'star dim';
    return `<span class="${className}" aria-hidden="true">★</span>`;
  }).join('');
}

function loadCase(index) {
  currentCaseIndex = index;
  foundWords = new Set();
  selectedCells = [];
  closePhaseModal();
  const currentCase = cases[index];
  const puzzle = buildPuzzle(currentCase);
  grid = puzzle.grid;
  placedWords = puzzle.placedWords;

  document.getElementById('case-counter').textContent = index + 1;
  document.getElementById('patient-title').textContent = currentCase.title;
  document.getElementById('patient-description').textContent = currentCase.description;
  document.getElementById('risk-label').textContent = currentCase.risk;
  document.querySelector('.risk-strip').className = `risk-strip ${currentCase.riskClass}`;
  document.getElementById('factor-list').innerHTML = currentCase.factors.map((factor) => `<li>${factor}</li>`).join('');
  document.getElementById('hint-text').textContent = currentCase.hint;
  document.getElementById('word-total').textContent = currentCase.words.length;
  document.getElementById('found-count').textContent = '0';
  document.getElementById('next-case').classList.remove('visible');
  document.getElementById('next-case').textContent = index + 1 < cases.length ? 'PRÓXIMA FASE' : 'VER RESULTADO FINAL';

  renderBoard(currentCase.size);
  renderWordList();
  updatePath(index);
  updateScore();
  setFeedback('Clique na primeira e na última letra, ou arraste sobre a palavra.', 'neutral');
}

function updatePath(activeIndex) {
  document.querySelectorAll('.path-step').forEach((step) => {
    const index = Number(step.dataset.pathStep);
    if (Number.isNaN(index)) return;
    step.classList.toggle('active', index === activeIndex);
    step.classList.toggle('done', index < activeIndex);
  });
}

function buildPuzzle(currentCase) {
  const size = currentCase.size;
  const sortedWords = [...currentCase.words].sort((a, b) => normalizeWord(b).length - normalizeWord(a).length);

  for (let puzzleAttempt = 0; puzzleAttempt < 80; puzzleAttempt += 1) {
    const nextGrid = Array.from({ length: size }, () => Array(size).fill(''));
    const nextPlacedWords = [];

    sortedWords.forEach((displayWord) => {
      const word = normalizeWord(displayWord);
      const placement = placeWord(nextGrid, word, displayWord, size);
      if (placement) {
        nextPlacedWords.push(placement);
      }
    });

    if (nextPlacedWords.length === sortedWords.length) {
      fillEmptyCells(nextGrid, size);
      return { grid: nextGrid, placedWords: nextPlacedWords };
    }
  }

  const fallbackGrid = Array.from({ length: size }, () => Array(size).fill(''));
  const fallbackPlacedWords = [];
  sortedWords.forEach((displayWord) => {
    const placement = placeWord(fallbackGrid, normalizeWord(displayWord), displayWord, size);
    if (placement) fallbackPlacedWords.push(placement);
  });
  fillEmptyCells(fallbackGrid, size);
  return { grid: fallbackGrid, placedWords: fallbackPlacedWords };
}

function fillEmptyCells(nextGrid, size) {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!nextGrid[row][col]) {
        nextGrid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function placeWord(nextGrid, word, displayWord, size) {
  const attempts = 300;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    const cells = [];

    for (let index = 0; index < word.length; index += 1) {
      const nextRow = row + direction.row * index;
      const nextCol = col + direction.col * index;

      if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) {
        cells.length = 0;
        break;
      }

      const currentLetter = nextGrid[nextRow][nextCol];
      if (currentLetter && currentLetter !== word[index]) {
        cells.length = 0;
        break;
      }

      cells.push({ row: nextRow, col: nextCol, letter: word[index] });
    }

    if (cells.length === word.length) {
      cells.forEach((cell) => {
        nextGrid[cell.row][cell.col] = cell.letter;
      });
      return { word, displayWord, cells: cells.map(({ row, col }) => ({ row, col })) };
    }
  }

  return null;
}

function renderBoard(size) {
  board.innerHTML = '';
  board.style.setProperty('--grid-size', size);

  grid.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'letter-cell';
      cell.textContent = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      cell.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        suppressNextClick = true;
        if (selectedCells.length === 1 && cellKey(selectedCells[0]) !== cellKey(cell)) {
          isSelecting = false;
          selectLineBetween(selectedCells[0], cell);
          checkSelection();
          return;
        }
        isSelecting = true;
        selectionStartCell = cell;
        selectedCells = [];
        addCellToSelection(cell);
      });
      cell.addEventListener('pointerenter', () => {
        if (isSelecting && selectionStartCell) {
          selectLineBetween(selectionStartCell, cell);
        }
      });
      cell.addEventListener('click', () => handleCellClick(cell));
      board.appendChild(cell);
    });
  });
}

function renderWordList() {
  const list = document.getElementById('word-list');
  list.innerHTML = '';

  cases[currentCaseIndex].words.forEach((word) => {
    const item = document.createElement('div');
    item.className = 'word-item';
    item.dataset.word = normalizeWord(word);
    item.innerHTML = `${word}<span>${normalizeWord(word).length} letras</span>`;
    list.appendChild(item);
  });
}

function handleCellClick(cell) {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }

  if (isSelecting) return;

  if (selectedCells.length === 0) {
    addCellToSelection(cell);
    return;
  }

  if (selectedCells.length === 1) {
    selectLineBetween(selectedCells[0], cell);
    checkSelection();
    return;
  }

  clearSelection();
  addCellToSelection(cell);
}

function addCellToSelection(cell) {
  const key = cellKey(cell);
  if (selectedCells.some((selected) => cellKey(selected) === key)) return;
  selectedCells.push(cell);
  cell.classList.add('selected');
}

function finishSelection() {
  if (!isSelecting) return;
  isSelecting = false;
  selectionStartCell = null;
  checkSelection();
}

function selectLineBetween(startCell, endCell) {
  clearSelection(true, false);
  const start = getCellPosition(startCell);
  const end = getCellPosition(endCell);
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;
  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  const rowStep = Math.sign(rowDiff);
  const colStep = Math.sign(colDiff);

  if (!(rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff))) {
    addCellToSelection(startCell);
    addCellToSelection(endCell);
    return;
  }

  for (let index = 0; index <= steps; index += 1) {
    const cell = getCell(start.row + rowStep * index, start.col + colStep * index);
    if (cell) addCellToSelection(cell);
  }
}

function checkSelection() {
  if (!selectedCells.length) return;
  const selectedKeys = selectedCells.map(cellKey);
  const match = placedWords.find((item) => {
    const keys = item.cells.map((cell) => `${cell.row}-${cell.col}`);
    const reversedKeys = [...keys].reverse();
    return arraysEqual(selectedKeys, keys) || arraysEqual(selectedKeys, reversedKeys);
  });

  if (match && !foundWords.has(match.word)) {
    markFound(match);
    return;
  }

  if (selectedCells.length > 1) {
    markWrong();
  }
}

function markFound(match) {
  foundWords.add(match.word);
  match.cells.forEach((position) => {
    const cell = getCell(position.row, position.col);
    cell.classList.remove('selected');
    cell.classList.add('found');
  });
  const item = document.querySelector(`.word-item[data-word="${match.word}"]`);
  item?.classList.add('found');
  score += 10;
  updateScore();
  clearSelection(false);
  document.getElementById('found-count').textContent = foundWords.size;
  setFeedback(`Boa! Você encontrou ${match.displayWord}.`, 'success');

  playEffect(correctAudio, 0.72);

  if (foundWords.size === cases[currentCaseIndex].words.length) {
    finishCase();
  }
}

function markWrong() {
  selectedCells.forEach((cell) => cell.classList.add('wrong'));
  score = Math.max(0, score - 2);
  updateScore();
  setFeedback('Essa sequência não corresponde a uma conduta da lista. Tente outra direção.', 'warning');
  window.setTimeout(() => {
    selectedCells.forEach((cell) => cell.classList.remove('selected', 'wrong'));
    selectedCells = [];
  }, 520);
}

function finishCase() {
  results.push({
    title: cases[currentCaseIndex].title,
    found: foundWords.size
  });
  setFeedback('Fase concluída. Todas as condutas foram encontradas.', 'success');
  const nextIndex = currentCaseIndex + 1;
  if (nextIndex < cases.length) {
    showPhaseModal(nextIndex);
    playVictoryThenVoice(phaseVoiceAudios[currentCaseIndex]);
    return;
  }

  playEffect(finalAudio, 0.9);
  showFinalScreen();
}

function clearSelection(removeClasses = true, resetStart = true) {
  if (removeClasses) {
    selectedCells.forEach((cell) => cell.classList.remove('selected', 'wrong'));
  }
  selectedCells = [];
  if (resetStart) {
    selectionStartCell = null;
  }
}

function showFinalScreen() {
  showScreen('final');
  const totalWords = cases.reduce((sum, item) => sum + item.words.length, 0);
  const foundTotal = results.reduce((sum, item) => sum + item.found, 0);

  renderStars(finalStars, 3);
  document.getElementById('final-title').textContent = 'Parabéns, fisioterapeuta você agora sabe manejar a dor na UTI Adulto.';
  document.getElementById('final-message').textContent =
    `${playerName}, sua pontuação final foi ${score}.`;
  document.getElementById('final-breakdown').innerHTML = `
    <div class="final-card"><strong>${foundTotal}</strong><span>Palavras encontradas</span></div>
    <div class="final-card"><strong>${totalWords}</strong><span>Palavras no total</span></div>
    <div class="final-card"><strong>${score}</strong><span>Pontos</span></div>
  `;
}

function updateScore() {
  document.getElementById('score-display').textContent = score;
}

function setFeedback(message, type) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.className = '';
  if (type && type !== 'neutral') {
    feedback.classList.add(type);
  }
}

function updateBackToTopVisibility() {
  const gameIsActive = screens.game.classList.contains('active');
  const shouldShow = gameIsActive && window.scrollY > 360;
  backToTopButton.classList.toggle('visible', shouldShow);
}

function normalizeWord(word) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/gi, '').toUpperCase();
}

function getCell(row, col) {
  return document.querySelector(`.letter-cell[data-row="${row}"][data-col="${col}"]`);
}

function getCellPosition(cell) {
  return {
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col)
  };
}

function cellKey(cell) {
  const position = getCellPosition(cell);
  return `${position.row}-${position.col}`;
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

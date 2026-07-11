const cases = [
  {
    title: 'Pós-operatório orientado',
    risk: 'Baixo risco',
    riskClass: 'low',
    size: 14,
    pathTitle: 'Base do cuidado',
    transitionText: 'O cuidado comeca pelo basico bem feito: validar, orientar, posicionar e registrar com clareza.',
    description: 'Paciente comunicativa, com dor relacionada ao procedimento de desbridamento e boa compreensão das orientações.',
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
    description: 'Paciente com dor musculoesquelética após internação prolongada por pneumonia, insegurança para sentar e baixa confiança funcional.',
    factors: ['Dor associada à imobilidade', 'Medo do movimento', 'Baixa autoeficácia', 'Limitação funcional'],
    words: ['ESCUTA', 'AUTONOMIA', 'EDUCAÇÃO', 'ALONGAMENTOS', 'CONFIANÇA', 'SEGURANÇA', 'METAS', 'SEDESTAÇÃO', 'MOBILIZAÇÃO', 'AMBIENTAL'],
    hint: 'Encontre palavras ligadas à recuperação funcional e à reconstrução da confiança.'
  },
  {
    title: 'Dor intensa, vulnerabilidade e crenças',
    risk: 'Alto risco',
    riskClass: 'high',
    size: 16,
    pathTitle: 'Cuidado ampliado',
    transitionText: 'Neste caso, a dor nao esta sozinha: ela atravessa medo, valores, familia, contexto social e equipe.',
    description: 'Paciente com dor intensa e persistente devido dreno de tórax, medo de piora, vulnerabilidade social, distância da família e crenças importantes sobre adoecimento.',
    factors: ['Dor intensa e persistente', 'Ansiedade e medo', 'Vulnerabilidade social', 'Crenças, fé e valores relevantes', 'Necessidade de plano integrado'],
    words: ['ACOLHIMENTO', 'FAMÍLIA', 'INCLUSÃO', 'RELAXAMENTO', 'REGISTRO', 'HUMANIZAÇÃO', 'ESCUTA', 'CRENÇAS', 'VALORES', 'INTERDISCIPLINAR', 'ELETROTERAPIA', 'MOBILIZAÇÃO'],
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
let grid = [];
let placedWords = [];
let foundWords = new Set();
let selectedCells = [];
let isSelecting = false;
let selectionStartCell = null;
let suppressNextClick = false;
let results = [];
let motivationTimer = null;
let motivationIndex = 0;
let caseStartTime = 0;
let caseTimer = null;
let caseTimes = [];

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
const caseAudios = [
  new Audio('audio/caso1.mp3'),
  new Audio('audio/caso2.mp3'),
  new Audio('audio/caso3.mp3')
];
const motivationAudios = [
  new Audio('audio/motivacao.mp3'),
  new Audio('audio/motivacao2.mp3'),
  new Audio('audio/motivacao3.mp3')
];
const motivationEffectAudio = new Audio('audio/efeitomot.mp3');
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
const instructionsModal = document.getElementById('instructions-modal');
const instructionsButton = document.getElementById('instructions-btn');
const instructionsClose = document.getElementById('instructions-close');
const readCaseButton = document.getElementById('read-case-btn');
const keywordModal = document.getElementById('keyword-modal');
const keywordModalTitle = document.getElementById('keyword-modal-title');
const keywordModalText = document.getElementById('keyword-modal-text');
const keywordClose = document.getElementById('keyword-close');
const phaseMessages = [
  'Você achou os manejos para esse paciente. E agora vamos para o próximo! A extratificação de risco agora é um pouco maior. Boa sorte.',
  'Você está evoluindo muito bem! Vamos para o paciente mais difícil agora. Não perca tempo.'
];
const keywordExplanations = {
  SEGURANCA: 'Priorize a segurança do paciente, respeitando contraindicações e monitorando riscos durante todas as intervenções.',
  POSICIONAMENTO: 'Realize posicionamentos adequados para promover conforto, prevenir complicações e reduzir a dor.',
  ACOLHIMENTO: 'Acolha o paciente com respeito e empatia, reconhecendo sua dor e necessidades.',
  ELETROTERAPIA: 'Utilize recursos eletroterapêuticos quando indicados para auxiliar no controle da dor.',
  AMBIENTAL: 'Adapte o ambiente para reduzir estressores, como ruídos, luminosidade e desconfortos térmicos.',
  CONFIANCA: 'Promova um ambiente colaborativo para fortalecer a confiança entre paciente e equipe.',
  INTERDISCIPLINAR: 'Integre diferentes profissionais para um manejo mais completo e eficaz da dor.',
  COMUNICACAO: 'Comunique-se de forma clara e empática, certificando-se de que o paciente compreendeu as orientações.',
  REGISTRO: 'Registre a avaliação e o manejo da dor de forma clara, completa e oportuna.',
  VALIDACAO: 'Reconheça e valide a dor do paciente para fortalecer o vínculo e reduzir o sofrimento.',
  METAS: 'Estabeleça metas terapêuticas específicas, realistas e voltadas à funcionalidade.',
  CONFORTO: 'Promova conforto físico e emocional por meio de medidas simples e individualizadas.',
  EDUCACAO: 'Oriente o paciente sobre dor e tratamento para estimular sua participação no cuidado.',
  CRENCAS: 'Respeite as crenças e experiências do paciente durante o tratamento.',
  VALORES: 'Considere os valores culturais e preferências individuais do paciente.',
  MOBILIZACAO: 'Incentive a mobilização precoce conforme as condições clínicas do paciente.',
  ALONGAMENTO: 'Utilize alongamentos para prevenir contraturas e preservar a mobilidade.',
  ALONGAMENTOS: 'Utilize alongamentos para prevenir contraturas e preservar a mobilidade.',
  AUTONOMIA: 'Estimule a independência funcional respeitando a capacidade do paciente.',
  SEDESTACAO: 'Favoreça a progressão para a posição sentada sempre que clinicamente seguro.',
  INCLUSAO: 'Envolva o paciente nas decisões e no planejamento do tratamento.',
  FAMILIA: 'Incentive a participação da família no cuidado e na reabilitação.',
  RELAXAMENTO: 'Utilize técnicas de relaxamento para reduzir tensão e desconforto.',
  RESPIRACAO: 'Empregue exercícios respiratórios para promover conforto e controle da ansiedade.',
  ESCUTA: 'Pratique escuta qualificada, valorizando as percepções e necessidades do paciente.',
  HUMANIZACAO: 'Minimize o sofrimento durante procedimentos por meio de condutas humanizadas.'
};

document.getElementById('case-total').textContent = cases.length;

document.getElementById('start-intro-btn').addEventListener('click', () => showScreen('video'));

readCaseButton.addEventListener('click', () => {
  playCaseAudio(currentCaseIndex);
});

instructionsButton.addEventListener('click', () => {
  instructionsModal.classList.add('active');
  instructionsModal.setAttribute('aria-hidden', 'false');
});

instructionsClose.addEventListener('click', closeInstructions);

keywordClose.addEventListener('click', closeKeywordModal);

instructionsModal.addEventListener('click', (event) => {
  if (event.target === instructionsModal) {
    closeInstructions();
  }
});

keywordModal.addEventListener('click', (event) => {
  if (event.target === keywordModal) {
    closeKeywordModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && instructionsModal.classList.contains('active')) {
    closeInstructions();
  }
  if (event.key === 'Escape' && keywordModal.classList.contains('active')) {
    closeKeywordModal();
  }
});

document.getElementById('start-btn').addEventListener('click', () => {
  const typedName = document.getElementById('player-name').value.trim();
  playerName = typedName || 'Profissional';
  document.getElementById('player-display').textContent = playerName;
  stopIntroVideo();
  showScreen('game');
  loadCase(0);
  tryPlayAudio();
  startMotivationTimer();
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

function startMotivationTimer() {
  if (motivationTimer) return;
  motivationTimer = window.setInterval(playTimedMotivation, 60000);
}

function stopMotivationTimer() {
  if (motivationTimer) {
    window.clearInterval(motivationTimer);
    motivationTimer = null;
  }
  stopMotivationAudios();
}

function stopMotivationAudios() {
  motivationAudios.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  motivationEffectAudio.pause();
  motivationEffectAudio.currentTime = 0;
}

function playTimedMotivation() {
  if (!screens.game.classList.contains('active') || phaseModal.classList.contains('active')) {
    return;
  }

  const audio = motivationAudios[motivationIndex % motivationAudios.length];
  motivationIndex += 1;
  playEffect(motivationEffectAudio, 0.72);
  playEffect(audio, 0.92);
}

function stopCaseAudios() {
  caseAudios.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  readCaseButton.classList.remove('playing');
  readCaseButton.textContent = 'LER O CASO';
}

function playCaseAudio(index) {
  const audio = caseAudios[index];
  if (!audio) return;

  stopCaseAudios();
  audio.volume = 0.95;
  readCaseButton.classList.add('playing');
  readCaseButton.textContent = 'OUVINDO...';
  audio.onended = () => {
    readCaseButton.classList.remove('playing');
    readCaseButton.textContent = 'OUVIR O CASO';
  };
  audio.play().catch(() => {
    readCaseButton.classList.remove('playing');
    readCaseButton.textContent = 'OUVIR O CASO';
  });
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

function closeInstructions() {
  instructionsModal.classList.remove('active');
  instructionsModal.setAttribute('aria-hidden', 'true');
}

function showKeywordModal(word) {
  const key = normalizeWord(word);
  const explanation = keywordExplanations[key];
  if (!explanation) return;

  keywordModalTitle.textContent = word;
  keywordModalText.textContent = explanation;
  keywordModal.classList.add('active');
  keywordModal.setAttribute('aria-hidden', 'false');
}

function closeKeywordModal() {
  keywordModal.classList.remove('active');
  keywordModal.setAttribute('aria-hidden', 'true');
}

function showPhaseModal(nextIndex) {
  const messageIndex = nextIndex - 1;
  const lastTime = caseTimes[nextIndex - 1];
  const timeFeedback = lastTime !== undefined ? `Seu tempo foi de ${formatElapsed(lastTime)}. ` : '';
  phaseModalMessage.textContent = `${timeFeedback}${phaseMessages[messageIndex]}`;
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

function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}min ${String(seconds).padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

function updateCaseTimer() {
  document.getElementById('time-display').textContent = formatClock(Date.now() - caseStartTime);
}

function startCaseTimer() {
  stopCaseTimer();
  caseStartTime = Date.now();
  updateCaseTimer();
  caseTimer = window.setInterval(updateCaseTimer, 1000);
}

function stopCaseTimer() {
  if (caseTimer) {
    window.clearInterval(caseTimer);
    caseTimer = null;
  }
}

function loadCase(index) {
  currentCaseIndex = index;
  foundWords = new Set();
  selectedCells = [];
  closePhaseModal();
  stopCaseAudios();
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
  startCaseTimer();
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
    const wordKey = normalizeWord(word);
    item.className = 'word-item';
    item.dataset.word = wordKey;

    const label = document.createElement('span');
    label.className = 'word-label';
    label.textContent = word;

    const meta = document.createElement('span');
    meta.className = 'word-meta';
    meta.textContent = `${wordKey.length} letras`;

    const infoButton = document.createElement('button');
    infoButton.className = 'keyword-info';
    infoButton.type = 'button';
    infoButton.setAttribute('aria-label', `Ver explicação de ${word}`);
    infoButton.textContent = '?';
    infoButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showKeywordModal(word);
    });

    const details = document.createElement('div');
    details.className = 'word-details';
    details.append(meta, infoButton);

    item.append(label, details);
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
  setFeedback('Essa sequência não corresponde a uma conduta da lista. Tente outra direção.', 'warning');
  window.setTimeout(() => {
    selectedCells.forEach((cell) => cell.classList.remove('selected', 'wrong'));
    selectedCells = [];
  }, 520);
}

function finishCase() {
  const elapsed = Date.now() - caseStartTime;
  stopCaseTimer();
  stopMotivationAudios();
  caseTimes[currentCaseIndex] = elapsed;
  results.push({
    title: cases[currentCaseIndex].title,
    found: foundWords.size,
    timeMs: elapsed
  });
  setFeedback(`Fase concluída. Todas as condutas foram encontradas. Seu tempo foi de ${formatElapsed(elapsed)}.`, 'success');
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
  stopCaseAudios();
  stopCaseTimer();
  stopMotivationTimer();
  showScreen('final');
  const foundTotal = results.reduce((sum, item) => sum + item.found, 0);
  const totalTime = caseTimes.reduce((sum, time) => sum + (time || 0), 0);
  const averageTime = totalTime / cases.length;

  renderStars(finalStars, 3);
  document.getElementById('final-title').textContent = 'Parabéns, fisioterapeuta você agora sabe manejar a dor na UTI Adulto.';
  document.getElementById('final-message').textContent =
    `${playerName}, sua média do tempo foi de ${formatElapsed(averageTime)}.`;
  document.getElementById('final-breakdown').innerHTML = `
    <div class="final-card"><strong>${foundTotal}</strong><span>Palavras encontradas</span></div>
    <div class="final-card final-card-time"><strong>${formatElapsed(averageTime)}</strong><span>Tempo médio</span></div>
  `;
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

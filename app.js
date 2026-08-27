const state = {
  mode: null,
  table: null,
  questionIndex: 0,
  score: 0,
  streak: 0,
  questions: [],
  answered: false,
  attempts: 0,
};

const els = {
  homeView: document.querySelector('#homeView'),
  quizView: document.querySelector('#quizView'),
  resultView: document.querySelector('#resultView'),
  tableGrid: document.querySelector('#tableGrid'),
  mixedButton: document.querySelector('#mixedButton'),
  backButton: document.querySelector('#backButton'),
  modeLabel: document.querySelector('#modeLabel'),
  questionCounter: document.querySelector('#questionCounter'),
  question: document.querySelector('#question'),
  answers: document.querySelector('#answers'),
  feedback: document.querySelector('#feedback'),
  nextButton: document.querySelector('#nextButton'),
  streak: document.querySelector('#streak'),
  stars: document.querySelector('#stars'),
  sessions: document.querySelector('#sessions'),
  bestStreak: document.querySelector('#bestStreak'),
  resultEmoji: document.querySelector('#resultEmoji'),
  resultTitle: document.querySelector('#resultTitle'),
  resultText: document.querySelector('#resultText'),
  finalScore: document.querySelector('#finalScore'),
  againButton: document.querySelector('#againButton'),
  homeButton: document.querySelector('#homeButton'),
};

const progress = JSON.parse(localStorage.getItem('antoniaMathProgress') || '{}');
progress.stars ||= 0;
progress.sessions ||= 0;
progress.bestStreak ||= 0;

function saveProgress() {
  localStorage.setItem('antoniaMathProgress', JSON.stringify(progress));
  renderProgress();
}

function renderProgress() {
  els.stars.textContent = progress.stars;
  els.sessions.textContent = progress.sessions;
  els.bestStreak.textContent = progress.bestStreak;
}

function showView(view) {
  [els.homeView, els.quizView, els.resultView].forEach(el => el.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildTableButtons() {
  for (let table = 1; table <= 10; table += 1) {
    const button = document.createElement('button');
    button.className = 'table-button';
    button.textContent = `× ${table}`;
    button.setAttribute('aria-label', `Practicar tabla del ${table}`);
    button.addEventListener('click', () => startSession({ mode: 'table', table }));
    els.tableGrid.appendChild(button);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1)) + 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createQuestion(table = null) {
  const a = table ?? randomInt(1, 10);
  const b = randomInt(1, 10);
  const correct = a * b;
  const alternatives = new Set([correct]);

  while (alternatives.size < 4) {
    const offset = randomInt(-10, 10);
    const candidate = Math.max(1, correct + offset);
    if (candidate !== correct) alternatives.add(candidate);
  }

  return {
    a,
    b,
    correct,
    options: shuffle([...alternatives]),
  };
}

function explainMultiplication(a, b) {
  const correct = a * b;

  if (b === 1) {
    return `Mira: ${a} × 1 = ${correct}. Multiplicar por 1 deja el mismo número.`;
  }

  if (b === 2) {
    return `Mira: ${a} × 2 es el doble de ${a}: ${a} + ${a} = ${correct}.`;
  }

  if (b <= 5) {
    const sum = Array.from({ length: b }, () => a).join(' + ');
    return `Mira: ${a} × ${b} significa sumar ${a}, ${b} veces: ${sum} = ${correct}.`;
  }

  if (b === 10) {
    return `Mira: ${a} × 10 = ${correct}. Al multiplicar un número entero por 10, agregamos un cero.`;
  }

  const rest = b - 5;
  const firstPart = a * 5;
  const secondPart = a * rest;
  return `Mira: ${a} × ${b} puede separarse en ${a} × 5 + ${a} × ${rest}: ${firstPart} + ${secondPart} = ${correct}.`;
}

function startSession({ mode, table = null }) {
  state.mode = mode;
  state.table = table;
  state.questionIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.answered = false;
  state.attempts = 0;
  state.questions = Array.from({ length: 10 }, () => createQuestion(mode === 'table' ? table : null));

  els.modeLabel.textContent = mode === 'table' ? `Tabla del ${table}` : 'Desafío mezclado';
  showView(els.quizView);
  renderQuestion();
}

function renderQuestion() {
  const current = state.questions[state.questionIndex];
  state.answered = false;
  state.attempts = 0;
  els.questionCounter.textContent = `${state.questionIndex + 1} / 10`;
  els.question.textContent = `${current.a} × ${current.b}`;
  els.streak.textContent = state.streak;
  els.feedback.textContent = '';
  els.nextButton.classList.add('hidden');
  els.answers.innerHTML = '';

  current.options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = option;
    button.addEventListener('click', () => answerQuestion(option, button));
    els.answers.appendChild(button);
  });
}

function finishAnswer() {
  const current = state.questions[state.questionIndex];
  const buttons = [...els.answers.querySelectorAll('.answer-button')];

  state.answered = true;
  buttons.forEach(button => {
    button.disabled = true;
    if (Number(button.textContent) === current.correct) button.classList.add('correct');
  });

  progress.bestStreak = Math.max(progress.bestStreak, state.streak);
  saveProgress();
  els.streak.textContent = state.streak;
  els.nextButton.textContent = state.questionIndex === 9 ? 'Ver resultado 🌟' : 'Siguiente →';
  els.nextButton.classList.remove('hidden');
}

function answerQuestion(value, selectedButton) {
  if (state.answered || selectedButton.disabled) return;

  const current = state.questions[state.questionIndex];

  if (value === current.correct) {
    selectedButton.classList.add('correct');
    state.score += 1;
    state.streak += 1;
    progress.stars += 1;

    if (state.attempts === 1) {
      els.feedback.textContent = `✨ ¡Eso, Antonia! Lo corregiste. ${current.a} × ${current.b} = ${current.correct}.`;
    } else {
      els.feedback.textContent = state.streak >= 3 ? '🔥 ¡Excelente racha, Antonia!' : '✨ ¡Muy bien!';
    }

    finishAnswer();
    return;
  }

  selectedButton.classList.add('wrong');
  selectedButton.disabled = true;

  if (state.attempts === 0) {
    state.attempts = 1;
    els.feedback.textContent = `${explainMultiplication(current.a, current.b)} Ahora busca ${current.correct} y tócala. Tienes otra oportunidad. 💪`;
    return;
  }

  state.attempts = 2;
  state.streak = 0;
  els.feedback.textContent = `${explainMultiplication(current.a, current.b)} La respuesta correcta es ${current.correct}. La miramos y seguimos.`;
  finishAnswer();
}

function nextQuestion() {
  if (!state.answered) return;
  if (state.questionIndex < 9) {
    state.questionIndex += 1;
    renderQuestion();
  } else {
    finishSession();
  }
}

function finishSession() {
  progress.sessions += 1;
  saveProgress();

  els.finalScore.textContent = state.score;

  if (state.score >= 9) {
    els.resultEmoji.textContent = '🏆';
    els.resultTitle.textContent = '¡Espectacular, Antonia!';
    els.resultText.textContent = 'Dominaste esta sesión. Puedes repetirla o probar otra tabla.';
  } else if (state.score >= 7) {
    els.resultEmoji.textContent = '🌟';
    els.resultTitle.textContent = '¡Muy buen trabajo!';
    els.resultText.textContent = 'Vas muy bien. Una sesión corta más y quedará todavía más fácil.';
  } else if (state.score >= 5) {
    els.resultEmoji.textContent = '💪';
    els.resultTitle.textContent = '¡Buen entrenamiento!';
    els.resultText.textContent = 'Ya estás avanzando. Repetir esta tabla ayudará a fijarla.';
  } else {
    els.resultEmoji.textContent = '🌱';
    els.resultTitle.textContent = 'Estamos aprendiendo';
    els.resultText.textContent = 'Equivocarse, mirar la explicación y corregir también es aprender.';
  }

  showView(els.resultView);
}

els.mixedButton.addEventListener('click', () => startSession({ mode: 'mixed' }));
els.backButton.addEventListener('click', () => showView(els.homeView));
els.nextButton.addEventListener('click', nextQuestion);
els.againButton.addEventListener('click', () => startSession({ mode: state.mode, table: state.table }));
els.homeButton.addEventListener('click', () => showView(els.homeView));

buildTableButtons();
renderProgress();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

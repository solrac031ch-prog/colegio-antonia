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
    const j = Math.floor(Math.random() * (i + 1));
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

function buildLearningHint(a, b) {
  const correct = a * b;
  const meaning = `${b} ${b === 1 ? 'grupo' : 'grupos'} de ${a}`;

  if (b === 1) {
    return {
      meaning,
      work: `${a} × 1 = ${a}`,
      tip: 'Multiplicar por 1 deja el mismo número.',
    };
  }

  if (b === 2) {
    return {
      meaning,
      work: `${a} + ${a} = ${correct}`,
      tip: `Es el doble de ${a}.`,
    };
  }

  if (b <= 5) {
    const sum = Array.from({ length: b }, () => a).join(' + ');
    return {
      meaning,
      work: `${sum} = ${correct}`,
      tip: `Sumamos ${a}, ${b} veces.`,
    };
  }

  if (b === 10) {
    return {
      meaning,
      work: `${a}, ${a * 2}, ${a * 3}, ${a * 4}, ${a * 5} … ${correct}`,
      tip: `Cuenta de ${a} en ${a} hasta llegar a ${correct}.`,
    };
  }

  const sequence = Array.from({ length: b }, (_, index) => a * (index + 1)).join(' → ');
  return {
    meaning,
    work: sequence,
    tip: `Cuenta de ${a} en ${a}. El número ${b} de la serie es ${correct}.`,
  };
}

function resetFeedback() {
  els.feedback.className = 'feedback';
  els.feedback.innerHTML = '';
}

function showFeedback(kind, html, compact = false) {
  els.feedback.className = `feedback feedback-card feedback-${kind}${compact ? ' feedback-compact' : ''}`;
  els.feedback.innerHTML = html;
}

function learningCard(current, finalAttempt = false) {
  const hint = buildLearningHint(current.a, current.b);
  const title = finalAttempt ? '🌷 Está bien, Antonia' : '💡 Casi, Antonia';
  const subtitle = finalAttempt
    ? 'Miremos la idea una vez más y seguimos.'
    : 'Miremos juntas cómo funciona esta multiplicación.';
  const ending = finalAttempt
    ? 'Guárdala en tu cabeza. La próxima vez la reconocerás más rápido 🌱'
    : `Ahora toca <strong>${current.correct}</strong> en las opciones. ✨`;

  return `
    <div class="feedback-heading">
      <div>
        <strong>${title}</strong>
        <span>${subtitle}</span>
      </div>
    </div>

    <div class="feedback-step">
      <span class="feedback-label">1 · ¿Qué significa?</span>
      <strong>${current.a} × ${current.b} son ${hint.meaning}.</strong>
    </div>

    <div class="feedback-step">
      <span class="feedback-label">2 · Mira la pista</span>
      <strong class="feedback-math">${hint.work}</strong>
      <span class="feedback-tip">${hint.tip}</span>
    </div>

    <div class="feedback-answer">
      <span>La respuesta es</span>
      <strong>${current.correct}</strong>
    </div>

    <div class="feedback-action">${ending}</div>
  `;
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
  resetFeedback();
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
      showFeedback(
        'success',
        `<div class="feedback-heading success-heading">
          <div>
            <strong>🌟 ¡Eso, Antonia!</strong>
            <span>Lo miraste, lo entendiste y lo corregiste.</span>
          </div>
        </div>
        <div class="feedback-mini-equation">${current.a} × ${current.b} = <strong>${current.correct}</strong></div>
        <div class="feedback-action">Corregir un error también es aprender 💛</div>`,
        true
      );
    } else {
      const message = state.streak >= 3
        ? '🔥 ¡Excelente racha, Antonia!'
        : '✨ ¡Muy bien, Antonia!';
      showFeedback(
        'success',
        `<div class="feedback-heading success-heading">
          <div>
            <strong>${message}</strong>
            <span>${current.a} × ${current.b} = ${current.correct}</span>
          </div>
        </div>`,
        true
      );
    }

    finishAnswer();
    return;
  }

  selectedButton.classList.add('wrong');
  selectedButton.disabled = true;

  if (state.attempts === 0) {
    state.attempts = 1;
    showFeedback('hint', learningCard(current, false));
    return;
  }

  state.attempts = 2;
  state.streak = 0;
  showFeedback('gentle', learningCard(current, true));
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

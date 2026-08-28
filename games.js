'use strict';

(() => {
  const GAME_KEY = 'aprende3GameProgress';
  const ROUNDS = 5;
  const XP_CORRECT = 10;
  const XP_BONUS = 20;
  const DAILY_GOAL = 2;

  const subjects = {
    math: { title: 'Matemáticas', icon: '🧮', href: 'math.html?v=19' },
    english: { title: 'Inglés', icon: '🇬🇧', href: 'english.html?v=19' },
    language: { title: 'Lenguaje', icon: '📚', href: 'language.html?v=19' },
    science: { title: 'Ciencias Naturales', icon: '🔬', href: 'science.html?v=19' },
    history: { title: 'Historia y Geografía', icon: '🌎', href: 'history.html?v=19' },
  };

  const banks = {
    math: [
      { type: 'truefalse', prompt: 'Verdadero o falso', statement: '6 × 4 = 24', correct: true, explanation: '6 grupos de 4 forman 24. Puedes contar 4, 8, 12, 16, 20, 24.' },
      { type: 'fill', prompt: 'Completa el resultado', statement: '350 + 125 = ___', correct: '475', explanation: '350 + 100 = 450 y 450 + 25 = 475.' },
      { type: 'order', prompt: 'Ordena de menor a mayor', tokens: ['901', '209', '420'], correct: ['209', '420', '901'], explanation: 'Compara primero las centenas: 2 centenas, 4 centenas y 9 centenas.' },
      { type: 'match', prompt: 'Une cada operación con su resultado', pairs: [['5 × 3', '15'], ['18 ÷ 3', '6'], ['1 m', '100 cm']], explanation: 'Relaciona cada expresión con un valor equivalente.' },
      { type: 'choice', visual: true, prompt: '¿Cuál figura tiene 4 lados iguales?', statement: 'Elige la figura', options: ['🟦', '🔺', '⚪', '⬟'], correct: '🟦', explanation: 'El cuadrado tiene cuatro lados iguales.' },
    ],
    english: [
      { type: 'listen', prompt: 'Listen and choose', speak: 'apple', options: ['🍎', '🐶', '🏠', '⚽'], correct: '🍎', explanation: 'Apple significa manzana.' },
      { type: 'order', prompt: 'Put the words in order', tokens: ['apples.', 'likes', 'She'], correct: ['She', 'likes', 'apples.'], explanation: 'Con she usamos el verbo con -s: She likes apples.' },
      { type: 'match', prompt: 'Match the words', pairs: [['cat', 'gato'], ['book', 'libro'], ['water', 'agua']], explanation: 'Une cada palabra en inglés con su significado.' },
      { type: 'fill', prompt: 'Complete the sentence', statement: 'He ___ football.', correct: 'likes', explanation: 'Con he, she o it agregamos -s al verbo en present simple.' },
      { type: 'truefalse', prompt: 'Is this question correct?', statement: 'Does she have a pet?', correct: true, explanation: 'Sí. Con she usamos does y luego el verbo vuelve a su forma base: have.' },
    ],
    language: [
      { type: 'order', prompt: 'Ordena la oración', tokens: ['un', 'libro.', 'La', 'niña', 'lee'], correct: ['La', 'niña', 'lee', 'un', 'libro.'], explanation: 'Una oración clara puede organizarse como sujeto + acción + complemento.' },
      { type: 'match', prompt: 'Une los sinónimos', pairs: [['feliz', 'contento'], ['rápido', 'veloz'], ['pequeño', 'chico']], explanation: 'Los sinónimos son palabras con significados iguales o muy parecidos.' },
      { type: 'fill', prompt: 'Completa la palabra', statement: 'ca__po', correct: 'm', explanation: 'Se escribe campo con m. Antes de p y b normalmente usamos m.' },
      { type: 'truefalse', prompt: 'Verdadero o falso', statement: 'En “El perro corre”, la palabra “corre” es un verbo.', correct: true, explanation: '“Corre” expresa una acción; por eso es un verbo.' },
      { type: 'choice', prompt: '¿Cuál oración está bien escrita?', options: ['Mi gato duerme.', 'mi gato duerme', 'Mi gato duerme', 'mi Gato duerme.'], correct: 'Mi gato duerme.', explanation: 'La oración comienza con mayúscula y termina con punto.' },
    ],
    science: [
      { type: 'truefalse', prompt: 'Verdadero o falso', statement: 'Las plantas necesitan agua, luz y aire para vivir.', correct: true, explanation: 'El agua, la luz y el aire participan en procesos esenciales para que la planta crezca y fabrique alimento.' },
      { type: 'match', prompt: 'Une cada órgano con su función', pairs: [['❤️ corazón', 'bombea sangre'], ['🫁 pulmones', 'ayudan a respirar'], ['🍽️ estómago', 'ayuda a digerir']], explanation: 'Cada órgano cumple una función distinta dentro del cuerpo.' },
      { type: 'order', prompt: 'Ordena el crecimiento de una planta', tokens: ['🌿 planta', '🌰 semilla', '🌱 brote'], correct: ['🌰 semilla', '🌱 brote', '🌿 planta'], explanation: 'Primero germina la semilla, aparece el brote y luego crece la planta.' },
      { type: 'fill', prompt: 'Completa', statement: 'El órgano que bombea la sangre es el ______.', correct: 'corazón', explanation: 'El corazón se contrae y empuja la sangre a través de los vasos sanguíneos.' },
      { type: 'choice', visual: true, prompt: '¿Cuál representa agua en estado sólido?', options: ['🧊', '💧', '☁️', '🌊'], correct: '🧊', explanation: 'El hielo es agua congelada: sus partículas forman un sólido.' },
    ],
    history: [
      { type: 'truefalse', prompt: 'Verdadero o falso', statement: 'En la mayoría de los mapas, el norte se representa arriba.', correct: true, explanation: 'Es una convención cartográfica habitual que facilita orientarnos y comparar mapas.' },
      { type: 'match', prompt: 'Une cada punto cardinal con su posición', pairs: [['Norte', 'arriba'], ['Sur', 'abajo'], ['Este', 'derecha']], explanation: 'Cuando el norte está arriba, sur queda abajo y este a la derecha.' },
      { type: 'order', prompt: 'Ordena de un espacio más pequeño a uno más amplio', tokens: ['ciudad', 'casa', 'barrio'], correct: ['casa', 'barrio', 'ciudad'], explanation: 'Una casa puede estar dentro de un barrio, y el barrio forma parte de una ciudad.' },
      { type: 'fill', prompt: 'Completa', statement: 'La línea imaginaria que divide la Tierra en hemisferio norte y sur es el ______.', correct: 'ecuador', explanation: 'El ecuador rodea la Tierra a igual distancia de los polos y separa los hemisferios norte y sur.' },
      { type: 'choice', visual: true, prompt: '¿Qué objeto sirve para orientarse?', options: ['🧭', '⚖️', '🌡️', '⏰'], correct: '🧭', explanation: 'La brújula indica direcciones y ayuda a reconocer los puntos cardinales.' },
    ],
  };

  const els = {
    subjectIcon: document.querySelector('[data-quick-subject-icon]'),
    subjectTitle: document.querySelector('[data-quick-subject-title]'),
    subjectBack: document.querySelector('[data-quick-subject-back]'),
    subjectTabs: document.querySelector('[data-quick-subject-tabs]'),
    xp: document.querySelector('[data-quick-xp]'),
    streak: document.querySelector('[data-quick-streak]'),
    daily: document.querySelector('[data-quick-daily]'),
    counter: document.querySelector('[data-quick-counter]'),
    progress: document.querySelector('[data-quick-progress]'),
    prompt: document.querySelector('[data-quick-prompt]'),
    content: document.querySelector('[data-quick-content]'),
    feedback: document.querySelector('[data-quick-feedback]'),
    check: document.querySelector('[data-quick-check]'),
    next: document.querySelector('[data-quick-next]'),
    result: document.querySelector('[data-quick-result]'),
    game: document.querySelector('[data-quick-game]'),
    resultScore: document.querySelector('[data-quick-result-score]'),
    resultXp: document.querySelector('[data-quick-result-xp]'),
    resultMessage: document.querySelector('[data-quick-result-message]'),
    replay: document.querySelector('[data-quick-replay]'),
    resultBack: document.querySelector('[data-quick-result-back]'),
  };

  const requestedSubject = new URLSearchParams(window.location.search).get('subject');
  const subjectKey = subjects[requestedSubject] ? requestedSubject : 'math';
  const subject = subjects[subjectKey];
  let session = [];
  let roundIndex = 0;
  let score = 0;
  let earnedXp = 0;
  let attempts = 0;
  let roundLocked = false;
  let orderSelection = [];
  let matchState = null;

  function todayStamp(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function fromStamp(stamp) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp || '')) return null;
    const [y, m, d] = stamp.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function daysBetween(a, b) {
    const first = fromStamp(a);
    const second = fromStamp(b);
    if (!first || !second) return null;
    return Math.round((second - first) / 86400000);
  }

  function loadProgress() {
    const fallback = {
      xp: 0, streakDays: 0, lastStudyDate: '', dailyDate: todayStamp(), dailyLessons: 0, dailyXp: 0,
      totalLessons: 0, lastSubject: 'math', lastTopic: '', subjectXp: { math: 0, english: 0, language: 0, science: 0, history: 0 },
      migratedExistingProgress: true,
    };
    try {
      const raw = JSON.parse(localStorage.getItem(GAME_KEY) || '{}');
      const merged = { ...fallback, ...(raw && typeof raw === 'object' ? raw : {}) };
      merged.subjectXp = { ...fallback.subjectXp, ...(merged.subjectXp || {}) };
      return merged;
    } catch {
      return fallback;
    }
  }

  const progressData = loadProgress();

  function normalizeDaily() {
    const today = todayStamp();
    if (progressData.dailyDate !== today) {
      progressData.dailyDate = today;
      progressData.dailyLessons = 0;
      progressData.dailyXp = 0;
    }
  }

  function saveProgress() {
    normalizeDaily();
    try { localStorage.setItem(GAME_KEY, JSON.stringify(progressData)); } catch {}
    renderStats();
  }

  function renderStats() {
    normalizeDaily();
    if (els.xp) els.xp.textContent = String(progressData.xp || 0);
    if (els.streak) els.streak.textContent = String(progressData.streakDays || 0);
    if (els.daily) els.daily.textContent = `${Math.min(progressData.dailyLessons || 0, DAILY_GOAL)}/${DAILY_GOAL}`;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function normalize(value) {
    return String(value ?? '').trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.!?¿¡]/g, '').replace(/\s+/g, ' ');
  }

  function isSameSequence(a, b) {
    return a.length === b.length && a.every((value, index) => normalize(value) === normalize(b[index]));
  }

  function setupHeader() {
    els.subjectIcon.textContent = subject.icon;
    els.subjectTitle.textContent = subject.title;
    els.subjectBack.href = subject.href;
    els.resultBack.href = subject.href;
    els.subjectTabs.innerHTML = '';
    Object.entries(subjects).forEach(([key, data]) => {
      const link = document.createElement('a');
      link.className = `quick-subject-tab${key === subjectKey ? ' active' : ''}`;
      link.href = `games.html?subject=${key}`;
      link.textContent = `${data.icon} ${data.title.replace(' Naturales', '').replace(' y Geografía', '')}`;
      if (key === subjectKey) link.setAttribute('aria-current', 'page');
      els.subjectTabs.appendChild(link);
    });
  }

  function makeSession() {
    return shuffle(banks[subjectKey]).slice(0, ROUNDS);
  }

  function clearRoundUi() {
    els.content.innerHTML = '';
    els.feedback.innerHTML = '';
    els.feedback.className = 'quick-feedback';
    els.check.classList.add('hidden');
    els.next.classList.add('hidden');
    orderSelection = [];
    matchState = null;
  }

  function setFeedback(kind, title, text) {
    els.feedback.className = `quick-feedback ${kind}`;
    els.feedback.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  }

  function awardCorrect() {
    score += 1;
    earnedXp += XP_CORRECT;
    progressData.xp = (Number(progressData.xp) || 0) + XP_CORRECT;
    progressData.dailyXp = (Number(progressData.dailyXp) || 0) + XP_CORRECT;
    progressData.subjectXp[subjectKey] = (Number(progressData.subjectXp[subjectKey]) || 0) + XP_CORRECT;
    saveProgress();
  }

  function resolveRound(correct, explanation, reveal = '') {
    if (roundLocked) return;
    if (correct) {
      roundLocked = true;
      awardCorrect();
      setFeedback('success', '✨ ¡Correcto!', explanation);
      els.check.classList.add('hidden');
      els.next.classList.remove('hidden');
      disableRoundControls();
      return;
    }

    if (attempts === 0) {
      attempts = 1;
      setFeedback('hint', '💡 Intenta una vez más', explanation);
      resetForSecondAttempt();
      return;
    }

    roundLocked = true;
    setFeedback('gentle', '🌱 Ahora lo sabemos', `${explanation}${reveal ? ` Respuesta: ${reveal}.` : ''}`);
    els.check.classList.add('hidden');
    els.next.classList.remove('hidden');
    disableRoundControls();
  }

  function disableRoundControls() {
    els.content.querySelectorAll('button, input').forEach(control => { control.disabled = true; });
  }

  function resetForSecondAttempt() {
    const activity = session[roundIndex];
    if (activity.type === 'fill') {
      const input = els.content.querySelector('input');
      if (input) { input.value = ''; input.focus(); }
    }
    if (activity.type === 'order') {
      orderSelection = [];
      renderOrder(activity);
    }
  }

  function renderChoice(activity) {
    const statement = document.createElement('div');
    statement.className = 'quick-statement';
    statement.textContent = activity.statement || '';
    if (activity.statement) els.content.appendChild(statement);
    const grid = document.createElement('div');
    grid.className = `quick-choice-grid${activity.visual ? ' visual' : ''}`;
    shuffle(activity.options).forEach(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-choice';
      button.textContent = option;
      button.addEventListener('click', () => resolveRound(normalize(option) === normalize(activity.correct), activity.explanation, activity.correct));
      grid.appendChild(button);
    });
    els.content.appendChild(grid);
  }

  function renderTrueFalse(activity) {
    const statement = document.createElement('div');
    statement.className = 'quick-statement statement-large';
    statement.textContent = activity.statement;
    els.content.appendChild(statement);
    const grid = document.createElement('div');
    grid.className = 'quick-choice-grid two';
    [{ label: '✅ Verdadero', value: true }, { label: '❌ Falso', value: false }].forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-choice';
      button.textContent = item.label;
      button.addEventListener('click', () => resolveRound(item.value === activity.correct, activity.explanation, activity.correct ? 'Verdadero' : 'Falso'));
      grid.appendChild(button);
    });
    els.content.appendChild(grid);
  }

  function renderFill(activity) {
    const statement = document.createElement('div');
    statement.className = 'quick-statement statement-large';
    statement.textContent = activity.statement;
    const input = document.createElement('input');
    input.className = 'quick-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'none';
    input.spellcheck = false;
    input.setAttribute('aria-label', 'Escribe la respuesta');
    input.addEventListener('keydown', event => { if (event.key === 'Enter') els.check.click(); });
    els.content.append(statement, input);
    els.check.classList.remove('hidden');
    els.check.onclick = () => resolveRound(normalize(input.value) === normalize(activity.correct), activity.explanation, activity.correct);
    setTimeout(() => input.focus(), 50);
  }

  function renderOrder(activity) {
    els.content.innerHTML = '';
    const tray = document.createElement('div');
    tray.className = 'quick-order-tray';
    tray.setAttribute('aria-label', 'Tu respuesta');
    if (!orderSelection.length) tray.innerHTML = '<span>Toca las piezas en el orden correcto</span>';
    else orderSelection.forEach((token, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-token selected';
      chip.textContent = token;
      chip.addEventListener('click', () => { orderSelection.splice(index, 1); renderOrder(activity); });
      tray.appendChild(chip);
    });

    const source = document.createElement('div');
    source.className = 'quick-token-bank';
    shuffle(activity.tokens.filter(token => !orderSelection.includes(token))).forEach(token => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-token';
      chip.textContent = token;
      chip.addEventListener('click', () => { orderSelection.push(token); renderOrder(activity); });
      source.appendChild(chip);
    });
    els.content.append(tray, source);
    els.check.classList.remove('hidden');
    els.check.onclick = () => resolveRound(isSameSequence(orderSelection, activity.correct), activity.explanation, activity.correct.join(' '));
  }

  function renderMatch(activity) {
    const cards = [];
    activity.pairs.forEach((pair, pairIndex) => {
      pair.forEach((text, sideIndex) => cards.push({ text, pairIndex, sideIndex }));
    });
    matchState = { selected: null, matched: new Set(), mistakes: 0 };
    const grid = document.createElement('div');
    grid.className = 'quick-match-grid';
    shuffle(cards).forEach((card, cardIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-match-card';
      button.textContent = card.text;
      button.dataset.cardIndex = String(cardIndex);
      button.addEventListener('click', () => {
        if (button.disabled || roundLocked) return;
        if (!matchState.selected) {
          matchState.selected = { card, button };
          button.classList.add('selected');
          return;
        }
        const first = matchState.selected;
        if (first.button === button) {
          first.button.classList.remove('selected');
          matchState.selected = null;
          return;
        }
        const matches = first.card.pairIndex === card.pairIndex && first.card.sideIndex !== card.sideIndex;
        if (matches) {
          first.button.classList.remove('selected');
          first.button.classList.add('matched');
          button.classList.add('matched');
          first.button.disabled = true;
          button.disabled = true;
          matchState.matched.add(card.pairIndex);
          matchState.selected = null;
          if (matchState.matched.size === activity.pairs.length) {
            roundLocked = true;
            awardCorrect();
            setFeedback('success', '🧩 ¡Todas las parejas!', activity.explanation);
            els.next.classList.remove('hidden');
          }
        } else {
          matchState.mistakes += 1;
          first.button.classList.remove('selected');
          first.button.classList.add('wrong');
          button.classList.add('wrong');
          matchState.selected = null;
          setTimeout(() => { first.button.classList.remove('wrong'); button.classList.remove('wrong'); }, 350);
        }
      });
      grid.appendChild(button);
    });
    els.content.appendChild(grid);
  }

  function speakEnglish(text, fallbackElement) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      fallbackElement.textContent = `Audio no disponible en este navegador. Palabra: ${text}`;
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.82;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch {
      fallbackElement.textContent = `No se pudo reproducir el audio. Palabra: ${text}`;
    }
  }

  function renderListen(activity) {
    const audioBox = document.createElement('div');
    audioBox.className = 'quick-audio-box';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-audio-button';
    button.textContent = '🔊 Escuchar';
    const fallback = document.createElement('p');
    fallback.className = 'quick-audio-fallback';
    button.addEventListener('click', () => speakEnglish(activity.speak, fallback));
    audioBox.append(button, fallback);
    els.content.appendChild(audioBox);
    renderChoice(activity);
  }

  function renderRound() {
    const activity = session[roundIndex];
    if (!activity) return finishSession();
    attempts = 0;
    roundLocked = false;
    clearRoundUi();
    els.counter.textContent = `${roundIndex + 1} / ${ROUNDS}`;
    els.progress.style.width = `${(roundIndex / ROUNDS) * 100}%`;
    els.prompt.textContent = activity.prompt;

    if (activity.type === 'truefalse') renderTrueFalse(activity);
    else if (activity.type === 'fill') renderFill(activity);
    else if (activity.type === 'order') renderOrder(activity);
    else if (activity.type === 'match') renderMatch(activity);
    else if (activity.type === 'listen') renderListen(activity);
    else renderChoice(activity);
  }

  function updateStreakOnCompletion() {
    const today = todayStamp();
    if (progressData.lastStudyDate === today) return;
    const diff = daysBetween(progressData.lastStudyDate, today);
    progressData.streakDays = diff === 1 ? Math.max(1, Number(progressData.streakDays) || 0) + 1 : 1;
    progressData.lastStudyDate = today;
  }

  function finishSession() {
    normalizeDaily();
    updateStreakOnCompletion();
    progressData.xp = (Number(progressData.xp) || 0) + XP_BONUS;
    progressData.dailyXp = (Number(progressData.dailyXp) || 0) + XP_BONUS;
    progressData.dailyLessons = (Number(progressData.dailyLessons) || 0) + 1;
    progressData.totalLessons = (Number(progressData.totalLessons) || 0) + 1;
    progressData.lastSubject = subjectKey;
    progressData.lastTopic = 'Desafío rápido';
    progressData.subjectXp[subjectKey] = (Number(progressData.subjectXp[subjectKey]) || 0) + XP_BONUS;
    earnedXp += XP_BONUS;
    saveProgress();

    els.game.classList.add('hidden');
    els.result.classList.remove('hidden');
    els.progress.style.width = '100%';
    els.resultScore.textContent = `${score}/${ROUNDS}`;
    els.resultXp.textContent = `+${earnedXp} XP`;
    els.resultMessage.textContent = progressData.dailyLessons >= DAILY_GOAL ? '🎯 ¡Meta diaria completada!' : `Te falta ${Math.max(0, DAILY_GOAL - progressData.dailyLessons)} lección para completar la meta de hoy.`;
    launchConfetti();
  }

  function launchConfetti() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div');
    layer.className = 'quick-confetti';
    for (let i = 0; i < 16; i += 1) {
      const piece = document.createElement('span');
      piece.textContent = ['⭐', '✨', '◆', '●'][i % 4];
      piece.style.setProperty('--x', `${5 + ((i * 19) % 90)}vw`);
      piece.style.setProperty('--delay', `${(i % 5) * 40}ms`);
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1450);
  }

  function startSession() {
    session = makeSession();
    roundIndex = 0;
    score = 0;
    earnedXp = 0;
    els.result.classList.add('hidden');
    els.game.classList.remove('hidden');
    renderRound();
  }

  els.next.addEventListener('click', () => {
    if (!roundLocked) return;
    roundIndex += 1;
    renderRound();
  });
  els.replay.addEventListener('click', startSession);

  setupHeader();
  normalizeDaily();
  renderStats();
  startSession();
})();

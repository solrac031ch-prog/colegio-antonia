const state = {
  mode: null,
  topicKey: null,
  table: null,
  questionIndex: 0,
  score: 0,
  streak: 0,
  questions: [],
  answered: false,
  attempts: 0,
};

const curriculum = [
  { key: 'numbers', icon: '🔢', title: 'Números hasta 1.000', short: 'Números', subtitle: 'Contar, comparar y ordenar', description: 'Reconoce centenas, decenas y unidades; compara y ordena números hasta 1.000.' },
  { key: 'addition', icon: '➕', title: 'Sumas', short: 'Sumas', subtitle: 'Sumar con seguridad', description: 'Suma números de hasta tres cifras con ejercicios cortos y claros.' },
  { key: 'subtraction', icon: '➖', title: 'Restas', short: 'Restas', subtitle: 'Restar paso a paso', description: 'Practica restas hasta 1.000 y comprueba cada resultado.' },
  { key: 'fractions', icon: '🍕', title: 'Fracciones', short: 'Fracciones', subtitle: 'Partes de un todo', description: 'Reconoce mitades, tercios y cuartos usando situaciones fáciles de imaginar.' },
  { key: 'shapes', icon: '🔷', title: 'Formas y espacio', short: 'Formas', subtitle: 'Figuras y propiedades', description: 'Repasa lados, vértices y nombres de figuras geométricas.' },
  { key: 'data', icon: '📊', title: 'Gráficos y datos', short: 'Datos', subtitle: 'Leer y organizar información', description: 'Lee datos simples, compara cantidades y encuentra totales.' },
  { key: 'multiplication', icon: '✖️', title: 'Multiplicación', short: 'Multiplicación', subtitle: 'Tablas del 1 al 10', description: 'Practica las tablas con conteo salteado, pistas sencillas y segunda oportunidad.' },
  { key: 'division', icon: '➗', title: 'División', short: 'División', subtitle: 'Repartir en partes iguales', description: 'Aprende a repartir en grupos iguales usando las tablas que ya conoces.' },
  { key: 'measurement', icon: '📏', title: 'Longitud, masa y volumen', short: 'Medidas', subtitle: 'Medir y comparar', description: 'Practica centímetros, metros, gramos, kilogramos y litros.' },
  { key: 'time', icon: '🕐', title: 'La hora y el tiempo', short: 'La hora', subtitle: 'Relojes y duración', description: 'Lee horas y calcula duraciones sencillas.' },
  { key: 'position', icon: '🧭', title: 'Posición y movimiento', short: 'Posición', subtitle: 'Ubicar y describir recorridos', description: 'Practica izquierda, derecha y los puntos cardinales con recorridos simples.' },
];

const els = {
  homeView: document.querySelector('#homeView'),
  moduleView: document.querySelector('#moduleView'),
  quizView: document.querySelector('#quizView'),
  resultView: document.querySelector('#resultView'),
  curriculumGrid: document.querySelector('#curriculumGrid'),
  moduleBackButton: document.querySelector('#moduleBackButton'),
  moduleChip: document.querySelector('#moduleChip'),
  moduleIcon: document.querySelector('#moduleIcon'),
  moduleKicker: document.querySelector('#moduleKicker'),
  moduleTitle: document.querySelector('#moduleTitle'),
  moduleDescription: document.querySelector('#moduleDescription'),
  genericPracticePanel: document.querySelector('#genericPracticePanel'),
  genericPracticeText: document.querySelector('#genericPracticeText'),
  startTopicButton: document.querySelector('#startTopicButton'),
  multiplicationPracticePanel: document.querySelector('#multiplicationPracticePanel'),
  tableGrid: document.querySelector('#tableGrid'),
  mixedButton: document.querySelector('#mixedButton'),
  backButton: document.querySelector('#backButton'),
  modeLabel: document.querySelector('#modeLabel'),
  questionCounter: document.querySelector('#questionCounter'),
  questionPrompt: document.querySelector('#questionPrompt'),
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
  routeButton: document.querySelector('#routeButton'),
};

const progress = JSON.parse(localStorage.getItem('antoniaMathProgress') || '{}');
progress.stars ||= 0;
progress.sessions ||= 0;
progress.bestStreak ||= 0;
progress.byTopic ||= {};

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
  [els.homeView, els.moduleView, els.quizView, els.resultView].forEach(el => el.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function topicByKey(key) {
  return curriculum.find(topic => topic.key === key) || curriculum[0];
}

function buildCurriculumCards() {
  els.curriculumGrid.innerHTML = '';

  curriculum.forEach((topic, index) => {
    const button = document.createElement('button');
    button.className = 'topic-card topic-active';
    button.type = 'button';
    button.setAttribute('aria-label', `Abrir ${topic.title}`);
    button.addEventListener('click', () => openTopic(topic.key));

    button.innerHTML = `
      <span class="topic-number">${index + 1}</span>
      <span class="topic-icon" aria-hidden="true">${topic.icon}</span>
      <span class="topic-copy">
        <strong>${topic.title}</strong>
        <small>${topic.subtitle}</small>
      </span>
      <span class="topic-status">Practicar →</span>
    `;

    els.curriculumGrid.appendChild(button);
  });
}

function openTopic(key) {
  const topic = topicByKey(key);
  const index = curriculum.findIndex(item => item.key === topic.key);
  state.topicKey = topic.key;

  els.moduleChip.textContent = `${topic.icon} ${topic.short}`;
  els.moduleIcon.textContent = topic.icon;
  els.moduleKicker.textContent = `Tema ${index + 1}`;
  els.moduleTitle.textContent = topic.title;
  els.moduleDescription.textContent = topic.description;
  els.backButton.textContent = `← ${topic.short}`;
  els.homeButton.textContent = `Volver a ${topic.short}`;

  const isMultiplication = topic.key === 'multiplication';
  els.genericPracticePanel.classList.toggle('hidden', isMultiplication);
  els.multiplicationPracticePanel.classList.toggle('hidden', !isMultiplication);

  if (!isMultiplication) {
    els.genericPracticeText.textContent = `10 preguntas de ${topic.short.toLowerCase()}, una a la vez. Si te equivocas, verás una pista fácil.`;
  }

  showView(els.moduleView);
}

function buildTableButtons() {
  els.tableGrid.innerHTML = '';
  for (let table = 1; table <= 10; table += 1) {
    const button = document.createElement('button');
    button.className = 'table-button';
    button.textContent = `× ${table}`;
    button.setAttribute('aria-label', `Practicar tabla del ${table}`);
    button.addEventListener('click', () => startSession({ mode: 'table', topicKey: 'multiplication', table }));
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

function text(value) {
  return String(value);
}

function makeQuestion({ prompt, display, correct, options, explanation, work = '', summary = '', textMode = false }) {
  return {
    prompt,
    display,
    correct: text(correct),
    options: shuffle(options.map(text)),
    explanation,
    work,
    summary: summary || `${display} → ${correct}`,
    textMode,
  };
}

function numericOptions(correct, spread = 10, min = 0, max = 1000) {
  const values = new Set([correct]);
  const offsets = shuffle([-spread, spread, -2 * spread, 2 * spread, -1, 1, -10, 10, -100, 100]);

  offsets.forEach(offset => {
    const candidate = correct + offset;
    if (values.size < 4 && candidate >= min && candidate <= max) values.add(candidate);
  });

  while (values.size < 4) {
    values.add(randomInt(min, max));
  }

  return [...values];
}

function createNumbersQuestion() {
  const type = randomInt(0, 2);

  if (type === 0) {
    let a = randomInt(100, 999);
    let b = randomInt(100, 999);
    while (a === b) b = randomInt(100, 999);
    const correct = Math.max(a, b);
    return makeQuestion({
      prompt: '¿Cuál número es mayor?',
      display: `${a}   o   ${b}`,
      correct,
      options: [a, b],
      explanation: `${correct} es el número mayor. Mira primero las centenas; si son iguales, compara las decenas.`,
      summary: `${correct} es mayor`,
    });
  }

  if (type === 1) {
    const number = randomInt(100, 999);
    const places = [
      { name: 'centenas', digit: Math.floor(number / 100) },
      { name: 'decenas', digit: Math.floor(number / 10) % 10 },
      { name: 'unidades', digit: number % 10 },
    ];
    const place = places[randomInt(0, 2)];
    const options = new Set([place.digit]);
    while (options.size < 4) options.add(randomInt(0, 9));
    return makeQuestion({
      prompt: `¿Qué número está en las ${place.name}?`,
      display: number,
      correct: place.digit,
      options: [...options],
      explanation: `En ${number}, el dígito de las ${place.name} es ${place.digit}.`,
      summary: `${place.name}: ${place.digit}`,
    });
  }

  const number = randomInt(100, 998);
  const after = Math.random() > 0.5;
  const correct = after ? number + 1 : number - 1;
  return makeQuestion({
    prompt: after ? '¿Qué número viene justo después?' : '¿Qué número viene justo antes?',
    display: number,
    correct,
    options: numericOptions(correct, 1, 0, 1000),
    explanation: after ? `Después de ${number} viene ${correct}.` : `Antes de ${number} viene ${correct}.`,
  });
}

function createAdditionQuestion() {
  const a = randomInt(120, 700);
  const b = randomInt(10, Math.min(250, 999 - a));
  const correct = a + b;
  const hundreds = Math.floor(b / 100) * 100;
  const tens = Math.floor((b % 100) / 10) * 10;
  const units = b % 10;
  const parts = [hundreds, tens, units].filter(Boolean);
  let running = a;
  const steps = parts.map(part => {
    const next = running + part;
    const line = `${running} + ${part} = ${next}`;
    running = next;
    return line;
  });

  return makeQuestion({
    prompt: '¿Cuánto da la suma?',
    display: `${a} + ${b}`,
    correct,
    options: numericOptions(correct, 10, 0, 999),
    explanation: 'Suma por partes para que sea más fácil.',
    work: steps.join(' · '),
    summary: `${a} + ${b} = ${correct}`,
  });
}

function createSubtractionQuestion() {
  const a = randomInt(220, 999);
  const b = randomInt(10, Math.min(300, a - 1));
  const correct = a - b;
  const hundreds = Math.floor(b / 100) * 100;
  const tens = Math.floor((b % 100) / 10) * 10;
  const units = b % 10;
  const parts = [hundreds, tens, units].filter(Boolean);
  let running = a;
  const steps = parts.map(part => {
    const next = running - part;
    const line = `${running} − ${part} = ${next}`;
    running = next;
    return line;
  });

  return makeQuestion({
    prompt: '¿Cuánto queda?',
    display: `${a} − ${b}`,
    correct,
    options: numericOptions(correct, 10, 0, 999),
    explanation: 'Quita el número por partes.',
    work: steps.join(' · '),
    summary: `${a} − ${b} = ${correct}`,
  });
}

function createFractionsQuestion() {
  const cases = [
    { prompt: 'Una pizza tiene 2 partes iguales y comes 1. ¿Qué fracción comiste?', display: '🍕 1 de 2 partes', correct: '1/2', options: ['1/2', '1/3', '1/4', '2/2'], explanation: 'Una de dos partes iguales se escribe 1/2.', summary: '1 de 2 = 1/2' },
    { prompt: 'Una barra tiene 3 partes iguales y tomas 1. ¿Qué fracción tomaste?', display: '🍫 1 de 3 partes', correct: '1/3', options: ['1/2', '1/3', '1/4', '3/1'], explanation: 'Una de tres partes iguales se escribe 1/3.', summary: '1 de 3 = 1/3' },
    { prompt: 'Una torta tiene 4 partes iguales y tomas 1. ¿Qué fracción tomaste?', display: '🎂 1 de 4 partes', correct: '1/4', options: ['1/2', '1/3', '1/4', '4/1'], explanation: 'Una de cuatro partes iguales se escribe 1/4.', summary: '1 de 4 = 1/4' },
    { prompt: '¿Cuál fracción significa “la mitad”?', display: 'La mitad', correct: '1/2', options: ['1/2', '1/3', '1/4', '1/5'], explanation: 'La mitad significa 1 de 2 partes iguales.', summary: 'La mitad = 1/2' },
  ];
  return makeQuestion({ ...cases[randomInt(0, cases.length - 1)], textMode: true });
}

function createShapesQuestion() {
  const facts = [
    { prompt: '¿Cuántos lados tiene un triángulo?', display: '🔺 Triángulo', correct: 3, options: [3, 4, 5, 6], explanation: 'Un triángulo siempre tiene 3 lados.' },
    { prompt: '¿Cuántos lados tiene un cuadrado?', display: '🟪 Cuadrado', correct: 4, options: [3, 4, 5, 6], explanation: 'Un cuadrado tiene 4 lados iguales.' },
    { prompt: '¿Qué figura tiene 4 lados iguales?', display: '4 lados iguales', correct: 'Cuadrado', options: ['Cuadrado', 'Triángulo', 'Círculo', 'Pentágono'], explanation: 'El cuadrado tiene 4 lados y los 4 miden lo mismo.' },
    { prompt: '¿Qué figura no tiene lados rectos?', display: 'Sin lados rectos', correct: 'Círculo', options: ['Círculo', 'Cuadrado', 'Triángulo', 'Rectángulo'], explanation: 'El círculo es curvo y no tiene lados rectos.' },
    { prompt: '¿Cuántos lados tiene un pentágono?', display: 'Pentágono', correct: 5, options: [4, 5, 6, 8], explanation: 'Un pentágono tiene 5 lados.' },
  ];
  return makeQuestion({ ...facts[randomInt(0, facts.length - 1)], textMode: true });
}

function createDataQuestion() {
  if (Math.random() < 0.55) {
    const names = ['Ana', 'Leo', 'Mía'];
    const values = shuffle([randomInt(2, 4), randomInt(5, 7), randomInt(8, 10)]);
    const max = Math.max(...values);
    const winner = names[values.indexOf(max)];
    const display = names.map((name, index) => `${name}: ${values[index]} ⭐`).join('\n');
    return makeQuestion({
      prompt: '¿Quién tiene más estrellas?',
      display,
      correct: winner,
      options: names,
      explanation: `${winner} tiene ${max} estrellas, que es la cantidad más grande.`,
      summary: `${winner}: ${max} estrellas`,
      textMode: true,
    });
  }

  const a = randomInt(2, 9);
  const b = randomInt(2, 9);
  const correct = a + b;
  return makeQuestion({
    prompt: '¿Cuántas hay en total?',
    display: `Lunes: ${a} 📚\nMartes: ${b} 📚`,
    correct,
    options: numericOptions(correct, 2, 0, 20),
    explanation: `Junta los dos datos: ${a} + ${b} = ${correct}.`,
    summary: `Total: ${correct}`,
    textMode: true,
  });
}

function createMultiplicationQuestion(table = null) {
  const a = table ?? randomInt(1, 10);
  const b = randomInt(1, 10);
  const correct = a * b;
  const sequence = Array.from({ length: a }, (_, index) => b * (index + 1));
  return makeQuestion({
    prompt: '¿Cuánto es?',
    display: `${a} × ${b}`,
    correct,
    options: numericOptions(correct, Math.max(2, b), 1, 100),
    explanation: `${a} × ${b} es ${a} ${a === 1 ? 'vez' : 'veces'} ${b}.`,
    work: `Cuenta de ${b} en ${b}: ${sequence.join(', ')}`,
    summary: `${a} × ${b} = ${correct}`,
  });
}

function createDivisionQuestion() {
  const divisor = randomInt(1, 10);
  const quotient = randomInt(1, 10);
  const dividend = divisor * quotient;
  return makeQuestion({
    prompt: '¿Cuánto toca en cada grupo?',
    display: `${dividend} ÷ ${divisor}`,
    correct: quotient,
    options: numericOptions(quotient, 1, 1, 12),
    explanation: `${dividend} repartido en ${divisor} grupos iguales da ${quotient} en cada grupo.`,
    work: `${divisor} × ${quotient} = ${dividend}`,
    summary: `${dividend} ÷ ${divisor} = ${quotient}`,
  });
}

function createMeasurementQuestion() {
  const facts = [
    { prompt: '¿Cuántos centímetros hay en 1 metro?', display: '1 metro', correct: 100, options: [10, 50, 100, 1000], explanation: '1 metro tiene 100 centímetros.', summary: '1 m = 100 cm' },
    { prompt: '¿Cuántos gramos hay en 1 kilogramo?', display: '1 kilogramo', correct: 1000, options: [100, 500, 1000, 2000], explanation: '1 kilogramo tiene 1.000 gramos.', summary: '1 kg = 1.000 g' },
    { prompt: '¿Qué unidad usarías para medir un lápiz?', display: '✏️ Largo de un lápiz', correct: 'centímetros', options: ['centímetros', 'kilogramos', 'litros', 'horas'], explanation: 'Un lápiz se mide bien en centímetros.', summary: 'Lápiz → centímetros' },
    { prompt: '¿Qué unidad usarías para medir una puerta?', display: '🚪 Alto de una puerta', correct: 'metros', options: ['metros', 'gramos', 'litros', 'minutos'], explanation: 'El alto de una puerta se mide normalmente en metros.', summary: 'Puerta → metros' },
    { prompt: '¿Qué unidad usarías para pesar una sandía?', display: '🍉 Peso de una sandía', correct: 'kilogramos', options: ['kilogramos', 'centímetros', 'litros', 'horas'], explanation: 'Una sandía se pesa normalmente en kilogramos.', summary: 'Sandía → kilogramos' },
    { prompt: '¿Qué unidad usarías para medir agua en una botella grande?', display: '💧 Agua en una botella', correct: 'litros', options: ['litros', 'metros', 'kilogramos', 'minutos'], explanation: 'El volumen de agua de una botella grande puede medirse en litros.', summary: 'Agua → litros' },
  ];
  return makeQuestion({ ...facts[randomInt(0, facts.length - 1)], textMode: true });
}

function createTimeQuestion() {
  const type = randomInt(0, 2);

  if (type === 0) {
    const start = randomInt(1, 8);
    const duration = randomInt(1, 3);
    const end = start + duration;
    return makeQuestion({
      prompt: `Empieza a las ${start}:00 y dura ${duration} ${duration === 1 ? 'hora' : 'horas'}. ¿A qué hora termina?`,
      display: `${start}:00  +  ${duration} h`,
      correct: `${end}:00`,
      options: [`${end}:00`, `${start}:30`, `${end + 1}:00`, `${Math.max(1, end - 1)}:00`],
      explanation: `Cuenta ${duration} ${duration === 1 ? 'hora' : 'horas'} desde las ${start}:00.`,
      work: `${start}:00 → ${end}:00`,
      summary: `Termina a las ${end}:00`,
      textMode: true,
    });
  }

  if (type === 1) {
    const hour = randomInt(1, 10);
    return makeQuestion({
      prompt: '¿Qué hora será 30 minutos después?',
      display: `${hour}:00`,
      correct: `${hour}:30`,
      options: [`${hour}:30`, `${hour + 1}:00`, `${hour}:15`, `${hour}:45`],
      explanation: `30 minutos después de las ${hour}:00 son las ${hour}:30.`,
      summary: `${hour}:00 + 30 min = ${hour}:30`,
    });
  }

  return makeQuestion({
    prompt: '¿Cuántos minutos tiene una hora?',
    display: '1 hora',
    correct: 60,
    options: [30, 45, 60, 100],
    explanation: 'Una hora completa tiene 60 minutos.',
    summary: '1 hora = 60 minutos',
  });
}

function createPositionQuestion() {
  const directions = ['norte', 'este', 'sur', 'oeste'];
  const startIndex = randomInt(0, 3);
  const right = Math.random() > 0.5;
  const nextIndex = (startIndex + (right ? 1 : 3)) % 4;
  const start = directions[startIndex];
  const correct = directions[nextIndex];

  return makeQuestion({
    prompt: `Miras al ${start} y giras a la ${right ? 'derecha' : 'izquierda'}. ¿Hacia dónde miras ahora?`,
    display: `🧭 ${start.toUpperCase()} → giro ${right ? 'derecha' : 'izquierda'}`,
    correct,
    options: directions,
    explanation: `Si miras al ${start} y giras a la ${right ? 'derecha' : 'izquierda'}, quedas mirando al ${correct}.`,
    summary: `${start} + giro ${right ? 'derecha' : 'izquierda'} = ${correct}`,
    textMode: true,
  });
}

function createTopicQuestion(topicKey, table = null) {
  switch (topicKey) {
    case 'numbers': return createNumbersQuestion();
    case 'addition': return createAdditionQuestion();
    case 'subtraction': return createSubtractionQuestion();
    case 'fractions': return createFractionsQuestion();
    case 'shapes': return createShapesQuestion();
    case 'data': return createDataQuestion();
    case 'multiplication': return createMultiplicationQuestion(table);
    case 'division': return createDivisionQuestion();
    case 'measurement': return createMeasurementQuestion();
    case 'time': return createTimeQuestion();
    case 'position': return createPositionQuestion();
    default: return createNumbersQuestion();
  }
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
  const title = finalAttempt ? '🌷 Mira, Antonia' : '💡 Vamos paso a paso';
  const subtitle = finalAttempt ? 'Miremos la respuesta y seguimos.' : 'Una pista fácil:';
  const ending = finalAttempt ? 'Seguimos con la siguiente 🌱' : `Ahora toca <strong>${current.correct}</strong> ✨`;

  return `
    <div class="feedback-heading">
      <div>
        <strong>${title}</strong>
        <span>${subtitle}</span>
      </div>
    </div>
    <div class="feedback-step">
      <strong>${current.explanation}</strong>
    </div>
    ${current.work ? `<div class="feedback-step"><strong class="feedback-math">${current.work}</strong></div>` : ''}
    <div class="feedback-answer">
      <span>La respuesta es</span>
      <strong>${current.correct}</strong>
    </div>
    <div class="feedback-action">${ending}</div>
  `;
}

function startTopicSession(topicKey) {
  startSession({ mode: 'topic', topicKey });
}

function startSession({ mode, topicKey = state.topicKey || 'multiplication', table = null }) {
  state.mode = mode;
  state.topicKey = topicKey;
  state.table = table;
  state.questionIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.answered = false;
  state.attempts = 0;

  const fixedTable = mode === 'table' ? table : null;
  state.questions = Array.from({ length: 10 }, () => createTopicQuestion(topicKey, fixedTable));

  const topic = topicByKey(topicKey);
  if (mode === 'table') {
    els.modeLabel.textContent = `Tabla del ${table}`;
  } else if (mode === 'mixed') {
    els.modeLabel.textContent = 'Tablas mezcladas';
  } else {
    els.modeLabel.textContent = topic.short;
  }

  els.backButton.textContent = `← ${topic.short}`;
  showView(els.quizView);
  renderQuestion();
}

function renderQuestion() {
  const current = state.questions[state.questionIndex];
  state.answered = false;
  state.attempts = 0;
  els.questionCounter.textContent = `${state.questionIndex + 1} / 10`;
  els.questionPrompt.textContent = current.prompt;
  els.question.textContent = current.display;
  els.question.classList.toggle('question-text', current.textMode || current.display.length > 18 || current.display.includes('\n'));
  els.streak.textContent = state.streak;
  resetFeedback();
  els.nextButton.classList.add('hidden');
  els.answers.innerHTML = '';

  current.options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = option;
    button.dataset.value = option;
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
    if (button.dataset.value === current.correct) button.classList.add('correct');
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
        `<div class="feedback-heading success-heading"><div><strong>🌟 ¡Eso, Antonia!</strong><span>Lo miraste y lo corregiste.</span></div></div>
         <div class="feedback-mini-equation">${current.summary}</div>
         <div class="feedback-action">¡Muy bien! 💛</div>`,
        true
      );
    } else {
      const message = state.streak >= 3 ? '🔥 ¡Excelente racha, Antonia!' : '✨ ¡Muy bien, Antonia!';
      showFeedback(
        'success',
        `<div class="feedback-heading success-heading"><div><strong>${message}</strong><span>${current.summary}</span></div></div>`,
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
  const topic = topicByKey(state.topicKey);
  progress.sessions += 1;
  progress.byTopic[state.topicKey] = (progress.byTopic[state.topicKey] || 0) + 1;
  saveProgress();
  els.finalScore.textContent = state.score;

  if (state.score >= 9) {
    els.resultEmoji.textContent = '🏆';
    els.resultTitle.textContent = '¡Espectacular, Antonia!';
    els.resultText.textContent = `Dominaste esta práctica de ${topic.short.toLowerCase()}.`;
  } else if (state.score >= 7) {
    els.resultEmoji.textContent = '🌟';
    els.resultTitle.textContent = '¡Muy buen trabajo!';
    els.resultText.textContent = `Vas muy bien en ${topic.short.toLowerCase()}.`;
  } else if (state.score >= 5) {
    els.resultEmoji.textContent = '💪';
    els.resultTitle.textContent = '¡Buen entrenamiento!';
    els.resultText.textContent = 'Una práctica corta más ayudará a fijarlo.';
  } else {
    els.resultEmoji.textContent = '🌱';
    els.resultTitle.textContent = 'Estamos aprendiendo';
    els.resultText.textContent = 'Mirar una pista, corregir y volver a intentar también es aprender.';
  }

  els.homeButton.textContent = `Volver a ${topic.short}`;
  showView(els.resultView);
}

function restartCurrentSession() {
  if (state.mode === 'table') {
    startSession({ mode: 'table', topicKey: 'multiplication', table: state.table });
  } else if (state.mode === 'mixed') {
    startSession({ mode: 'mixed', topicKey: 'multiplication' });
  } else {
    startTopicSession(state.topicKey);
  }
}

els.moduleBackButton.addEventListener('click', () => showView(els.homeView));
els.startTopicButton.addEventListener('click', () => startTopicSession(state.topicKey));
els.mixedButton.addEventListener('click', () => startSession({ mode: 'mixed', topicKey: 'multiplication' }));
els.backButton.addEventListener('click', () => openTopic(state.topicKey));
els.nextButton.addEventListener('click', nextQuestion);
els.againButton.addEventListener('click', restartCurrentSession);
els.homeButton.addEventListener('click', () => openTopic(state.topicKey));
els.routeButton.addEventListener('click', () => showView(els.homeView));

buildCurriculumCards();
buildTableButtons();
renderProgress();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

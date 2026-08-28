'use strict';

const LANGUAGE_APP_VERSION = '13.0.0';
const LANGUAGE_SESSION_LENGTH = 10;

const languageState = {
  topic: 'comprehension',
  questionIndex: 0,
  currentQuestionId: null,
  score: 0,
  streak: 0,
  attempts: 0,
  answered: false,
  processing: false,
  questions: [],
};

const languageTopics = [
  { key: 'comprehension', icon: '📖', title: 'Comprensión lectora', subtitle: 'Leer, entender y responder' },
  { key: 'vocabulary', icon: '🧠', title: 'Vocabulario', subtitle: 'Significados y sinónimos' },
  { key: 'spelling', icon: '🔤', title: 'Ortografía', subtitle: 'Escribir palabras correctamente' },
  { key: 'grammar', icon: '🧩', title: 'Gramática', subtitle: 'Sustantivos, adjetivos y verbos' },
  { key: 'writing', icon: '✏️', title: 'Escritura', subtitle: 'Ordenar y mejorar oraciones' },
  { key: 'review', icon: '🌟', title: 'Repaso mixto', subtitle: 'Un poco de todo' },
];

const els = {
  home: document.querySelector('#languageHome'),
  quiz: document.querySelector('#languageQuiz'),
  result: document.querySelector('#languageResult'),
  grid: document.querySelector('#languageTopicGrid'),
  stars: document.querySelector('#languageStars'),
  sessions: document.querySelector('#languageSessions'),
  bestStreak: document.querySelector('#languageBestStreak'),
  back: document.querySelector('#languageBackButton'),
  modeLabel: document.querySelector('#languageModeLabel'),
  counter: document.querySelector('#languageCounter'),
  prompt: document.querySelector('#languagePrompt'),
  question: document.querySelector('#languageQuestion'),
  answers: document.querySelector('#languageAnswers'),
  feedback: document.querySelector('#languageFeedback'),
  next: document.querySelector('#languageNextButton'),
  streak: document.querySelector('#languageStreak'),
  resultEmoji: document.querySelector('#languageResultEmoji'),
  resultTitle: document.querySelector('#languageResultTitle'),
  resultText: document.querySelector('#languageResultText'),
  finalScore: document.querySelector('#languageFinalScore'),
  again: document.querySelector('#languageAgainButton'),
  homeButton: document.querySelector('#languageHomeButton'),
};

function assertRequiredElements() {
  const missing = Object.entries(els).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Faltan elementos de Lenguaje: ${missing.join(', ')}`);
}

function loadLanguageProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem('antoniaLanguageProgress') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const languageProgress = loadLanguageProgress();
languageProgress.stars = Number.isFinite(languageProgress.stars) ? languageProgress.stars : 0;
languageProgress.sessions = Number.isFinite(languageProgress.sessions) ? languageProgress.sessions : 0;
languageProgress.bestStreak = Number.isFinite(languageProgress.bestStreak) ? languageProgress.bestStreak : 0;
languageProgress.byTopic = languageProgress.byTopic && typeof languageProgress.byTopic === 'object' ? languageProgress.byTopic : {};

function saveLanguageProgress() {
  try {
    localStorage.setItem('antoniaLanguageProgress', JSON.stringify(languageProgress));
  } catch {
    // La práctica puede continuar aunque el almacenamiento falle.
  }
  renderLanguageProgress();
}

function renderLanguageProgress() {
  els.stars.textContent = String(languageProgress.stars);
  els.sessions.textContent = String(languageProgress.sessions);
  els.bestStreak.textContent = String(languageProgress.bestStreak);
}

function showLanguageView(view) {
  [els.home, els.quiz, els.result].forEach(item => item.classList.remove('active'));
  view.classList.add('active');
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let questionSerial = 0;
function nextQuestionId() {
  questionSerial += 1;
  return `lang-${Date.now()}-${questionSerial}`;
}

function q(prompt, display, correct, options, explanation, reading = false) {
  const correctText = String(correct);
  const uniqueOptions = [];
  [correctText, ...options.map(String)].forEach(value => {
    if (!uniqueOptions.includes(value)) uniqueOptions.push(value);
  });
  if (!prompt || !display || !correctText || uniqueOptions.length < 2) throw new Error('Pregunta de Lenguaje inválida');
  return { prompt, display, correct: correctText, options: uniqueOptions, explanation, reading };
}

const questionBanks = {
  comprehension: [
    q('Lee y responde: ¿Dónde encontró Luna la caja?', 'Luna caminaba por el jardín cuando vio una caja pequeña debajo del limonero. La abrió con cuidado y encontró semillas de colores.', 'debajo del limonero', ['debajo del limonero', 'en la cocina', 'junto a la cama', 'en el colegio'], 'El texto dice que la caja estaba debajo del limonero.', true),
    q('Lee y responde: ¿Qué hizo Mateo antes de salir?', 'Mateo guardó sus cuadernos, cerró la mochila y se puso la chaqueta. Luego salió rumbo a la escuela.', 'se puso la chaqueta', ['se puso la chaqueta', 'tomó desayuno', 'jugó fútbol', 'leyó un cuento'], 'Justo antes de salir, Mateo se puso la chaqueta.', true),
    q('Lee y responde: ¿Por qué Sofía llevó paraguas?', 'El cielo estaba gris y comenzaban a caer gotas. Sofía miró por la ventana y decidió llevar su paraguas.', 'porque estaba comenzando a llover', ['porque estaba comenzando a llover', 'porque hacía mucho calor', 'porque iba a nadar', 'porque había viento fuerte'], 'Las gotas y el cielo gris indican que estaba comenzando a llover.', true),
    q('Lee y responde: ¿Cuál es la idea principal?', 'En la plaza, varios vecinos plantaron flores y árboles. También recogieron papeles y limpiaron los juegos para dejar el lugar más bonito.', 'los vecinos cuidaron y mejoraron la plaza', ['los vecinos cuidaron y mejoraron la plaza', 'los niños cerraron la plaza', 'nadie quiso ayudar', 'la plaza estaba vacía'], 'Todas las acciones del texto muestran que los vecinos cuidaron y mejoraron la plaza.', true),
    q('Lee y responde: ¿Qué animal aparece en el texto?', 'Al amanecer, un pequeño zorzal se posó en la ventana y comenzó a cantar.', 'un zorzal', ['un zorzal', 'un gato', 'un caballo', 'un pez'], 'El texto nombra directamente a un zorzal.', true),
    q('Lee y responde: ¿Qué pasó al final?', 'Camila preparó una tarjeta para su abuela. La decoró con estrellas, escribió un mensaje y finalmente la puso dentro de un sobre.', 'puso la tarjeta dentro de un sobre', ['puso la tarjeta dentro de un sobre', 'rompió la tarjeta', 'compró un cuaderno', 'salió a correr'], 'La última acción es poner la tarjeta dentro de un sobre.', true),
    q('Lee y responde: ¿Cómo se sentía Tomás?', 'Tomás sonrió al ver su dibujo pegado en el mural del curso. Se lo mostró orgulloso a sus amigos.', 'orgulloso y contento', ['orgulloso y contento', 'asustado', 'enojado', 'aburrido'], 'Sonreír y mostrar orgulloso su trabajo indica que estaba contento.', true),
    q('Lee y responde: ¿Para qué sirve la receta?', 'La receta explica los ingredientes y los pasos necesarios para preparar panqueques.', 'para enseñar a preparar panqueques', ['para enseñar a preparar panqueques', 'para contar un cuento', 'para anunciar una película', 'para describir un animal'], 'Una receta entrega ingredientes y pasos para preparar algo.', true),
  ],
  vocabulary: [
    q('¿Qué palabra significa casi lo mismo que “feliz”?', 'feliz', 'contento', ['contento', 'oscuro', 'rápido', 'pequeño'], 'Contento es un sinónimo de feliz.'),
    q('¿Qué palabra significa lo contrario de “grande”?', 'grande', 'pequeño', ['pequeño', 'enorme', 'alto', 'ancho'], 'Pequeño es un antónimo de grande.'),
    q('¿Qué significa “enorme”?', 'enorme', 'muy grande', ['muy grande', 'muy pequeño', 'muy lento', 'muy frío'], 'Enorme significa muy grande.'),
    q('¿Cuál palabra pertenece a la misma familia que “pan”?', 'pan', 'panadero', ['panadero', 'pintor', 'jardín', 'ventana'], 'Panadero pertenece a la familia de palabras de pan.'),
    q('¿Qué palabra es un sinónimo de “rápido”?', 'rápido', 'veloz', ['veloz', 'lento', 'pesado', 'dulce'], 'Veloz significa casi lo mismo que rápido.'),
    q('¿Cuál palabra nombra un lugar donde se guardan libros?', 'Lugar con muchos libros', 'biblioteca', ['biblioteca', 'panadería', 'farmacia', 'estadio'], 'Una biblioteca es un lugar donde se guardan y consultan libros.'),
    q('¿Qué palabra completa mejor la idea?', 'El hielo está muy ___.', 'frío', ['frío', 'ruidoso', 'redondo', 'rápido'], 'Frío describe correctamente al hielo.'),
    q('¿Cuál palabra es un antónimo de “entrar”?', 'entrar', 'salir', ['salir', 'pasar', 'caminar', 'mirar'], 'Salir expresa la acción contraria a entrar.'),
  ],
  spelling: [
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'jirafa', ['jirafa', 'girafa', 'jirrafa', 'girrafa'], 'Jirafa se escribe con j.'),
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'guitarra', ['guitarra', 'gitarra', 'guitara', 'juitarra'], 'Guitarra se escribe con gu y doble r.'),
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'huevo', ['huevo', 'uevo', 'guevo', 'huebo'], 'Huevo comienza con h y se escribe con v.'),
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'bicicleta', ['bicicleta', 'visicleta', 'bisicleta', 'bicicreta'], 'Bicicleta se escribe con b y c.'),
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'queso', ['queso', 'keso', 'queso', 'guezo'], 'Queso se escribe con qu antes de e.'),
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'lluvia', ['lluvia', 'yuvia', 'llubia', 'yubia'], 'Lluvia comienza con ll y se escribe con v.'),
    q('¿Cuál palabra está escrita correctamente?', 'Elige la correcta', 'zanahoria', ['zanahoria', 'sanahoria', 'zanahoría', 'zanahorra'], 'Zanahoria comienza con z y lleva h.'),
    q('¿Cuál oración usa mayúscula y punto correctamente?', 'Elige la mejor escrita', 'Mi perro corre rápido.', ['Mi perro corre rápido.', 'mi perro corre rápido.', 'Mi perro corre rápido', 'mi perro corre rápido'], 'Una oración comienza con mayúscula y termina con punto.'),
  ],
  grammar: [
    q('¿Cuál es el sustantivo de la oración?', 'La niña canta.', 'niña', ['niña', 'canta', 'la', 'rápido'], 'Niña nombra a una persona, por eso es un sustantivo.'),
    q('¿Cuál es el verbo de la oración?', 'El perro salta alto.', 'salta', ['salta', 'perro', 'alto', 'el'], 'Salta expresa una acción, por eso es un verbo.'),
    q('¿Cuál es el adjetivo de la oración?', 'La casa azul tiene una puerta grande.', 'azul', ['azul', 'casa', 'tiene', 'puerta'], 'Azul describe cómo es la casa.'),
    q('¿Cuál palabra está en plural?', 'Elige la palabra plural', 'árboles', ['árboles', 'árbol', 'hoja', 'rama'], 'Árboles nombra más de un árbol.'),
    q('¿Cuál oración está en pasado?', 'Elige la correcta', 'Ayer jugamos en el parque.', ['Ayer jugamos en el parque.', 'Hoy jugamos en el parque.', 'Mañana jugaremos en el parque.', 'Ahora jugamos en el parque.'], 'La palabra ayer y el verbo jugamos indican una acción pasada.'),
    q('¿Qué palabra puede reemplazar a “María” para no repetir su nombre?', 'María lee. María dibuja.', 'Ella', ['Ella', 'Ellos', 'Nosotros', 'Tú'], 'Ella puede reemplazar a María.'),
    q('¿Cuál es un nombre propio?', 'Elige el nombre propio', 'Chile', ['Chile', 'país', 'ciudad', 'montaña'], 'Chile es el nombre específico de un país y se escribe con mayúscula.'),
    q('¿Cuál grupo forma una oración completa?', 'Elige la oración', 'El gato duerme en la silla.', ['El gato duerme en la silla.', 'En la silla el', 'Gato la silla', 'Duerme y'], 'La oración completa expresa una idea con sentido.'),
  ],
  writing: [
    q('¿Cuál oración está mejor ordenada?', 'ayer / parque / fuimos / al', 'Ayer fuimos al parque.', ['Ayer fuimos al parque.', 'Fuimos ayer parque al.', 'Al ayer parque fuimos.', 'Parque fuimos al ayer.'], 'La oración ordenada expresa la idea con claridad.'),
    q('¿Cuál es la mejor forma de unir estas ideas?', 'Ana tomó su paraguas. Estaba lloviendo.', 'Ana tomó su paraguas porque estaba lloviendo.', ['Ana tomó su paraguas porque estaba lloviendo.', 'Ana tomó su paraguas pero estaba lloviendo.', 'Ana tomó su paraguas o estaba lloviendo.', 'Ana paraguas estaba.'], 'Porque explica la causa de tomar el paraguas.'),
    q('¿Cuál oración tiene una descripción más clara?', 'Describe una flor', 'La flor es roja y tiene pétalos grandes.', ['La flor es roja y tiene pétalos grandes.', 'La flor está.', 'Flor roja grande cosa.', 'La flor y.'], 'La primera oración entrega información clara y completa.'),
    q('¿Cuál sería un buen inicio para un cuento?', 'Elige el mejor comienzo', 'Una mañana, Martina encontró una llave misteriosa.', ['Una mañana, Martina encontró una llave misteriosa.', 'Y después terminó.', 'Porque sí.', 'Fin.'], 'Un buen inicio presenta una situación que invita a seguir leyendo.'),
    q('¿Cuál sería un buen cierre?', 'Elige el mejor final', 'Desde ese día, nunca olvidaron aquella aventura.', ['Desde ese día, nunca olvidaron aquella aventura.', 'Primero salieron.', 'Había una casa.', 'Entonces porque.'], 'Un buen cierre termina la idea del relato.'),
    q('¿Qué conector indica orden?', 'Primero lavamos las frutas. ___ las cortamos.', 'Luego', ['Luego', 'Porque', 'Aunque', 'Pero'], 'Luego indica que una acción ocurre después de otra.'),
    q('¿Cuál oración evita repetir una palabra innecesariamente?', 'Pedro tiene una bicicleta. Pedro usa la bicicleta todos los días.', 'Pedro tiene una bicicleta y la usa todos los días.', ['Pedro tiene una bicicleta y la usa todos los días.', 'Pedro tiene bicicleta Pedro bicicleta.', 'Pedro bicicleta todos Pedro.', 'Tiene Pedro y bicicleta.'], 'Usar “la” evita repetir bicicleta y mantiene el sentido.'),
    q('¿Cuál título queda mejor para un texto sobre cómo cuidar una mascota?', 'Elige el título', 'Cómo cuidar a tu mascota', ['Cómo cuidar a tu mascota', 'Un día cualquiera', 'Mi lápiz azul', 'Las nubes'], 'El título debe anticipar de qué trata el texto.'),
  ],
};

function buildTopicCards() {
  els.grid.innerHTML = '';
  languageTopics.forEach(topic => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'english-topic-card';
    button.innerHTML = `<span class="english-topic-icon" aria-hidden="true">${topic.icon}</span><span class="english-topic-copy"><strong>${topic.title}</strong><small>${topic.subtitle}</small></span><span class="english-topic-status">Practicar →</span>`;
    button.addEventListener('click', () => startLanguageSession(topic.key));
    els.grid.appendChild(button);
  });
}

function bankFor(topic) {
  if (topic !== 'review') return questionBanks[topic] || questionBanks.comprehension;
  return [
    ...questionBanks.comprehension,
    ...questionBanks.vocabulary,
    ...questionBanks.spelling,
    ...questionBanks.grammar,
    ...questionBanks.writing,
  ];
}

function makeSessionQuestions(topic) {
  const bank = bankFor(topic);
  const source = shuffle(bank);
  const result = [];
  for (let index = 0; index < LANGUAGE_SESSION_LENGTH; index += 1) {
    const base = source[index % source.length];
    result.push({ ...base, id: nextQuestionId(), options: shuffle(base.options) });
  }
  return shuffle(result);
}

function startLanguageSession(topic) {
  languageState.topic = topic;
  languageState.questionIndex = 0;
  languageState.currentQuestionId = null;
  languageState.score = 0;
  languageState.streak = 0;
  languageState.attempts = 0;
  languageState.answered = false;
  languageState.processing = false;
  languageState.questions = makeSessionQuestions(topic);
  const info = languageTopics.find(item => item.key === topic) || languageTopics[0];
  els.modeLabel.textContent = info.title;
  showLanguageView(els.quiz);
  renderLanguageQuestion();
}

function getCurrentQuestion() {
  return languageState.questions[languageState.questionIndex] || null;
}

function isCurrentQuestion(questionId) {
  const current = getCurrentQuestion();
  return Boolean(current && current.id === questionId && languageState.currentQuestionId === questionId);
}

function renderLanguageQuestion() {
  const current = getCurrentQuestion();
  if (!current) return;
  languageState.currentQuestionId = current.id;
  languageState.attempts = 0;
  languageState.answered = false;
  languageState.processing = false;
  els.counter.textContent = `${languageState.questionIndex + 1} / ${LANGUAGE_SESSION_LENGTH}`;
  els.prompt.textContent = current.prompt;
  els.question.textContent = current.display;
  els.question.classList.toggle('reading', current.reading || current.display.length > 70);
  els.streak.textContent = String(languageState.streak);
  els.answers.innerHTML = '';
  els.feedback.innerHTML = '';
  els.feedback.className = 'feedback';
  els.next.classList.add('hidden');

  current.options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    button.textContent = option;
    button.dataset.value = option;
    button.dataset.questionId = current.id;
    button.addEventListener('click', () => answerLanguage(current.id, option, button));
    els.answers.appendChild(button);
  });
}

function showFeedback(kind, title, text, answer = '') {
  els.feedback.className = `english-feedback-card ${kind}`;
  els.feedback.innerHTML = `<strong class="english-feedback-title">${title}</strong><p class="english-feedback-text">${text}</p>${answer ? `<div class="english-feedback-answer">${answer}</div>` : ''}`;
}

function finishAnswer(questionId) {
  if (!isCurrentQuestion(questionId)) return;
  const current = getCurrentQuestion();
  languageState.answered = true;
  [...els.answers.querySelectorAll('.answer-button')].forEach(button => {
    button.disabled = true;
    if (button.dataset.questionId === questionId && button.dataset.value === current.correct) button.classList.add('correct');
  });
  languageProgress.bestStreak = Math.max(languageProgress.bestStreak, languageState.streak);
  saveLanguageProgress();
  els.streak.textContent = String(languageState.streak);
  els.next.textContent = languageState.questionIndex === LANGUAGE_SESSION_LENGTH - 1 ? 'Ver resultado 🌟' : 'Siguiente →';
  els.next.classList.remove('hidden');
}

function answerLanguage(questionId, value, button) {
  if (languageState.processing || languageState.answered || button.disabled) return;
  if (!isCurrentQuestion(questionId) || button.dataset.questionId !== questionId) return;
  languageState.processing = true;
  try {
    const current = getCurrentQuestion();
    if (String(value) === current.correct) {
      button.classList.add('correct');
      languageState.score += 1;
      languageState.streak += 1;
      languageProgress.stars += 1;
      if (languageState.attempts === 1) showFeedback('success', '🌟 ¡Eso!', 'Lo miraste y lo corregiste.', current.correct);
      else showFeedback('success', languageState.streak >= 3 ? '🔥 ¡Excelente racha!' : '✨ ¡Muy bien!', current.explanation, current.correct);
      finishAnswer(questionId);
      return;
    }

    button.classList.add('wrong');
    button.disabled = true;
    if (languageState.attempts === 0) {
      languageState.attempts = 1;
      showFeedback('', '💡 Una pista fácil', current.explanation, `Busca: ${current.correct}`);
      return;
    }

    languageState.attempts = 2;
    languageState.streak = 0;
    showFeedback('gentle', '🌷 Miremos la respuesta', current.explanation, current.correct);
    finishAnswer(questionId);
  } finally {
    languageState.processing = false;
  }
}

function nextLanguageQuestion() {
  if (!languageState.answered || languageState.processing) return;
  languageState.answered = false;
  languageState.currentQuestionId = null;
  if (languageState.questionIndex < LANGUAGE_SESSION_LENGTH - 1) {
    languageState.questionIndex += 1;
    renderLanguageQuestion();
  } else {
    finishLanguageSession();
  }
}

function finishLanguageSession() {
  const info = languageTopics.find(item => item.key === languageState.topic) || languageTopics[0];
  languageProgress.sessions += 1;
  languageProgress.byTopic[languageState.topic] = (Number(languageProgress.byTopic[languageState.topic]) || 0) + 1;
  saveLanguageProgress();
  els.finalScore.textContent = String(languageState.score);

  if (languageState.score >= 9) {
    els.resultEmoji.textContent = '🏆';
    els.resultTitle.textContent = '¡Excelente!';
    els.resultText.textContent = `Muy buen dominio de ${info.title.toLowerCase()}.`;
  } else if (languageState.score >= 7) {
    els.resultEmoji.textContent = '🌟';
    els.resultTitle.textContent = '¡Muy buen trabajo!';
    els.resultText.textContent = `Vas muy bien en ${info.title.toLowerCase()}.`;
  } else if (languageState.score >= 5) {
    els.resultEmoji.textContent = '💪';
    els.resultTitle.textContent = '¡Buen entrenamiento!';
    els.resultText.textContent = 'Una ronda corta más ayudará a fijarlo.';
  } else {
    els.resultEmoji.textContent = '🌱';
    els.resultTitle.textContent = 'Seguimos aprendiendo';
    els.resultText.textContent = 'Leer la pista, corregir y volver a intentar también es aprender.';
  }
  showLanguageView(els.result);
}

function bindEvents() {
  els.back.addEventListener('click', () => showLanguageView(els.home));
  els.next.addEventListener('click', nextLanguageQuestion);
  els.again.addEventListener('click', () => startLanguageSession(languageState.topic));
  els.homeButton.addEventListener('click', () => showLanguageView(els.home));
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      registration.update().catch(() => {});
    } catch {
      // Lenguaje funciona online aunque falle la PWA.
    }
  });
}

function initLanguage() {
  assertRequiredElements();
  buildTopicCards();
  bindEvents();
  renderLanguageProgress();
  registerServiceWorker();
  document.documentElement.dataset.appVersion = LANGUAGE_APP_VERSION;
}

try {
  initLanguage();
} catch (error) {
  console.error('No se pudo iniciar Lenguaje', error);
  const main = document.querySelector('main');
  if (main) {
    const notice = document.createElement('div');
    notice.className = 'panel';
    notice.setAttribute('role', 'alert');
    notice.innerHTML = '<h2>Necesitamos recargar</h2><p>Lenguaje no pudo iniciar correctamente. Cierra esta ventana y vuelve a abrirla.</p>';
    main.prepend(notice);
  }
}

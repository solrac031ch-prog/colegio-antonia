const englishState = {
  topic: 'vocabulary',
  questionIndex: 0,
  score: 0,
  streak: 0,
  attempts: 0,
  answered: false,
  questions: [],
};

const englishTopics = [
  { key: 'vocabulary', icon: '🧠', title: 'Vocabulary', subtitle: 'Palabras de uso diario' },
  { key: 'grammar', icon: '🧩', title: 'Grammar', subtitle: 'Do, does, is, are, have...' },
  { key: 'reading', icon: '📖', title: 'Reading', subtitle: 'Leer y comprender frases cortas' },
  { key: 'conversation', icon: '💬', title: 'Conversation', subtitle: 'Preguntas y respuestas simples' },
  { key: 'writing', icon: '✏️', title: 'Writing', subtitle: 'Elegir la frase bien escrita' },
  { key: 'review', icon: '🌟', title: 'Mixed review', subtitle: 'Un poco de todo' },
];

const els = {
  home: document.querySelector('#englishHome'),
  quiz: document.querySelector('#englishQuiz'),
  result: document.querySelector('#englishResult'),
  grid: document.querySelector('#englishTopicGrid'),
  stars: document.querySelector('#englishStars'),
  sessions: document.querySelector('#englishSessions'),
  bestStreak: document.querySelector('#englishBestStreak'),
  back: document.querySelector('#englishBackButton'),
  modeLabel: document.querySelector('#englishModeLabel'),
  counter: document.querySelector('#englishCounter'),
  prompt: document.querySelector('#englishPrompt'),
  question: document.querySelector('#englishQuestion'),
  answers: document.querySelector('#englishAnswers'),
  feedback: document.querySelector('#englishFeedback'),
  next: document.querySelector('#englishNextButton'),
  streak: document.querySelector('#englishStreak'),
  resultEmoji: document.querySelector('#englishResultEmoji'),
  resultTitle: document.querySelector('#englishResultTitle'),
  resultText: document.querySelector('#englishResultText'),
  finalScore: document.querySelector('#englishFinalScore'),
  again: document.querySelector('#englishAgainButton'),
  homeButton: document.querySelector('#englishHomeButton'),
};

let englishProgress;
try {
  englishProgress = JSON.parse(localStorage.getItem('antoniaEnglishProgress') || '{}');
} catch {
  englishProgress = {};
}
englishProgress.stars ||= 0;
englishProgress.sessions ||= 0;
englishProgress.bestStreak ||= 0;
englishProgress.byTopic ||= {};

function saveEnglishProgress() {
  localStorage.setItem('antoniaEnglishProgress', JSON.stringify(englishProgress));
  renderEnglishProgress();
}

function renderEnglishProgress() {
  els.stars.textContent = englishProgress.stars;
  els.sessions.textContent = englishProgress.sessions;
  els.bestStreak.textContent = englishProgress.bestStreak;
}

function showEnglishView(view) {
  [els.home, els.quiz, els.result].forEach(item => item.classList.remove('active'));
  view.classList.add('active');
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

function q(prompt, display, correct, options, explanation, reading = false) {
  return { prompt, display, correct, options: shuffle(options), explanation, reading };
}

const questionBanks = {
  vocabulary: [
    q('¿Qué significa esta palabra?', 'breakfast', 'desayuno', ['desayuno', 'almuerzo', 'cena', 'escuela'], 'Breakfast significa desayuno.'),
    q('¿Qué significa esta palabra?', 'library', 'biblioteca', ['biblioteca', 'cocina', 'parque', 'tienda'], 'Library significa biblioteca.'),
    q('¿Qué significa esta palabra?', 'teacher', 'profesor/a', ['profesor/a', 'doctor/a', 'amigo/a', 'vecino/a'], 'Teacher significa profesor o profesora.'),
    q('¿Qué significa esta palabra?', 'hungry', 'hambriento/a', ['hambriento/a', 'cansado/a', 'feliz', 'rápido/a'], 'Hungry significa tener hambre.'),
    q('¿Qué significa esta palabra?', 'playground', 'patio de juegos', ['patio de juegos', 'dormitorio', 'baño', 'comedor'], 'Playground es el patio o lugar donde los niños juegan.'),
    q('Elige la palabra en inglés.', 'gato', 'cat', ['cat', 'dog', 'bird', 'fish'], 'Cat significa gato.'),
    q('Elige la palabra en inglés.', 'agua', 'water', ['water', 'milk', 'juice', 'bread'], 'Water significa agua.'),
    q('Elige la palabra en inglés.', 'hermana', 'sister', ['sister', 'brother', 'mother', 'friend'], 'Sister significa hermana.'),
    q('Elige la palabra en inglés.', 'correr', 'run', ['run', 'read', 'sleep', 'draw'], 'Run significa correr.'),
    q('Elige la palabra en inglés.', 'zapatos', 'shoes', ['shoes', 'shirt', 'hat', 'socks'], 'Shoes significa zapatos.'),
    q('¿Qué significa esta palabra?', 'afternoon', 'tarde', ['tarde', 'mañana', 'noche', 'semana'], 'Afternoon significa tarde.'),
    q('¿Qué significa esta palabra?', 'beautiful', 'bonito/a', ['bonito/a', 'pequeño/a', 'ruidoso/a', 'frío/a'], 'Beautiful significa bonito o bonita.'),
  ],

  grammar: [
    q('Completa la oración.', 'She ___ like apples.', "doesn't", ["doesn't", "don't", 'is', 'do'], 'Con she usamos does o doesn’t. Aquí la frase es negativa: She doesn’t like apples.'),
    q('Completa la pregunta.', '___ he like football?', 'Does', ['Does', 'Do', 'Is', 'Are'], 'Con he usamos Does: Does he like football?'),
    q('Completa la pregunta.', '___ they play tennis?', 'Do', ['Do', 'Does', 'Is', 'Has'], 'Con they usamos Do: Do they play tennis?'),
    q('Completa la oración.', 'I ___ like coffee.', "don't", ["don't", "doesn't", 'not', 'isn’t'], 'Con I usamos don’t: I don’t like coffee.'),
    q('Completa la oración.', 'He ___ a blue backpack.', 'has', ['has', 'have', 'is', 'do'], 'Con he usamos has: He has a blue backpack.'),
    q('Completa la oración.', 'They ___ two dogs.', 'have', ['have', 'has', 'does', 'are'], 'Con they usamos have: They have two dogs.'),
    q('Completa la oración.', 'She ___ happy.', 'is', ['is', 'are', 'am', 'do'], 'Con she usamos is: She is happy.'),
    q('Completa la oración.', 'We ___ at school.', 'are', ['are', 'is', 'am', 'does'], 'Con we usamos are: We are at school.'),
    q('Completa la oración.', 'I ___ swim.', 'can', ['can', 'does', 'has', 'am'], 'Can expresa habilidad: I can swim.'),
    q('Elige la pregunta correcta.', 'Preguntar si ella tiene una mascota', 'Does she have a pet?', ['Does she have a pet?', 'Do she has a pet?', 'She does have a pet?', 'Does she has a pet?'], 'Después de does usamos el verbo base: have.'),
    q('Completa la oración.', 'There ___ a book on the table.', 'is', ['is', 'are', 'have', 'do'], 'Para una sola cosa usamos There is.'),
    q('Completa la oración.', 'There ___ three pencils.', 'are', ['are', 'is', 'has', 'does'], 'Para varias cosas usamos There are.'),
  ],

  reading: [
    q('Lee y responde: ¿Qué mascota tiene Mia?', 'Mia is nine. She has a small brown dog. His name is Coco. Mia plays with Coco after school.', 'a dog', ['a dog', 'a cat', 'a bird', 'a fish'], 'El texto dice: She has a small brown dog.', true),
    q('Lee y responde: ¿Cuándo juega Tom fútbol?', 'Tom likes football. He plays with his friends on Saturday morning. On Sunday, he visits his grandma.', 'Saturday morning', ['Saturday morning', 'Sunday morning', 'Monday afternoon', 'Friday night'], 'El texto dice que juega on Saturday morning.', true),
    q('Lee y responde: ¿Qué le gusta desayunar a Lucy?', 'Lucy gets up at seven o’clock. For breakfast, she likes milk and toast. Then she goes to school.', 'milk and toast', ['milk and toast', 'juice and rice', 'water and pasta', 'tea and soup'], 'El texto dice: she likes milk and toast.', true),
    q('Lee y responde: ¿Dónde está el libro?', 'The book is on the desk. The pencil is under the chair. The backpack is next to the door.', 'on the desk', ['on the desk', 'under the chair', 'next to the door', 'in the bag'], 'La primera frase dice: The book is on the desk.', true),
    q('Lee y responde: ¿Cuántos hermanos tiene Ben?', 'Ben has one brother and two sisters. They live in a house near the park.', 'three', ['three', 'one', 'two', 'four'], 'Uno más dos son tres hermanos en total.', true),
    q('Lee y responde: ¿Qué animal puede volar?', 'The penguin can swim, but it cannot fly. The parrot can fly and it can talk a little.', 'the parrot', ['the parrot', 'the penguin', 'both animals', 'neither animal'], 'El texto dice: The parrot can fly.', true),
    q('Lee y responde: ¿Cómo está el clima?', 'It is cold and rainy today. Emma wears her coat and takes an umbrella.', 'cold and rainy', ['cold and rainy', 'hot and sunny', 'warm and windy', 'snowy and hot'], 'El texto comienza diciendo: It is cold and rainy today.', true),
    q('Lee y responde: ¿Qué hace Leo después de la escuela?', 'After school, Leo does his homework. Then he rides his bike in the park.', 'he does his homework', ['he does his homework', 'he goes to bed', 'he eats breakfast', 'he goes swimming'], 'Primero, después de la escuela, Leo hace su tarea.', true),
  ],

  conversation: [
    q('Elige la mejor respuesta.', 'Do you like pizza?', 'Yes, I do.', ['Yes, I do.', 'Yes, I am.', 'Yes, she does.', 'No, I can.'], 'A una pregunta con Do you…? podemos responder Yes, I do.'),
    q('Elige la mejor respuesta.', 'Does she like cats?', "No, she doesn't.", ["No, she doesn't.", "No, she don't.", 'No, she isn’t.', 'No, I do.'], 'Con Does she…? respondemos No, she doesn’t.'),
    q('Elige la mejor respuesta.', 'How old are you?', "I'm nine.", ["I'm nine.", 'I have nine.', 'It is nine.', 'Yes, I am.'], 'Para decir la edad en inglés usamos I’m nine.'),
    q('Elige la mejor respuesta.', 'What is your name?', 'My name is Anna.', ['My name is Anna.', 'I am fine.', 'I like Anna.', 'It is Monday.'], 'La respuesta natural es My name is…'),
    q('Elige la mejor respuesta.', 'Can you swim?', 'Yes, I can.', ['Yes, I can.', 'Yes, I do.', 'Yes, I am.', 'Yes, she can.'], 'A Can you…? respondemos Yes, I can.'),
    q('Elige la mejor respuesta.', 'Where is the pencil?', 'It is on the desk.', ['It is on the desk.', 'It is blue.', 'It is Monday.', 'I like pencils.'], 'Where pregunta por un lugar.'),
    q('Elige la mejor respuesta.', 'What is your favourite colour?', 'Purple.', ['Purple.', 'Nine years old.', 'At school.', 'Yes, I do.'], 'La pregunta pide un color favorito.'),
    q('Elige la mejor respuesta.', 'How are you?', "I'm fine, thanks.", ["I'm fine, thanks.", 'I am nine.', 'I have a dog.', 'It is sunny.'], 'How are you? pregunta cómo estás.'),
    q('Elige la mejor respuesta.', 'What time is it?', "It's three o'clock.", ["It's three o'clock.", 'It is a cat.', 'I am three.', 'On Monday.'], 'What time is it? pregunta la hora.'),
    q('Elige la mejor respuesta.', 'What do you do after school?', 'I do my homework.', ['I do my homework.', 'I am homework.', 'She does school.', 'Yes, I do.'], 'La pregunta pide una actividad después de la escuela.'),
  ],

  writing: [
    q('Elige la oración bien escrita.', 'ella tiene un perro', 'She has a dog.', ['She has a dog.', 'She have a dog.', 'Has she a dog.', 'She dog has.'], 'Con she usamos has: She has a dog.'),
    q('Elige la oración bien escrita.', 'a él no le gustan las zanahorias', "He doesn't like carrots.", ["He doesn't like carrots.", "He don't likes carrots.", 'He not like carrots.', "He doesn't likes carrots."], 'Después de doesn’t usamos like, sin s.'),
    q('Elige la oración bien escrita.', '¿Te gusta el helado?', 'Do you like ice cream?', ['Do you like ice cream?', 'Does you like ice cream?', 'You do like ice cream?', 'Do you likes ice cream?'], 'Con you usamos Do y luego el verbo base like.'),
    q('Elige la oración bien escrita.', 'Hay dos libros.', 'There are two books.', ['There are two books.', 'There is two books.', 'There two books are.', 'They are two book.'], 'Con varias cosas usamos There are.'),
    q('Elige la oración bien escrita.', 'Ella puede bailar.', 'She can dance.', ['She can dance.', 'She can dances.', 'She does can dance.', 'Can she dances.'], 'Después de can usamos el verbo base: dance.'),
    q('Elige la oración bien escrita.', 'Mi mochila es morada.', 'My backpack is purple.', ['My backpack is purple.', 'My purple backpack are.', 'Backpack my is purple.', 'My backpack purple.'], 'La estructura correcta es My backpack is purple.'),
    q('Elige la oración bien escrita.', 'Ellos juegan fútbol los sábados.', 'They play football on Saturdays.', ['They play football on Saturdays.', 'They plays football on Saturdays.', 'They football play Saturday.', 'They does play football.'], 'Con they usamos play, sin s.'),
    q('Elige la oración bien escrita.', '¿Ella tiene una hermana?', 'Does she have a sister?', ['Does she have a sister?', 'Does she has a sister?', 'Do she have a sister?', 'She does have sister?'], 'Después de does usamos have, no has.'),
    q('Elige la oración bien escrita.', 'Estoy en la escuela.', 'I am at school.', ['I am at school.', 'I is at school.', 'I are school.', 'Am I at school.'], 'Con I usamos am: I am at school.'),
    q('Elige la oración bien escrita.', 'El gato está debajo de la mesa.', 'The cat is under the table.', ['The cat is under the table.', 'The cat under is table.', 'The cat are under table.', 'Under the cat is table.'], 'Para ubicación usamos is under: The cat is under the table.'),
  ],
};

function buildTopicCards() {
  els.grid.innerHTML = '';
  englishTopics.forEach(topic => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'english-topic-card';
    button.innerHTML = `
      <span class="english-topic-icon" aria-hidden="true">${topic.icon}</span>
      <span class="english-topic-copy"><strong>${topic.title}</strong><small>${topic.subtitle}</small></span>
      <span class="english-topic-status">Practicar →</span>
    `;
    button.addEventListener('click', () => startEnglishSession(topic.key));
    els.grid.appendChild(button);
  });
}

function bankFor(topic) {
  if (topic !== 'review') return questionBanks[topic] || questionBanks.vocabulary;
  return [
    ...questionBanks.vocabulary,
    ...questionBanks.grammar,
    ...questionBanks.reading,
    ...questionBanks.conversation,
    ...questionBanks.writing,
  ];
}

function makeSessionQuestions(topic) {
  const bank = bankFor(topic);
  const mixed = shuffle(bank);
  const result = [];
  while (result.length < 10) {
    result.push(mixed[result.length % mixed.length]);
  }
  return shuffle(result);
}

function startEnglishSession(topic) {
  englishState.topic = topic;
  englishState.questionIndex = 0;
  englishState.score = 0;
  englishState.streak = 0;
  englishState.attempts = 0;
  englishState.answered = false;
  englishState.questions = makeSessionQuestions(topic);

  const info = englishTopics.find(item => item.key === topic) || englishTopics[0];
  els.modeLabel.textContent = info.title;
  showEnglishView(els.quiz);
  renderEnglishQuestion();
}

function renderEnglishQuestion() {
  const current = englishState.questions[englishState.questionIndex];
  englishState.attempts = 0;
  englishState.answered = false;
  els.counter.textContent = `${englishState.questionIndex + 1} / 10`;
  els.prompt.textContent = current.prompt;
  els.question.textContent = current.display;
  els.question.classList.toggle('reading', current.reading);
  els.streak.textContent = englishState.streak;
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
    button.addEventListener('click', () => answerEnglish(option, button));
    els.answers.appendChild(button);
  });
}

function feedback(kind, title, text, answer = '') {
  els.feedback.className = `english-feedback-card ${kind}`;
  els.feedback.innerHTML = `
    <strong class="english-feedback-title">${title}</strong>
    <p class="english-feedback-text">${text}</p>
    ${answer ? `<div class="english-feedback-answer">${answer}</div>` : ''}
  `;
}

function finishEnglishAnswer() {
  const current = englishState.questions[englishState.questionIndex];
  englishState.answered = true;
  [...els.answers.querySelectorAll('.answer-button')].forEach(button => {
    button.disabled = true;
    if (button.dataset.value === current.correct) button.classList.add('correct');
  });

  englishProgress.bestStreak = Math.max(englishProgress.bestStreak, englishState.streak);
  saveEnglishProgress();
  els.streak.textContent = englishState.streak;
  els.next.textContent = englishState.questionIndex === 9 ? 'Ver resultado 🌟' : 'Next →';
  els.next.classList.remove('hidden');
}

function answerEnglish(value, button) {
  if (englishState.answered || button.disabled) return;
  const current = englishState.questions[englishState.questionIndex];

  if (value === current.correct) {
    button.classList.add('correct');
    englishState.score += 1;
    englishState.streak += 1;
    englishProgress.stars += 1;

    if (englishState.attempts === 1) {
      feedback('success', '🌟 ¡Muy bien!', 'Lo miraste y lo corregiste.', current.correct);
    } else {
      feedback('success', englishState.streak >= 3 ? '🔥 Great streak!' : '✨ Great job!', current.explanation, current.correct);
    }
    finishEnglishAnswer();
    return;
  }

  button.classList.add('wrong');
  button.disabled = true;

  if (englishState.attempts === 0) {
    englishState.attempts = 1;
    feedback('', '💡 Una pista fácil', current.explanation, `Busca: ${current.correct}`);
    return;
  }

  englishState.attempts = 2;
  englishState.streak = 0;
  feedback('gentle', '🌷 Miremos la respuesta', current.explanation, current.correct);
  finishEnglishAnswer();
}

function nextEnglishQuestion() {
  if (!englishState.answered) return;
  if (englishState.questionIndex < 9) {
    englishState.questionIndex += 1;
    renderEnglishQuestion();
  } else {
    finishEnglishSession();
  }
}

function finishEnglishSession() {
  const info = englishTopics.find(item => item.key === englishState.topic) || englishTopics[0];
  englishProgress.sessions += 1;
  englishProgress.byTopic[englishState.topic] = (englishProgress.byTopic[englishState.topic] || 0) + 1;
  saveEnglishProgress();
  els.finalScore.textContent = englishState.score;

  if (englishState.score >= 9) {
    els.resultEmoji.textContent = '🏆';
    els.resultTitle.textContent = 'Excellent!';
    els.resultText.textContent = `Muy buen dominio de ${info.title}.`;
  } else if (englishState.score >= 7) {
    els.resultEmoji.textContent = '🌟';
    els.resultTitle.textContent = 'Great job!';
    els.resultText.textContent = `Vas muy bien en ${info.title}.`;
  } else if (englishState.score >= 5) {
    els.resultEmoji.textContent = '💪';
    els.resultTitle.textContent = 'Good practice!';
    els.resultText.textContent = 'Una ronda corta más ayudará a fijarlo.';
  } else {
    els.resultEmoji.textContent = '🌱';
    els.resultTitle.textContent = 'Keep learning!';
    els.resultText.textContent = 'Mirar la pista y corregir también es aprender.';
  }

  showEnglishView(els.result);
}

els.back.addEventListener('click', () => showEnglishView(els.home));
els.next.addEventListener('click', nextEnglishQuestion);
els.again.addEventListener('click', () => startEnglishSession(englishState.topic));
els.homeButton.addEventListener('click', () => showEnglishView(els.home));

buildTopicCards();
renderEnglishProgress();
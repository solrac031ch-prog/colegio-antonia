'use strict';

const ENGLISH_APP_VERSION = '13.0.0';
const ENGLISH_SESSION_LENGTH = 10;

const englishState = {
  topic: 'vocabulary',
  questionIndex: 0,
  currentQuestionId: null,
  score: 0,
  streak: 0,
  attempts: 0,
  answered: false,
  processing: false,
  questions: [],
};

const englishTopics = [
  { key: 'vocabulary', icon: '🧠', title: 'Vocabulary', subtitle: 'Everyday words and pictures' },
  { key: 'grammar', icon: '🧩', title: 'Grammar', subtitle: 'Do, does, is, are, have and more' },
  { key: 'reading', icon: '📖', title: 'Reading', subtitle: 'Read and understand short texts' },
  { key: 'conversation', icon: '💬', title: 'Conversation', subtitle: 'Simple questions and answers' },
  { key: 'writing', icon: '✏️', title: 'Writing', subtitle: 'Choose clear, correct sentences' },
  { key: 'review', icon: '🌟', title: 'Mixed review', subtitle: 'A little bit of everything' },
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

function assertRequiredElements() {
  const missing = Object.entries(els).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing English UI elements: ${missing.join(', ')}`);
}

function loadEnglishProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem('antoniaEnglishProgress') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const englishProgress = loadEnglishProgress();
englishProgress.stars = Number.isFinite(englishProgress.stars) ? englishProgress.stars : 0;
englishProgress.sessions = Number.isFinite(englishProgress.sessions) ? englishProgress.sessions : 0;
englishProgress.bestStreak = Number.isFinite(englishProgress.bestStreak) ? englishProgress.bestStreak : 0;
englishProgress.byTopic = englishProgress.byTopic && typeof englishProgress.byTopic === 'object' ? englishProgress.byTopic : {};

function saveEnglishProgress() {
  try {
    localStorage.setItem('antoniaEnglishProgress', JSON.stringify(englishProgress));
  } catch {
    // Practice still works if storage is unavailable.
  }
  renderEnglishProgress();
}

function renderEnglishProgress() {
  els.stars.textContent = String(englishProgress.stars);
  els.sessions.textContent = String(englishProgress.sessions);
  els.bestStreak.textContent = String(englishProgress.bestStreak);
}

function showEnglishView(view) {
  [els.home, els.quiz, els.result].forEach(item => item.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let englishQuestionSerial = 0;
function nextEnglishQuestionId() {
  englishQuestionSerial += 1;
  return `eq-${Date.now()}-${englishQuestionSerial}`;
}

function q(prompt, display, correct, options, explanation, reading = false) {
  return { prompt, display, correct, options, explanation, reading };
}

const questionBanks = {
  vocabulary: [
    q('Which word means the first meal of the day?', '🍞🥛 Morning meal', 'breakfast', ['breakfast', 'lunch', 'dinner', 'school'], 'Breakfast is the meal you eat in the morning.'),
    q('Where can you borrow books?', '📚 A place full of books', 'library', ['library', 'kitchen', 'playground', 'shop'], 'A library is a place where people can read or borrow books.'),
    q('Who teaches a class?', '👩‍🏫', 'teacher', ['teacher', 'doctor', 'friend', 'neighbour'], 'A teacher helps students learn.'),
    q('How do you feel when you need food?', '😋 I need something to eat.', 'hungry', ['hungry', 'sleepy', 'happy', 'fast'], 'Hungry means that your body wants food.'),
    q('Where do children often play at school?', '🛝⚽', 'playground', ['playground', 'bedroom', 'bathroom', 'cafeteria'], 'A playground is an area made for playing.'),
    q('Choose the correct word.', '🐱', 'cat', ['cat', 'dog', 'bird', 'fish'], 'This animal is a cat.'),
    q('Choose the correct word.', '💧', 'water', ['water', 'milk', 'juice', 'bread'], 'This picture shows water.'),
    q('Choose the correct word.', '👧👧 Two girls in the same family', 'sister', ['sister', 'brother', 'mother', 'friend'], 'A sister is a female sibling.'),
    q('Choose the action word.', '🏃', 'run', ['run', 'read', 'sleep', 'draw'], 'Run is the action shown in the picture.'),
    q('Choose the correct word.', '👟👟', 'shoes', ['shoes', 'shirt', 'hat', 'socks'], 'These are shoes.'),
    q('Which word names the part of the day after lunch?', '☀️ 2:00 p.m.', 'afternoon', ['afternoon', 'morning', 'night', 'week'], 'Afternoon is the part of the day between midday and evening.'),
    q('Which word can describe something very pretty?', '🌈✨', 'beautiful', ['beautiful', 'small', 'noisy', 'cold'], 'Beautiful means very attractive or lovely.'),
  ],
  grammar: [
    q('Complete the sentence.', 'She ___ like apples.', "doesn't", ["doesn't", "don't", 'is', 'do'], 'With she, use doesn’t: She doesn’t like apples.'),
    q('Complete the question.', '___ he like football?', 'Does', ['Does', 'Do', 'Is', 'Are'], 'With he, use Does: Does he like football?'),
    q('Complete the question.', '___ they play tennis?', 'Do', ['Do', 'Does', 'Is', 'Has'], 'With they, use Do: Do they play tennis?'),
    q('Complete the sentence.', 'I ___ like coffee.', "don't", ["don't", "doesn't", 'not', 'isn’t'], 'With I, use don’t: I don’t like coffee.'),
    q('Complete the sentence.', 'He ___ a blue backpack.', 'has', ['has', 'have', 'is', 'do'], 'With he, use has.'),
    q('Complete the sentence.', 'They ___ two dogs.', 'have', ['have', 'has', 'does', 'are'], 'With they, use have.'),
    q('Complete the sentence.', 'She ___ happy.', 'is', ['is', 'are', 'am', 'do'], 'With she, use is.'),
    q('Complete the sentence.', 'We ___ at school.', 'are', ['are', 'is', 'am', 'does'], 'With we, use are.'),
    q('Complete the sentence.', 'I ___ swim.', 'can', ['can', 'does', 'has', 'am'], 'Can tells us about an ability: I can swim.'),
    q('Choose the correct question.', 'Ask about her pet.', 'Does she have a pet?', ['Does she have a pet?', 'Do she has a pet?', 'She does have a pet?', 'Does she has a pet?'], 'After does, use the base verb: have.'),
    q('Complete the sentence.', 'There ___ a book on the table.', 'is', ['is', 'are', 'have', 'do'], 'Use There is for one thing.'),
    q('Complete the sentence.', 'There ___ three pencils.', 'are', ['are', 'is', 'has', 'does'], 'Use There are for more than one thing.'),
  ],
  reading: [
    q('Read and answer: What pet does Mia have?', 'Mia is nine. She has a small brown dog. His name is Coco. Mia plays with Coco after school.', 'a dog', ['a dog', 'a cat', 'a bird', 'a fish'], 'The text says: She has a small brown dog.', true),
    q('Read and answer: When does Tom play football?', 'Tom likes football. He plays with his friends on Saturday morning. On Sunday, he visits his grandma.', 'Saturday morning', ['Saturday morning', 'Sunday morning', 'Monday afternoon', 'Friday night'], 'The text says he plays on Saturday morning.', true),
    q('Read and answer: What does Lucy like for breakfast?', 'Lucy gets up at seven o’clock. For breakfast, she likes milk and toast. Then she goes to school.', 'milk and toast', ['milk and toast', 'juice and rice', 'water and pasta', 'tea and soup'], 'The text says she likes milk and toast.', true),
    q('Read and answer: Where is the book?', 'The book is on the desk. The pencil is under the chair. The backpack is next to the door.', 'on the desk', ['on the desk', 'under the chair', 'next to the door', 'in the bag'], 'The first sentence says: The book is on the desk.', true),
    q('Read and answer: How many siblings does Ben have?', 'Ben has one brother and two sisters. They live in a house near the park.', 'three', ['three', 'one', 'two', 'four'], 'One brother plus two sisters makes three siblings.', true),
    q('Read and answer: Which animal can fly?', 'The penguin can swim, but it cannot fly. The parrot can fly and it can talk a little.', 'the parrot', ['the parrot', 'the penguin', 'both animals', 'neither animal'], 'The text says: The parrot can fly.', true),
    q('Read and answer: What is the weather like?', 'It is cold and rainy today. Emma wears her coat and takes an umbrella.', 'cold and rainy', ['cold and rainy', 'hot and sunny', 'warm and windy', 'snowy and hot'], 'The text says: It is cold and rainy today.', true),
    q('Read and answer: What does Leo do first after school?', 'After school, Leo does his homework. Then he rides his bike in the park.', 'he does his homework', ['he does his homework', 'he rides his bike', 'he goes to bed', 'he eats breakfast'], 'First, Leo does his homework.'),
    q('Read and answer: What colour is Sara’s bike?', 'Sara has a purple bike and a red helmet. She rides her bike with her dad on Sundays.', 'purple', ['purple', 'red', 'blue', 'green'], 'The text says: Sara has a purple bike.', true),
    q('Read and answer: Where does Max eat lunch?', 'Max goes to school at eight. At lunchtime, he eats in the school cafeteria with his friends.', 'in the school cafeteria', ['in the school cafeteria', 'at home', 'in the park', 'at the library'], 'The text says he eats in the school cafeteria.', true),
    q('Read and answer: What does Amy take to the park?', 'Amy goes to the park with her dad. She takes a ball and a bottle of water.', 'a ball and water', ['a ball and water', 'a book and milk', 'a bike and juice', 'a hat and bread'], 'The text tells us that Amy takes a ball and a bottle of water.', true),
    q('Read and answer: What time does Noah go to bed?', 'Noah brushes his teeth at eight thirty. He reads for twenty minutes and goes to bed at nine.', 'nine o’clock', ['nine o’clock', 'eight o’clock', 'eight thirty', 'ten o’clock'], 'The text says he goes to bed at nine.', true),
  ],
  conversation: [
    q('Choose the best answer.', 'Do you like pizza?', 'Yes, I do.', ['Yes, I do.', 'Yes, I am.', 'Yes, she does.', 'No, I can.'], 'A natural answer to Do you…? is Yes, I do.'),
    q('Choose the best answer.', 'Does she like cats?', "No, she doesn't.", ["No, she doesn't.", "No, she don't.", 'No, she isn’t.', 'No, I do.'], 'With Does she…?, answer No, she doesn’t.'),
    q('Choose the best answer.', 'How old are you?', "I'm nine.", ["I'm nine.", 'I have nine.', 'It is nine.', 'Yes, I am.'], 'Use I’m nine to say your age.'),
    q('Choose the best answer.', 'What is your name?', 'My name is Anna.', ['My name is Anna.', 'I am fine.', 'I like Anna.', 'It is Monday.'], 'My name is… answers the question naturally.'),
    q('Choose the best answer.', 'Can you swim?', 'Yes, I can.', ['Yes, I can.', 'Yes, I do.', 'Yes, I am.', 'Yes, she can.'], 'A natural answer to Can you…? is Yes, I can.'),
    q('Choose the best answer.', 'Where is the pencil?', 'It is on the desk.', ['It is on the desk.', 'It is blue.', 'It is Monday.', 'I like pencils.'], 'Where asks about a place.'),
    q('Choose the best answer.', 'What is your favourite colour?', 'Purple.', ['Purple.', 'Nine years old.', 'At school.', 'Yes, I do.'], 'The question asks for a colour.'),
    q('Choose the best answer.', 'How are you?', "I'm fine, thanks.", ["I'm fine, thanks.", 'I am nine.', 'I have a dog.', 'It is sunny.'], 'How are you? asks how you feel.'),
    q('Choose the best answer.', 'What time is it?', "It's three o'clock.", ["It's three o'clock.", 'It is a cat.', 'I am three.', 'On Monday.'], 'What time is it? asks for the time.'),
    q('Choose the best answer.', 'What do you do after school?', 'I do my homework.', ['I do my homework.', 'I am homework.', 'She does school.', 'Yes, I do.'], 'The question asks about an activity.'),
    q('Choose the best answer.', 'What is the weather like?', 'It is sunny.', ['It is sunny.', 'It is Tuesday.', 'I am sunny.', 'At school.'], 'The question asks about the weather.'),
    q('Choose the best answer.', 'Who is your teacher?', 'Ms Brown.', ['Ms Brown.', 'In the classroom.', 'At eight.', 'Blue.'], 'Who asks for a person.'),
  ],
  writing: [
    q('Choose the correct sentence.', 'A girl has a dog.', 'She has a dog.', ['She has a dog.', 'She have a dog.', 'Has she a dog.', 'She dog has.'], 'With she, use has.'),
    q('Choose the correct sentence.', 'A boy does not like carrots.', "He doesn't like carrots.", ["He doesn't like carrots.", "He don't likes carrots.", 'He not like carrots.', "He doesn't likes carrots."], 'After doesn’t, use like without -s.'),
    q('Choose the correct question.', 'Ask a friend about ice cream.', 'Do you like ice cream?', ['Do you like ice cream?', 'Does you like ice cream?', 'You do like ice cream?', 'Do you likes ice cream?'], 'With you, use Do and the base verb like.'),
    q('Choose the correct sentence.', 'Two books are on the table.', 'There are two books.', ['There are two books.', 'There is two books.', 'There two books are.', 'They are two book.'], 'Use There are for more than one thing.'),
    q('Choose the correct sentence.', 'A girl can dance.', 'She can dance.', ['She can dance.', 'She can dances.', 'She does can dance.', 'Can she dances.'], 'After can, use the base verb: dance.'),
    q('Choose the sentence with correct punctuation.', 'hello my name is leo', 'Hello, my name is Leo.', ['Hello, my name is Leo.', 'hello my name is leo', 'Hello my name is leo', 'hello, My name is Leo.'], 'Start with a capital letter, use a comma, and finish with a period.'),
    q('Choose the correct sentence.', 'One pencil is in the bag.', 'There is a pencil in the bag.', ['There is a pencil in the bag.', 'There are a pencil in the bag.', 'There pencil is in bag.', 'A pencil there are.'], 'Use There is for one thing.'),
    q('Choose the correct sentence.', 'Two children own bikes.', 'They have bikes.', ['They have bikes.', 'They has bikes.', 'They does bikes.', 'They having bikes.'], 'With they, use have.'),
    q('Choose the correct sentence.', 'A girl likes music.', 'She likes music.', ['She likes music.', 'She like music.', 'She does likes music.', 'She liking music.'], 'In an affirmative sentence with she, add -s to the verb.'),
    q('Choose the correct question.', 'Ask about his favourite food.', 'What is his favourite food?', ['What is his favourite food?', 'What his favourite food is?', 'Does his favourite food?', 'What are his favourite food?'], 'Use What is…? to ask for one favourite thing.'),
    q('Choose the correct sentence.', 'A boy is not tired.', "He isn't tired.", ["He isn't tired.", "He don't tired.", 'He not is tired.', "He doesn't tired."], 'Use isn’t with he when the verb is be.'),
    q('Choose the correct sentence.', 'The children are at school.', 'They are at school.', ['They are at school.', 'They is at school.', 'They am at school.', 'They does at school.'], 'With they, use are.'),
  ],
};

questionBanks.review = [
  questionBanks.vocabulary[0], questionBanks.vocabulary[5],
  questionBanks.grammar[0], questionBanks.grammar[1], questionBanks.grammar[9],
  questionBanks.reading[0], questionBanks.reading[6],
  questionBanks.conversation[0], questionBanks.conversation[4],
  questionBanks.writing[0], questionBanks.writing[5], questionBanks.writing[8],
];

function topicByKey(key) {
  return englishTopics.find(topic => topic.key === key) || englishTopics[0];
}

function makeQuestion(item) {
  return {
    ...item,
    id: nextEnglishQuestionId(),
    correct: String(item.correct),
    options: shuffle([...new Set(item.options.map(String))]),
  };
}

function buildEnglishTopics() {
  els.grid.innerHTML = '';
  englishTopics.forEach((topic, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'english-topic-card topic-active';
    button.dataset.topic = topic.key;
    button.setAttribute('aria-label', `Open ${topic.title}`);
    button.innerHTML = `
      <span class="english-topic-number">${index + 1}</span>
      <span class="english-topic-icon" aria-hidden="true">${topic.icon}</span>
      <span class="english-topic-copy"><strong>${topic.title}</strong><small>${topic.subtitle}</small></span>
      <span class="english-topic-status">Practice →</span>
    `;
    button.addEventListener('click', () => startEnglishSession(topic.key));
    els.grid.appendChild(button);
  });
}

function startEnglishSession(topicKey) {
  const topic = topicByKey(topicKey);
  englishState.topic = topic.key;
  englishState.questionIndex = 0;
  englishState.currentQuestionId = null;
  englishState.score = 0;
  englishState.streak = 0;
  englishState.attempts = 0;
  englishState.answered = false;
  englishState.processing = false;
  englishState.questions = shuffle(questionBanks[topic.key]).slice(0, ENGLISH_SESSION_LENGTH).map(makeQuestion);
  els.modeLabel.textContent = topic.title;
  showEnglishView(els.quiz);
  renderEnglishQuestion();
}

function currentEnglishQuestion() {
  return englishState.questions[englishState.questionIndex] || null;
}

function setEnglishFeedback(kind, title, body, answerHint = '') {
  els.feedback.className = `feedback ${kind}`;
  els.feedback.innerHTML = `<strong>${title}</strong><p>${body}</p>${answerHint ? `<p class="english-feedback-answer">${answerHint}</p>` : ''}`;
}

function renderEnglishQuestion() {
  const current = currentEnglishQuestion();
  if (!current) {
    finishEnglishSession();
    return;
  }

  englishState.currentQuestionId = current.id;
  englishState.attempts = 0;
  englishState.answered = false;
  englishState.processing = false;
  els.counter.textContent = `${englishState.questionIndex + 1} / ${ENGLISH_SESSION_LENGTH}`;
  els.prompt.textContent = current.prompt;
  els.question.textContent = current.display;
  els.question.classList.toggle('reading-text', Boolean(current.reading));
  els.feedback.className = 'feedback';
  els.feedback.innerHTML = '';
  els.next.classList.add('hidden');
  els.answers.innerHTML = '';
  els.streak.textContent = String(englishState.streak);

  current.options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    button.textContent = option;
    button.dataset.value = option;
    button.dataset.questionId = current.id;
    button.addEventListener('click', () => answerEnglishQuestion(current.id, option, button));
    els.answers.appendChild(button);
  });
}

function disableEnglishAnswers() {
  els.answers.querySelectorAll('button').forEach(button => { button.disabled = true; });
}

function revealEnglishNext() {
  els.next.textContent = englishState.questionIndex === ENGLISH_SESSION_LENGTH - 1 ? 'See results 🌟' : 'Next →';
  els.next.classList.remove('hidden');
}

function answerEnglishQuestion(questionId, value, selectedButton) {
  if (englishState.processing || englishState.answered || selectedButton.disabled) return;
  const current = currentEnglishQuestion();
  if (!current || current.id !== questionId || englishState.currentQuestionId !== questionId) return;

  englishState.processing = true;
  const correct = String(value) === current.correct;

  if (correct) {
    englishState.answered = true;
    englishState.score += 1;
    englishState.streak += 1;
    englishProgress.stars += 1;
    englishProgress.bestStreak = Math.max(englishProgress.bestStreak, englishState.streak);
    saveEnglishProgress();
    selectedButton.classList.add('correct');
    disableEnglishAnswers();
    const title = englishState.attempts === 0 ? '✨ Correct!' : '🌟 Nice recovery!';
    setEnglishFeedback('success', title, current.explanation);
    els.streak.textContent = String(englishState.streak);
    revealEnglishNext();
    englishState.processing = false;
    return;
  }

  selectedButton.classList.add('wrong');
  selectedButton.disabled = true;
  englishState.streak = 0;
  els.streak.textContent = '0';

  if (englishState.attempts === 0) {
    englishState.attempts = 1;
    setEnglishFeedback('hint', '💡 Try once more', 'Look carefully at the sentence, picture, or text.', `Look for: ${current.correct}`);
    englishState.processing = false;
    return;
  }

  englishState.answered = true;
  disableEnglishAnswers();
  setEnglishFeedback('gentle', '🌱 Now you know', `Answer: ${current.correct}. ${current.explanation}`);
  revealEnglishNext();
  englishState.processing = false;
}

function finishEnglishSession() {
  const topic = topicByKey(englishState.topic);
  englishProgress.sessions += 1;
  englishProgress.byTopic[topic.key] = (Number(englishProgress.byTopic[topic.key]) || 0) + 1;
  saveEnglishProgress();

  els.finalScore.textContent = String(englishState.score);
  if (englishState.score >= 9) {
    els.resultEmoji.textContent = '🏆';
    els.resultTitle.textContent = 'Amazing work!';
    els.resultText.textContent = `You got ${englishState.score} out of ${ENGLISH_SESSION_LENGTH}. Excellent English!`;
  } else if (englishState.score >= 7) {
    els.resultEmoji.textContent = '🌟';
    els.resultTitle.textContent = 'Great job!';
    els.resultText.textContent = `You got ${englishState.score} out of ${ENGLISH_SESSION_LENGTH}. Keep going!`;
  } else {
    els.resultEmoji.textContent = '🌱';
    els.resultTitle.textContent = 'Good practice!';
    els.resultText.textContent = `You got ${englishState.score} out of ${ENGLISH_SESSION_LENGTH}. Every round helps you improve.`;
  }
  showEnglishView(els.result);
}

els.next.addEventListener('click', () => {
  if (!englishState.answered) return;
  englishState.questionIndex += 1;
  renderEnglishQuestion();
});

els.back.addEventListener('click', () => showEnglishView(els.home));
els.again.addEventListener('click', () => startEnglishSession(englishState.topic));
els.homeButton.addEventListener('click', () => showEnglishView(els.home));

assertRequiredElements();
buildEnglishTopics();
renderEnglishProgress();
showEnglishView(els.home);

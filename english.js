'use strict';

const ENGLISH_APP_VERSION = '14.0.0';
const ENGLISH_SESSION_LENGTH = 10;

const englishState = {
  topic: 'starter',
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
  { key: 'starter', icon: '👋', title: 'Starter', subtitle: 'Personal info, clothes, colours, days & numbers' },
  { key: 'unit1', icon: '⚽', title: 'Unit 1 · Sports', subtitle: 'Sports, places and Do you…?' },
  { key: 'unit2', icon: '🦚', title: 'Unit 2 · Animals', subtitle: 'Animals, body parts and has got' },
  { key: 'unit3', icon: '💻', title: 'Unit 3 · Technology', subtitle: 'Digital activities and can / can’t' },
  { key: 'unit4', icon: '🍓', title: 'Unit 4 · Food', subtitle: 'Food, likes and do / does' },
  { key: 'unit5', icon: '⏰', title: 'Unit 5 · Routines', subtitle: 'Daily routines and telling the time' },
  { key: 'unit6', icon: '🏖️', title: 'Unit 6 · Beach', subtitle: 'Beach words and present continuous' },
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

function q(prompt, display, correct, options, explanation, reading = false, hint = '') {
  return { prompt, display, correct, options, explanation, reading, hint };
}

const questionBanks = {
  starter: [
    q('Choose the correct answer.', 'What’s your name?', 'My name is Antonia.', ['My name is Antonia.', 'I’m nine years old.', 'I live in Chile.', 'It’s Monday.'], 'Use “My name is…” to answer a question about your name.', false, 'The question asks WHO you are.'),
    q('Choose the correct answer.', 'How old are you?', 'I’m nine.', ['I’m nine.', 'My name is nine.', 'I have purple.', 'On Tuesday.'], 'Use “I’m…” to say your age.', false, 'The question asks about AGE.'),
    q('Choose the correct answer.', 'Where do you live?', 'I live in Chile.', ['I live in Chile.', 'I’m wearing jeans.', 'I’m nine.', 'My name is Antonia.'], '“Where” asks about a place.', false, 'Think about a PLACE.'),
    q('Choose the correct question.', 'You want to know the letters in a name.', 'How do you spell your name?', ['How do you spell your name?', 'How old are you?', 'What colour is it?', 'Where is Monday?'], 'Use “How do you spell…?” to ask for the letters in a word or name.', false, 'Think about saying letters one by one.'),
    q('Choose the correct word.', '👕 A blue piece of clothing for your upper body', 'T-shirt', ['T-shirt', 'jeans', 'shoes', 'socks'], 'A T-shirt is worn on your upper body.', false, 'It starts with T.'),
    q('Choose the correct colour.', '🟣', 'purple', ['purple', 'orange', 'green', 'yellow'], 'The colour shown is purple.', false, 'Think of the colour of grapes.'),
    q('What comes after Monday?', 'Monday → ___', 'Tuesday', ['Tuesday', 'Sunday', 'Friday', 'Saturday'], 'Tuesday comes after Monday.', false, 'Think of the school week.'),
    q('Choose the number word.', '44', 'forty-four', ['forty-four', 'twenty-four', 'sixty-four', 'ninety-four'], '44 is written “forty-four”.', false, 'It is 40 + 4.'),
    q('Choose the correct family word.', 'My mum’s son is my…', 'brother', ['brother', 'sister', 'aunt', 'grandma'], 'A male sibling is your brother.', false, 'Boy + same parents.'),
    q('Complete the sentence.', 'I’m wearing blue ___. 👖', 'jeans', ['jeans', 'shirt', 'jumper', 'hat'], 'Jeans are trousers, usually made of denim.', false, 'Look at the trouser emoji.'),
    q('Choose the correct letter.', 'Which letter comes after M?', 'N', ['N', 'L', 'O', 'P'], 'N comes after M in the alphabet.', false, 'Say the alphabet around M.'),
    q('Choose the correct sentence.', 'Favourite colour: pink', 'My favourite colour is pink.', ['My favourite colour is pink.', 'I favourite pink colour.', 'My colour favourite pink.', 'Pink is I favourite.'], 'This is the natural sentence pattern for favourites.', false, 'Start with “My favourite…”'),
  ],

  unit1: [
    q('Choose the correct sport.', '🥋', 'do judo', ['do judo', 'play tennis', 'go swimming', 'play baseball'], 'We say “do judo”.', false, 'Judo is a martial art.'),
    q('Choose the correct sport.', '🏸', 'play badminton', ['play badminton', 'do gymnastics', 'go running', 'play hockey'], 'We say “play badminton”.', false, 'It uses a racket and shuttlecock.'),
    q('Where do people swim?', '🏊', 'swimming pool', ['swimming pool', 'football pitch', 'running track', 'basketball court'], 'People swim in a swimming pool.', false, 'It is full of water.'),
    q('Where do people play football?', '⚽', 'football pitch', ['football pitch', 'swimming pool', 'running track', 'sports bag'], 'Football is played on a football pitch.', false, 'It is a large grass field.'),
    q('Where do people run races?', '🏃‍♀️🏃', 'running track', ['running track', 'basketball court', 'swimming pool', 'football pitch'], 'A running track is made for running races.', false, 'Think of an oval track.'),
    q('Complete the sentence.', 'I ___ football on Friday.', 'play', ['play', 'do', 'go', 'plays'], 'Use “play” with football.', false, 'Football uses PLAY.'),
    q('Complete the sentence.', 'We ___ judo on Wednesday.', 'do', ['do', 'play', 'go', 'does'], 'Use “do” with judo.', false, 'Judo uses DO.'),
    q('Choose the correct negative sentence.', 'We / baseball / negative', 'We don’t play baseball.', ['We don’t play baseball.', 'We doesn’t play baseball.', 'We don’t plays baseball.', 'We not play baseball.'], 'With “we”, use “don’t” + base verb.', false, 'WE goes with DON’T.'),
    q('Complete the question.', '___ you play hockey?', 'Do', ['Do', 'Does', 'Are', 'Is'], 'With “you”, use “Do”.', false, 'YOU goes with DO.'),
    q('Choose the best answer.', 'Do you go swimming?', 'Yes, I do.', ['Yes, I do.', 'Yes, I am.', 'Yes, she does.', 'Yes, I can do.'], 'Answer “Do you…?” with “Yes, I do” or “No, I don’t”.', false, 'Repeat the helper verb from the question.'),
    q('Choose the correct place.', '🏀 A place for basketball', 'basketball court', ['basketball court', 'football pitch', 'running track', 'swimming pool'], 'Basketball is played on a court.', false, 'Basketball uses a COURT.'),
    q('Choose the correct sentence.', 'Saturday + tennis', 'I play tennis on Saturday.', ['I play tennis on Saturday.', 'I do tennis in Saturday.', 'I plays tennis at Saturday.', 'I play tennis Saturday on.'], 'Use “play tennis” and “on” before a day.', false, 'Use ON before days.'),
  ],

  unit2: [
    q('Choose the animal.', '🦚', 'peacock', ['peacock', 'snake', 'leopard', 'raccoon'], 'A peacock is famous for its colourful feathers.', false, 'It has a large colourful tail.'),
    q('Choose the animal.', '🐍', 'snake', ['snake', 'tortoise', 'peacock', 'leopard'], 'This animal is a snake.', false, 'Long body, no legs.'),
    q('What covers many birds?', '🪶', 'feathers', ['feathers', 'fur', 'scales', 'shell'], 'Birds have feathers.', false, 'Birds use them for flight and warmth.'),
    q('What covers a snake’s body?', '🐍', 'scales', ['scales', 'fur', 'feathers', 'hair'], 'Snakes have scales.', false, 'Think of reptile skin.'),
    q('What can protect a tortoise?', '🐢', 'shell', ['shell', 'fur', 'feathers', 'wings'], 'A tortoise has a hard shell.', false, 'It is a hard protective covering.'),
    q('Complete the sentence.', 'The raccoon has got a long ___.', 'tail', ['tail', 'shell', 'beak', 'fin'], 'A tail is at the back of an animal’s body.', false, 'Think of the part behind the animal.'),
    q('Choose the correct question.', 'Ask about feathers.', 'Has it got feathers?', ['Has it got feathers?', 'Have it feathers?', 'Does it got feathers?', 'Is it got feathers?'], 'Use “Has it got…?” to ask about one animal.', false, 'One animal → HAS it got…?'),
    q('Choose the best answer.', 'Has the peacock got feathers?', 'Yes, it has.', ['Yes, it has.', 'Yes, it does.', 'Yes, it is.', 'Yes, it have.'], 'Answer “Has it got…?” with “Yes, it has” or “No, it hasn’t”.', false, 'Repeat HAS in the answer.'),
    q('Choose the correct sentence.', 'Snake + no fur', 'It hasn’t got fur.', ['It hasn’t got fur.', 'It don’t got fur.', 'It hasn’t fur got.', 'It not has fur.'], 'Use “hasn’t got” for a negative with one animal.', false, 'Negative of HAS GOT = HASN’T GOT.'),
    q('Choose the correct sentence.', 'Leopard + fur', 'It has got fur.', ['It has got fur.', 'It have got fur.', 'It got has fur.', 'It does got fur.'], 'Use “has got” with “it”.', false, 'IT goes with HAS GOT.'),
    q('Which body part helps animals bite?', '🦷', 'teeth', ['teeth', 'tail', 'fur', 'feathers'], 'Animals use teeth to bite and chew.', false, 'They are inside the mouth.'),
    q('Read and answer.', 'A colourful bird has feathers and a long tail. It can open its tail like a fan.', 'peacock', ['peacock', 'snake', 'tortoise', 'leopard'], 'A peacock has colourful feathers and a large tail.', true, 'Look for the colourful bird clue.'),
  ],

  unit3: [
    q('Choose the activity.', '📸', 'take a photo', ['take a photo', 'write a story', 'play chess', 'read a book'], 'We “take a photo” with a camera or phone.', false, 'Think of a camera.'),
    q('Choose the activity.', '🎧🎵', 'listen to music', ['listen to music', 'chat to friends', 'do my homework', 'learn a language'], 'Headphones are often used to listen to music.', false, 'You use your ears.'),
    q('Choose the activity.', '🎮', 'play a video game', ['play a video game', 'take a photo', 'write a story', 'read a book'], 'A controller is used to play a video game.', false, 'Think of a game controller.'),
    q('Choose the activity.', '💬👫', 'chat to friends', ['chat to friends', 'learn a language', 'play chess', 'do my homework'], 'Chat means talk or message with friends.', false, 'Think messages and conversation.'),
    q('Choose the activity.', '📚✏️ School task', 'do my homework', ['do my homework', 'watch TV', 'play a video game', 'take a photo'], 'Homework is school work done outside class.', false, 'School task after class.'),
    q('Complete the sentence.', 'I ___ take a photo with this tablet.', 'can', ['can', 'does', 'has', 'am'], 'Use “can” to talk about an ability.', false, 'Ability → CAN.'),
    q('Choose the correct negative sentence.', 'This old camera / video calls / negative', 'It can’t make video calls.', ['It can’t make video calls.', 'It doesn’t can make video calls.', 'It can’t makes video calls.', 'It no can video calls.'], 'Use “can’t” + base verb.', false, 'CAN’T is followed by the base verb.'),
    q('Complete the question.', '___ you play chess online?', 'Can', ['Can', 'Do can', 'Are', 'Has'], 'Use “Can you…?” to ask about an ability.', false, 'Question about ability.'),
    q('Choose the best answer.', 'Can you learn a language online?', 'Yes, I can.', ['Yes, I can.', 'Yes, I do.', 'Yes, I am.', 'Yes, I has.'], 'Answer “Can you…?” with “Yes, I can” or “No, I can’t”.', false, 'Repeat CAN.'),
    q('Choose the correct sentence.', 'She / write a story / ability', 'She can write a story.', ['She can write a story.', 'She can writes a story.', 'She does can write a story.', 'She can writing a story.'], 'After “can”, use the base verb.', false, 'CAN + WRITE, not writes.'),
    q('Which activity uses a book?', '📖', 'read a book', ['read a book', 'take a photo', 'chat to friends', 'watch TV'], 'Reading a book uses printed or digital text.', false, 'The picture is a book.'),
    q('Read and answer.', 'Leo uses his tablet to practise English words and hear their pronunciation.', 'learn a language', ['learn a language', 'play chess', 'take a photo', 'watch TV'], 'Practising English is learning a language.', true, 'English is a language.'),
  ],

  unit4: [
    q('Choose the food.', '🐟 Food from a can or fish counter', 'tuna', ['tuna', 'honey', 'lentils', 'yoghurt'], 'Tuna is a type of fish.', false, 'It comes from the sea.'),
    q('Choose the food.', '🍯', 'honey', ['honey', 'olives', 'lentils', 'tuna'], 'Honey is made by bees.', false, 'Bees make it.'),
    q('Choose the food.', '🫒', 'olives', ['olives', 'nuts', 'yoghurt', 'chicken'], 'These are olives.', false, 'Small green or black fruit.'),
    q('Choose the food.', '🥜', 'nuts', ['nuts', 'fruit', 'lentils', 'tuna'], 'Peanuts, almonds and walnuts are nuts.', false, 'Think peanuts and almonds.'),
    q('Complete the sentence.', 'I ___ pasta.', 'like', ['like', 'likes', 'does', 'am'], 'With “I”, use “like”.', false, 'I + LIKE.'),
    q('Complete the sentence.', 'She ___ fruit.', 'likes', ['likes', 'like', 'do', 'don’t'], 'In an affirmative sentence with “she”, use “likes”.', false, 'SHE adds -S.'),
    q('Complete the sentence.', 'He ___ like tuna.', 'doesn’t', ['doesn’t', 'don’t', 'isn’t', 'hasn’t'], 'With “he”, use “doesn’t” + base verb.', false, 'HE goes with DOESN’T.'),
    q('Complete the sentence.', 'I ___ like lentils.', 'don’t', ['don’t', 'doesn’t', 'isn’t', 'can’t'], 'With “I”, use “don’t”.', false, 'I goes with DON’T.'),
    q('Complete the question.', '___ she like chocolate?', 'Does', ['Does', 'Do', 'Is', 'Has'], 'With “she”, use “Does”.', false, 'SHE → DOES.'),
    q('Complete the question.', '___ you like yoghurt?', 'Do', ['Do', 'Does', 'Are', 'Is'], 'With “you”, use “Do”.', false, 'YOU → DO.'),
    q('Choose the best answer.', 'Does he like nuts?', 'Yes, he does.', ['Yes, he does.', 'Yes, he do.', 'Yes, he is.', 'Yes, he likes does.'], 'Answer a “Does he…?” question with “Yes, he does”.', false, 'Repeat DOES.'),
    q('Choose the correct sentence.', 'Ana likes chicken but not olives.', 'She likes chicken, but she doesn’t like olives.', ['She likes chicken, but she doesn’t like olives.', 'She like chicken, but she don’t like olives.', 'She likes chicken, but she doesn’t likes olives.', 'She does like chicken, but no olives.'], 'Use “likes” in the affirmative and “doesn’t like” in the negative.', true, 'Positive SHE = likes; negative SHE = doesn’t like.'),
  ],

  unit5: [
    q('Choose the routine.', '⏰🛏️➡️🙂', 'get up', ['get up', 'go to bed', 'have a shower', 'go home'], '“Get up” means leave your bed after sleeping.', false, 'It happens in the morning.'),
    q('Choose the routine.', '🪥😁', 'clean your teeth', ['clean your teeth', 'get dressed', 'feed the dog', 'have breakfast'], 'You clean your teeth with a toothbrush.', false, 'Think toothbrush.'),
    q('Choose the routine.', '🍞🥛 7:30 a.m.', 'have breakfast', ['have breakfast', 'go to bed', 'go home', 'have a shower'], 'Breakfast is the morning meal.', false, 'Morning meal.'),
    q('Choose the routine.', '🐶🥣', 'feed the dog', ['feed the dog', 'play with friends', 'get dressed', 'go to school'], 'To feed the dog means give the dog food.', false, 'The dog is getting food.'),
    q('Choose the routine.', '🚿', 'have a shower', ['have a shower', 'go home', 'get up', 'have breakfast'], 'You have a shower to wash your body.', false, 'Water + bathroom.'),
    q('Complete the sentence.', 'He ___ up at seven o’clock.', 'gets', ['gets', 'get', 'getting', 'does get up'], 'With “he” in the present simple, “get” becomes “gets”.', false, 'HE usually adds -S.'),
    q('Complete the sentence.', 'She ___ home at two o’clock.', 'goes', ['goes', 'go', 'going', 'gos'], 'With “she”, “go” becomes “goes”.', false, 'GO changes to GOES.'),
    q('Complete the sentence.', 'He ___ breakfast in the morning.', 'has', ['has', 'have', 'haves', 'is'], 'With “he”, use “has”.', false, 'HE + HAS.'),
    q('Choose the time.', '🕣', 'half past eight', ['half past eight', 'eight o’clock', 'half past seven', 'quarter past eight'], '8:30 is “half past eight”.', false, '30 minutes after eight.'),
    q('Choose the correct sentence.', '9:30 p.m. + bedtime', 'She goes to bed at half past nine.', ['She goes to bed at half past nine.', 'She go to bed at half nine past.', 'She goes bed in nine thirty.', 'She going to bed at nine half.'], 'Use “goes to bed” and “at” before a clock time.', false, 'SHE → GOES; clock time → AT.'),
    q('Read and answer.', 'Tom gets up at seven. He has breakfast at half past seven and goes to school at eight.', 'half past seven', ['half past seven', 'seven o’clock', 'eight o’clock', 'half past eight'], 'The text says Tom has breakfast at half past seven.', true, 'Look for “has breakfast”.'),
    q('Choose the correct order.', 'Morning routine', 'get up → get dressed → have breakfast → go to school', ['get up → get dressed → have breakfast → go to school', 'go to bed → have breakfast → get up → go home', 'go home → get dressed → go to school → get up', 'have breakfast → go to bed → go home → get up'], 'This is a natural morning sequence.', true, 'Start by leaving the bed.'),
  ],

  unit6: [
    q('Choose the beach item.', '🕶️', 'sunglasses', ['sunglasses', 'goggles', 'beach towel', 'sun cream'], 'Sunglasses protect your eyes from bright sunlight.', false, 'You wear them over your eyes.'),
    q('Choose the beach item.', '🧴☀️', 'sun cream', ['sun cream', 'beach umbrella', 'goggles', 'shells'], 'Sun cream helps protect skin from the sun.', false, 'It goes on your skin.'),
    q('Choose the activity.', '🏰 made of sand', 'make a sandcastle', ['make a sandcastle', 'look for shells', 'play bat and ball', 'wear goggles'], 'A sandcastle is built with sand.', false, 'Castle + sand.'),
    q('Choose the activity.', '🐚🔎', 'look for shells', ['look for shells', 'put on sun cream', 'make a sandcastle', 'wear swimming shorts'], 'People can look for shells on the beach.', false, 'The picture shows shells and searching.'),
    q('Choose the correct item.', 'A large cloth you lie on at the beach', 'beach towel', ['beach towel', 'beach umbrella', 'swimming costume', 'goggles'], 'A beach towel is used for drying off or lying on the sand.', false, 'It is a towel.'),
    q('Complete the sentence.', 'She ___ wearing sunglasses.', 'is', ['is', 'are', 'am', 'does'], 'With “she” in the present continuous, use “is”.', false, 'SHE → IS.'),
    q('Complete the sentence.', 'They ___ looking for shells.', 'are', ['are', 'is', 'am', 'does'], 'With “they”, use “are”.', false, 'THEY → ARE.'),
    q('Choose the correct sentence.', 'Boy + sandcastle now', 'He is making a sandcastle.', ['He is making a sandcastle.', 'He making a sandcastle.', 'He makes a sandcastle now.', 'He are making a sandcastle.'], 'Use “is + verb-ing” for an action happening now.', false, 'HE → IS + ING.'),
    q('Choose the correct question.', 'Ask about a girl putting on sun cream now.', 'Is she putting on sun cream?', ['Is she putting on sun cream?', 'Does she putting on sun cream?', 'Are she put on sun cream?', 'She is putting on sun cream?'], 'Use “Is she + verb-ing…?”', false, 'Start with IS SHE.'),
    q('Choose the best answer.', 'Are they eating ice cream?', 'Yes, they are.', ['Yes, they are.', 'Yes, they do.', 'Yes, they is.', 'Yes, they eating.'], 'Answer “Are they…?” with “Yes, they are” or “No, they aren’t”.', false, 'Repeat ARE.'),
    q('Choose the correct negative sentence.', 'He / wear a hat / negative now', 'He isn’t wearing a hat.', ['He isn’t wearing a hat.', 'He doesn’t wearing a hat.', 'He aren’t wearing a hat.', 'He not wears a hat.'], 'Use “isn’t + verb-ing” with “he”.', false, 'HE → ISN’T + ING.'),
    q('Read and answer.', 'Mia is on the beach. She is wearing sunglasses and she is looking for shells.', 'She is looking for shells.', ['She is looking for shells.', 'She is playing hockey.', 'She is doing homework.', 'She is feeding the dog.'], 'The text says Mia is looking for shells.', true, 'Look at the second action.'),
  ],
};

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
    const completed = Number(englishProgress.byTopic[topic.key]) || 0;
    button.innerHTML = `
      <span class="english-topic-number">${index + 1}</span>
      <span class="english-topic-icon" aria-hidden="true">${topic.icon}</span>
      <span class="english-topic-copy"><strong>${topic.title}</strong><small>${topic.subtitle}</small></span>
      <span class="english-topic-status">${completed ? `✓ ${completed} round${completed === 1 ? '' : 's'}` : 'Practice →'}</span>
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
  const bank = questionBanks[topic.key] || questionBanks.starter;
  englishState.questions = shuffle(bank).slice(0, ENGLISH_SESSION_LENGTH).map(makeQuestion);
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
    const hint = current.hint || 'Look carefully at the sentence, picture, or text.';
    setEnglishFeedback('hint', '💡 Try once more', hint);
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
  buildEnglishTopics();

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

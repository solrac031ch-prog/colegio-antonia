'use strict';

const SCIENCE_VERSION = '15.0.0';
const SESSION_LENGTH = 10;

const state = { topic: 'living', questionIndex: 0, currentQuestionId: null, score: 0, streak: 0, attempts: 0, answered: false, processing: false, questions: [] };
const topics = [
  { key: 'living', icon: '🌱', title: 'Seres vivos', subtitle: 'Plantas, animales y necesidades' },
  { key: 'body', icon: '🫀', title: 'Cuerpo y salud', subtitle: 'Órganos, sentidos y hábitos' },
  { key: 'matter', icon: '🧊', title: 'Materiales y materia', subtitle: 'Sólidos, líquidos y propiedades' },
  { key: 'forces', icon: '🧲', title: 'Fuerzas y movimiento', subtitle: 'Empujar, tirar y movimiento' },
  { key: 'earth', icon: '🌍', title: 'Tierra y ambiente', subtitle: 'Agua, aire, clima y cuidado' },
  { key: 'review', icon: '⭐', title: 'Repaso mixto', subtitle: 'Un poco de todo' },
];

const els = {
  home: document.querySelector('#scienceHome'), quiz: document.querySelector('#scienceQuiz'), result: document.querySelector('#scienceResult'),
  grid: document.querySelector('#scienceTopicGrid'), stars: document.querySelector('#scienceStars'), sessions: document.querySelector('#scienceSessions'),
  bestStreak: document.querySelector('#scienceBestStreak'), back: document.querySelector('#scienceBackButton'), modeLabel: document.querySelector('#scienceModeLabel'),
  counter: document.querySelector('#scienceCounter'), prompt: document.querySelector('#sciencePrompt'), question: document.querySelector('#scienceQuestion'),
  answers: document.querySelector('#scienceAnswers'), feedback: document.querySelector('#scienceFeedback'), next: document.querySelector('#scienceNextButton'),
  streak: document.querySelector('#scienceStreak'), resultEmoji: document.querySelector('#scienceResultEmoji'), resultTitle: document.querySelector('#scienceResultTitle'),
  resultText: document.querySelector('#scienceResultText'), finalScore: document.querySelector('#scienceFinalScore'), again: document.querySelector('#scienceAgainButton'),
  homeButton: document.querySelector('#scienceHomeButton'),
};

function assertElements() { const missing = Object.entries(els).filter(([,v]) => !v).map(([k]) => k); if (missing.length) throw new Error(`Faltan elementos de Ciencias: ${missing.join(', ')}`); }
function loadProgress() { try { const value = JSON.parse(localStorage.getItem('antoniaScienceProgress') || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; } }
const progress = loadProgress();
progress.stars = Number.isFinite(progress.stars) ? progress.stars : 0;
progress.sessions = Number.isFinite(progress.sessions) ? progress.sessions : 0;
progress.bestStreak = Number.isFinite(progress.bestStreak) ? progress.bestStreak : 0;
progress.byTopic = progress.byTopic && typeof progress.byTopic === 'object' ? progress.byTopic : {};
function saveProgress() { try { localStorage.setItem('antoniaScienceProgress', JSON.stringify(progress)); } catch {} renderProgress(); }
function renderProgress() { els.stars.textContent = String(progress.stars); els.sessions.textContent = String(progress.sessions); els.bestStreak.textContent = String(progress.bestStreak); }
function show(view) { [els.home, els.quiz, els.result].forEach(v => v.classList.remove('active')); view.classList.add('active'); window.scrollTo(0,0); }
function shuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
let serial=0;
function q(prompt, display, correct, options, explanation, reading=false) {
  const c=String(correct); const unique=[]; [c,...options.map(String)].forEach(v=>{if(!unique.includes(v)) unique.push(v);});
  if(!prompt||!display||!c||unique.length<2) throw new Error('Pregunta de Ciencias inválida');
  return { id:`sci-${Date.now()}-${++serial}`, prompt, display, correct:c, options:shuffle(unique), explanation, reading };
}

const banks = {
  living: [
    q('¿Qué necesitan las plantas para vivir?', 'Una planta sana', 'agua, luz y aire', ['agua, luz y aire','solo piedras','solo oscuridad','plástico'], 'Las plantas necesitan agua, luz y aire para crecer.'),
    q('¿Qué parte de la planta absorbe agua del suelo?', '🌱', 'la raíz', ['la raíz','la flor','el fruto','la hoja'], 'La raíz absorbe agua y sales minerales del suelo.'),
    q('¿Qué parte de la planta suele captar más luz?', '🍃', 'las hojas', ['las hojas','las raíces','las semillas','el suelo'], 'Las hojas reciben luz y ayudan a fabricar alimento.'),
    q('¿Cuál de estos es un ser vivo?', 'Elige uno', 'un árbol', ['un árbol','una roca','una cuchara','una nube'], 'Un árbol nace, crece y necesita recursos para vivir.'),
    q('¿Qué tienen en común los animales y las plantas?', 'Seres vivos', 'necesitan agua', ['necesitan agua','fabrican plástico','no cambian nunca','son objetos'], 'Todos los seres vivos necesitan agua.'),
    q('¿Cuál animal tiene columna vertebral?', 'Elige uno', 'perro', ['perro','mariposa','caracol','hormiga'], 'El perro es un vertebrado porque tiene columna vertebral.'),
    q('¿Qué animal comienza su vida como renacuajo?', 'Ciclo de vida', 'rana', ['rana','gato','águila','caballo'], 'La rana pasa por una etapa de renacuajo.'),
    q('¿Para qué sirve una semilla?', '🌰', 'puede originar una nueva planta', ['puede originar una nueva planta','sirve para respirar','mueve las raíces','produce sonido'], 'Una semilla puede germinar y dar origen a una nueva planta.'),
    q('¿Cuál es una adaptación útil para un pez?', '🐟', 'aletas para nadar', ['aletas para nadar','alas con plumas','patas de caballo','pelaje grueso siempre'], 'Las aletas permiten al pez moverse en el agua.'),
    q('¿Qué debe hacer un animal para obtener energía?', 'Necesidades de los animales', 'alimentarse', ['alimentarse','convertirse en roca','dejar de respirar','vivir sin agua'], 'Los animales obtienen energía de los alimentos.'),
  ],
  body: [
    q('¿Qué órgano bombea la sangre?', '❤️', 'el corazón', ['el corazón','el estómago','la piel','el oído'], 'El corazón impulsa la sangre por el cuerpo.'),
    q('¿Qué órgano usamos principalmente para respirar?', '🫁', 'los pulmones', ['los pulmones','los huesos','el estómago','los dientes'], 'Los pulmones participan en la respiración.'),
    q('¿Qué sentido usamos con los ojos?', '👀', 'la vista', ['la vista','el olfato','el gusto','el tacto'], 'Los ojos son los órganos de la vista.'),
    q('¿Qué sentido usamos con la nariz?', '👃', 'el olfato', ['el olfato','la audición','la vista','el gusto'], 'La nariz nos permite percibir olores.'),
    q('¿Cuál es un hábito saludable?', 'Elige la mejor opción', 'lavarse las manos', ['lavarse las manos','dormir muy poco','no tomar agua','comer solo dulces'], 'Lavarse las manos ayuda a prevenir enfermedades.'),
    q('¿Qué ayuda a mantener huesos y músculos activos?', 'Movimiento', 'hacer actividad física', ['hacer actividad física','estar sentado todo el día','no dormir','evitar el agua'], 'Moverse y hacer ejercicio fortalece el cuerpo.'),
    q('¿Qué grupo de alimentos aporta vitaminas y fibra?', '🥕🍎', 'frutas y verduras', ['frutas y verduras','solo caramelos','solo bebidas','solo sal'], 'Frutas y verduras aportan vitaminas, minerales y fibra.'),
    q('¿Para qué necesitamos dormir?', '😴', 'para descansar y recuperarnos', ['para descansar y recuperarnos','para dejar de respirar','para no crecer','para reemplazar el agua'], 'Dormir permite que el cuerpo y el cerebro descansen.'),
    q('¿Qué protege el cerebro?', '🧠', 'el cráneo', ['el cráneo','el estómago','la lengua','las uñas'], 'El cráneo es una estructura ósea que protege el cerebro.'),
    q('¿Qué debemos hacer al estornudar?', 'Cuidado de otros', 'cubrir nariz y boca con el antebrazo', ['cubrir nariz y boca con el antebrazo','estornudar hacia otra persona','tocar alimentos','no hacer nada'], 'Cubrirse con el antebrazo reduce la dispersión de gotitas.'),
  ],
  matter: [
    q('¿Cuál mantiene su forma propia?', 'Estados de la materia', 'un sólido', ['un sólido','un líquido','el aire solamente','ninguno'], 'Los sólidos mantienen su forma con mayor facilidad.'),
    q('¿Qué hace un líquido dentro de un vaso?', '💧', 'toma la forma del recipiente', ['toma la forma del recipiente','mantiene forma de cubo siempre','desaparece','se vuelve roca'], 'Los líquidos adoptan la forma del recipiente.'),
    q('¿Cuál es un ejemplo de sólido?', 'Elige uno', 'hielo', ['hielo','agua líquida','vapor','aire'], 'El hielo es agua en estado sólido.'),
    q('¿Cuál es un ejemplo de líquido?', 'Elige uno', 'leche', ['leche','piedra','mesa','vapor'], 'La leche fluye y toma la forma del recipiente.'),
    q('¿Qué ocurre con el hielo si recibe calor suficiente?', '🧊 + calor', 'se derrite', ['se derrite','se congela más','se convierte en madera','se vuelve metal'], 'Al calentarse, el hielo puede pasar de sólido a líquido.'),
    q('¿Qué ocurre con el agua líquida al congelarse?', '💧 → 🧊', 'se vuelve sólida', ['se vuelve sólida','se vuelve madera','desaparece por completo','se vuelve arena'], 'Al congelarse, el agua cambia de líquido a sólido.'),
    q('¿Qué material suele ser transparente?', 'Ventana', 'vidrio', ['vidrio','cartón grueso','madera','ladrillo'], 'El vidrio permite pasar la luz y suele ser transparente.'),
    q('¿Qué material es atraído por un imán con frecuencia?', '🧲', 'hierro', ['hierro','papel','vidrio','algodón'], 'El hierro es un material magnético.'),
    q('¿Qué propiedad describe si algo se dobla fácilmente?', 'Propiedades', 'flexibilidad', ['flexibilidad','temperatura','sonido','olor'], 'La flexibilidad indica qué tan fácil se dobla un material.'),
    q('¿Qué material elegirías para una toalla?', 'Absorber agua', 'algodón', ['algodón','vidrio','metal','piedra'], 'El algodón puede absorber agua.'),
  ],
  forces: [
    q('¿Qué es empujar?', 'Fuerza', 'mover algo alejándolo de ti', ['mover algo alejándolo de ti','atraerlo hacia ti','dejarlo sin tocar','cambiar su color'], 'Empujar aplica una fuerza que aleja el objeto.'),
    q('¿Qué es tirar de un objeto?', 'Fuerza', 'acercarlo hacia ti', ['acercarlo hacia ti','alejarlo siempre','convertirlo en líquido','quitarle masa'], 'Tirar o jalar aplica una fuerza hacia ti.'),
    q('¿Qué puede hacer una fuerza?', 'Movimiento', 'cambiar el movimiento de un objeto', ['cambiar el movimiento de un objeto','cambiar un perro en gato','crear agua de la nada','detener el tiempo'], 'Una fuerza puede iniciar, detener o cambiar el movimiento.'),
    q('¿Qué hace la gravedad con los objetos cerca de la Tierra?', '🌍', 'los atrae hacia el suelo', ['los atrae hacia el suelo','los empuja al espacio siempre','los vuelve transparentes','los calienta'], 'La gravedad atrae los objetos hacia la Tierra.'),
    q('¿Qué superficie produce más roce?', 'Comparar superficies', 'una alfombra rugosa', ['una alfombra rugosa','hielo liso','vidrio pulido','una superficie muy lisa'], 'Las superficies rugosas suelen producir más fricción.'),
    q('¿Qué ocurre al patear una pelota quieta?', '⚽', 'comienza a moverse', ['comienza a moverse','se convierte en agua','pierde su color','desaparece'], 'La patada aplica una fuerza que cambia su estado de movimiento.'),
    q('¿Qué puede hacer un imán?', '🧲', 'atraer algunos metales', ['atraer algunos metales','atraer toda la madera','derretir hielo','producir lluvia'], 'Los imanes atraen ciertos materiales como el hierro.'),
    q('Si empujas más fuerte un carrito, ¿qué puede ocurrir?', '🛒', 'puede moverse más rápido', ['puede moverse más rápido','se vuelve invisible','se congela','pierde ruedas automáticamente'], 'Una fuerza mayor puede producir un cambio mayor en el movimiento.'),
    q('¿Cuál es una máquina simple que ayuda a subir una carga?', 'Ejemplo', 'una rampa', ['una rampa','una nube','una hoja','un vaso'], 'Una rampa o plano inclinado facilita mover objetos a distinta altura.'),
    q('¿Qué fuerza ayuda a frenar una bicicleta?', 'Rueda y suelo', 'fricción', ['fricción','luz','sonido','sombra'], 'La fricción ayuda a reducir el movimiento.'),
  ],
  earth: [
    q('¿En qué estado encontramos el agua de los océanos?', '🌊', 'líquido', ['líquido','sólido siempre','metal','plástico'], 'El agua de los océanos está principalmente en estado líquido.'),
    q('¿Qué forma las nubes?', '☁️', 'pequeñas gotas de agua o cristales', ['pequeñas gotas de agua o cristales','piedras','arena seca','metal'], 'Las nubes están formadas por gotitas de agua y/o cristales de hielo.'),
    q('¿Qué instrumento mide la temperatura?', 'Clima', 'termómetro', ['termómetro','regla','balanza','brújula'], 'El termómetro sirve para medir temperatura.'),
    q('¿Qué instrumento indica la dirección?', 'Orientación', 'brújula', ['brújula','vaso','cronómetro','lupa'], 'La brújula ayuda a orientarse usando los puntos cardinales.'),
    q('¿Cuál es una acción para cuidar el agua?', '💧', 'cerrar la llave mientras te cepillas', ['cerrar la llave mientras te cepillas','dejarla abierta sin usarla','botar basura al río','lavar la vereda por horas'], 'Cerrar la llave evita desperdiciar agua.'),
    q('¿Qué gas del aire necesitamos para respirar?', 'Aire', 'oxígeno', ['oxígeno','plástico','sal','arena'], 'Las personas y muchos animales necesitan oxígeno para respirar.'),
    q('¿Qué puede contaminar un río?', 'Cuidado ambiental', 'botar basura y químicos', ['botar basura y químicos','plantar árboles','reciclar','usar una botella reutilizable'], 'Los residuos y sustancias contaminantes dañan el agua.'),
    q('¿Cuál es una fuente de energía natural?', '☀️', 'el Sol', ['el Sol','una mesa','un cuaderno','una cuchara'], 'El Sol entrega energía luminosa y térmica.'),
    q('¿Qué describe el tiempo atmosférico?', 'Hoy', 'cómo está la atmósfera en un lugar y momento', ['cómo está la atmósfera en un lugar y momento','la edad de una roca','el nombre de una ciudad','la cantidad de libros'], 'El tiempo atmosférico describe condiciones como lluvia, temperatura y viento.'),
    q('¿Cuál acción reduce residuos?', '♻️', 'reutilizar y reciclar', ['reutilizar y reciclar','botar todo junto','usar más plástico desechable','dejar basura en el suelo'], 'Reutilizar y reciclar ayuda a reducir residuos.'),
  ],
};

function buildCards(){ els.grid.innerHTML=''; topics.forEach(topic=>{ const b=document.createElement('button'); b.type='button'; b.className='english-topic-card'; b.innerHTML=`<span class="english-topic-icon" aria-hidden="true">${topic.icon}</span><span class="english-topic-copy"><strong>${topic.title}</strong><small>${topic.subtitle}</small></span><span class="english-topic-status">Practicar →</span>`; b.addEventListener('click',()=>startSession(topic.key)); els.grid.appendChild(b); }); }
function bankFor(topic){ if(topic==='review') return [...banks.living,...banks.body,...banks.matter,...banks.forces,...banks.earth]; return banks[topic]||banks.living; }
function sessionQuestions(topic){ const bank=shuffle(bankFor(topic)); const out=[]; for(let i=0;i<SESSION_LENGTH;i++){ const source=bank[i%bank.length]; out.push({...source,id:`sci-${Date.now()}-${++serial}`,options:shuffle(source.options)}); } return out; }
function startSession(topic){ state.topic=topic; state.questionIndex=0; state.currentQuestionId=null; state.score=0; state.streak=0; state.attempts=0; state.answered=false; state.processing=false; state.questions=sessionQuestions(topic); const info=topics.find(t=>t.key===topic)||topics[0]; els.modeLabel.textContent=info.title; show(els.quiz); renderQuestion(); }
function current(){ return state.questions[state.questionIndex]||null; }
function isCurrent(id){ const c=current(); return Boolean(c&&c.id===id&&state.currentQuestionId===id); }
function renderQuestion(){ const c=current(); if(!c){finishSession();return;} state.currentQuestionId=c.id; state.attempts=0; state.answered=false; state.processing=false; els.counter.textContent=`${state.questionIndex+1} / ${SESSION_LENGTH}`; els.prompt.textContent=c.prompt; els.question.textContent=c.display; els.question.classList.toggle('reading',c.reading||String(c.display).length>80); els.streak.textContent=String(state.streak); els.answers.innerHTML=''; els.feedback.innerHTML=''; els.feedback.className='feedback'; els.next.classList.add('hidden'); c.options.forEach(option=>{const b=document.createElement('button');b.type='button';b.className='answer-button';b.textContent=option;b.dataset.value=option;b.dataset.questionId=c.id;b.addEventListener('click',()=>answer(c.id,option,b));els.answers.appendChild(b);}); }
function feedback(kind,title,text,answer=''){ els.feedback.className=`english-feedback-card ${kind}`; els.feedback.innerHTML=`<strong class="english-feedback-title">${title}</strong><p class="english-feedback-text">${text}</p>${answer?`<div class="english-feedback-answer">${answer}</div>`:''}`; }
function finishAnswer(id){ if(!isCurrent(id))return; const c=current(); state.answered=true; [...els.answers.querySelectorAll('.answer-button')].forEach(b=>{b.disabled=true;if(b.dataset.questionId===id&&b.dataset.value===c.correct)b.classList.add('correct');}); progress.bestStreak=Math.max(progress.bestStreak,state.streak); saveProgress(); els.streak.textContent=String(state.streak); els.next.textContent=state.questionIndex===SESSION_LENGTH-1?'Ver resultado 🌟':'Siguiente →'; els.next.classList.remove('hidden'); }
function answer(id,value,button){ if(state.processing||state.answered||button.disabled||!isCurrent(id)||button.dataset.questionId!==id)return; state.processing=true; try{ const c=current(); if(String(value)===c.correct){button.classList.add('correct');state.score++;state.streak++;progress.stars++;feedback('success',state.attempts===1?'🌟 ¡Muy bien!':state.streak>=3?'🔥 ¡Excelente racha!':'✨ ¡Muy bien!',c.explanation,c.correct);finishAnswer(id);return;} button.classList.add('wrong');button.disabled=true;if(state.attempts===0){state.attempts=1;feedback('','💡 Una pista fácil',c.explanation,`Busca: ${c.correct}`);return;} state.attempts=2;state.streak=0;feedback('gentle','🌷 Miremos la respuesta',c.explanation,c.correct);finishAnswer(id);}finally{state.processing=false;} }
function next(){ if(!state.answered||state.processing)return; state.answered=false;state.currentQuestionId=null;if(state.questionIndex<SESSION_LENGTH-1){state.questionIndex++;renderQuestion();}else finishSession(); }
function finishSession(){ const info=topics.find(t=>t.key===state.topic)||topics[0]; progress.sessions++;progress.byTopic[state.topic]=(Number(progress.byTopic[state.topic])||0)+1;saveProgress();els.finalScore.textContent=String(state.score);if(state.score>=9){els.resultEmoji.textContent='🏆';els.resultTitle.textContent='¡Excelente!';els.resultText.textContent=`Dominaste ${info.title.toLowerCase()}.`;}else if(state.score>=7){els.resultEmoji.textContent='🌟';els.resultTitle.textContent='¡Muy buen trabajo!';els.resultText.textContent=`Vas muy bien en ${info.title.toLowerCase()}.`;}else if(state.score>=5){els.resultEmoji.textContent='💪';els.resultTitle.textContent='¡Buen entrenamiento!';els.resultText.textContent='Una práctica corta más ayudará a fijarlo.';}else{els.resultEmoji.textContent='🌱';els.resultTitle.textContent='Seguimos aprendiendo';els.resultText.textContent='Mirar la pista y corregir también es aprender.';}show(els.result); }
function registerSW(){if(!('serviceWorker'in navigator))return;window.addEventListener('load',async()=>{try{const r=await navigator.serviceWorker.register('./sw.js');r.update().catch(()=>{});}catch{}});}
function init(){assertElements();buildCards();renderProgress();els.back.addEventListener('click',()=>show(els.home));els.next.addEventListener('click',next);els.again.addEventListener('click',()=>startSession(state.topic));els.homeButton.addEventListener('click',()=>show(els.home));registerSW();document.documentElement.dataset.appVersion=SCIENCE_VERSION;}
try{init();}catch(error){console.error('No se pudo iniciar Ciencias',error);}

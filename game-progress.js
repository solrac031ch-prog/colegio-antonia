'use strict';

(() => {
  const STORAGE_KEY = 'aprende3GameProgress';
  const DAILY_GOAL = 2;
  const XP_PER_CORRECT = 10;
  const XP_LESSON_BONUS = 20;
  const XP_PER_LEVEL = 250;

  const subjects = {
    math: {
      title: 'Matemáticas', icon: '🧮', href: 'math.html?v=18', progressKey: 'antoniaMathProgress',
      cards: '#curriculumGrid .topic-card', topicAttr: 'topicKey', stars: '#stars', sessions: '#sessions', mode: '#modeLabel', result: '#resultView'
    },
    english: {
      title: 'Inglés', icon: '🇬🇧', href: 'english.html?v=18', progressKey: 'antoniaEnglishProgress',
      cards: '#englishTopicGrid .english-topic-card', topicAttr: 'topic', stars: '#englishStars', sessions: '#englishSessions', mode: '#englishModeLabel', result: '#englishResult'
    },
    language: {
      title: 'Lenguaje', icon: '📚', href: 'language.html?v=18', progressKey: 'antoniaLanguageProgress',
      cards: '#languageTopicGrid .english-topic-card', topicAttr: 'topic', stars: '#languageStars', sessions: '#languageSessions', mode: '#languageModeLabel', result: '#languageResult'
    },
    science: {
      title: 'Ciencias Naturales', icon: '🔬', href: 'science.html?v=18', progressKey: 'antoniaScienceProgress',
      cards: '#scienceTopicGrid .english-topic-card', topicAttr: 'topic', stars: '#scienceStars', sessions: '#scienceSessions', mode: '#scienceModeLabel', result: '#scienceResult'
    },
    history: {
      title: 'Historia y Geografía', icon: '🌎', href: 'history.html?v=18', progressKey: 'antoniaHistoryProgress',
      cards: '#historyTopicGrid .english-topic-card', topicAttr: 'topic', stars: '#historyStars', sessions: '#historySessions', mode: '#historyModeLabel', result: '#historyResult'
    }
  };

  const currentSubject = document.body.dataset.subject || 'dashboard';
  let lessonXp = 0;

  function todayStamp(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function dateFromStamp(stamp) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp || '')) return null;
    const [year, month, day] = stamp.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function daysBetween(fromStamp, toStamp) {
    const from = dateFromStamp(fromStamp);
    const to = dateFromStamp(toStamp);
    if (!from || !to) return null;
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  function safeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function readSubjectProgress(key) {
    try {
      return safeObject(JSON.parse(localStorage.getItem(key) || '{}'));
    } catch {
      return {};
    }
  }

  function defaultGameProgress() {
    return {
      xp: 0,
      streakDays: 0,
      lastStudyDate: '',
      dailyDate: todayStamp(),
      dailyLessons: 0,
      dailyXp: 0,
      totalLessons: 0,
      lastSubject: 'math',
      lastTopic: '',
      subjectXp: { math: 0, english: 0, language: 0, science: 0, history: 0 },
      migratedExistingProgress: false
    };
  }

  function loadGameProgress() {
    const fallback = defaultGameProgress();
    try {
      const parsed = safeObject(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
      const result = { ...fallback, ...parsed };
      result.subjectXp = { ...fallback.subjectXp, ...safeObject(parsed.subjectXp) };
      return result;
    } catch {
      return fallback;
    }
  }

  const game = loadGameProgress();

  function migrateExistingProgress() {
    if (game.migratedExistingProgress) return;
    let stars = 0;
    let sessions = 0;
    Object.values(subjects).forEach(subject => {
      const progress = readSubjectProgress(subject.progressKey);
      stars += Number.isFinite(progress.stars) ? progress.stars : 0;
      sessions += Number.isFinite(progress.sessions) ? progress.sessions : 0;
    });
    game.xp = Math.max(Number(game.xp) || 0, stars * XP_PER_CORRECT + sessions * XP_LESSON_BONUS);
    game.totalLessons = Math.max(Number(game.totalLessons) || 0, sessions);
    game.migratedExistingProgress = true;
  }

  function normalizeDailyProgress() {
    const today = todayStamp();
    if (game.dailyDate !== today) {
      game.dailyDate = today;
      game.dailyLessons = 0;
      game.dailyXp = 0;
    }
  }

  function saveGameProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    } catch {
      // La práctica sigue funcionando aunque el navegador bloquee almacenamiento.
    }
  }

  function levelFromXp(xp) {
    return Math.floor(Math.max(0, Number(xp) || 0) / XP_PER_LEVEL) + 1;
  }

  function percentToNextLevel(xp) {
    const value = Math.max(0, Number(xp) || 0);
    return ((value % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => { element.textContent = String(value); });
  }

  function renderGameProgress() {
    normalizeDailyProgress();
    const level = levelFromXp(game.xp);
    const dailyPercent = Math.min(100, (game.dailyLessons / DAILY_GOAL) * 100);
    const levelPercent = percentToNextLevel(game.xp);

    setText('[data-game-xp]', game.xp);
    setText('[data-game-streak]', game.streakDays);
    setText('[data-game-level]', level);
    setText('[data-game-daily]', `${Math.min(game.dailyLessons, DAILY_GOAL)}/${DAILY_GOAL}`);
    setText('[data-game-total-lessons]', game.totalLessons);

    document.querySelectorAll('[data-game-daily-bar]').forEach(bar => { bar.style.width = `${dailyPercent}%`; });
    document.querySelectorAll('[data-game-level-bar]').forEach(bar => { bar.style.width = `${levelPercent}%`; });

    const last = subjects[game.lastSubject] || subjects.math;
    const continueLink = document.querySelector('[data-game-continue]');
    if (continueLink) {
      continueLink.href = last.href;
      const icon = continueLink.querySelector('[data-game-continue-icon]');
      const title = continueLink.querySelector('[data-game-continue-title]');
      const detail = continueLink.querySelector('[data-game-continue-detail]');
      if (icon) icon.textContent = last.icon;
      if (title) title.textContent = last.title;
      if (detail) detail.textContent = game.lastTopic ? `Último tema: ${game.lastTopic}` : 'Continúa tu camino de aprendizaje';
    }

    document.querySelectorAll('[data-game-goal-message]').forEach(element => {
      if (game.dailyLessons >= DAILY_GOAL) element.textContent = '🎉 ¡Meta diaria completada!';
      else if (game.dailyLessons === 1) element.textContent = 'Te falta 1 lección para completar la meta.';
      else element.textContent = `Completa ${DAILY_GOAL} lecciones hoy.`;
    });
  }

  function injectGameStrip() {
    if (!subjects[currentSubject] || document.querySelector('.game-strip')) return;
    const backRow = document.querySelector('.app-back-row');
    if (!backRow) return;
    const strip = document.createElement('section');
    strip.className = 'game-strip';
    strip.setAttribute('aria-label', 'Progreso de aventura');
    strip.innerHTML = `
      <div class="game-strip-stat"><span>🔥 Racha</span><strong><span data-game-streak>0</span> días</strong></div>
      <div class="game-strip-stat"><span>⚡ XP</span><strong data-game-xp>0</strong></div>
      <div class="game-strip-stat"><span>🏅 Nivel</span><strong data-game-level>1</strong></div>
      <div class="game-strip-goal"><span>🎯 Hoy <strong data-game-daily>0/${DAILY_GOAL}</strong></span><div class="mini-progress"><i data-game-daily-bar></i></div></div>
    `;
    backRow.insertAdjacentElement('afterend', strip);
  }

  function pathProgress() {
    const subject = subjects[currentSubject];
    if (!subject) return null;
    return readSubjectProgress(subject.progressKey);
  }

  function decoratePath() {
    const subject = subjects[currentSubject];
    if (!subject) return;
    const cards = Array.from(document.querySelectorAll(subject.cards));
    if (!cards.length) return;
    const progress = pathProgress() || {};
    const byTopic = safeObject(progress.byTopic);
    let foundCurrent = false;

    cards.forEach((card, index) => {
      const key = card.dataset[subject.topicAttr] || '';
      const completedCount = Number(byTopic[key]) || 0;
      card.classList.remove('adventure-completed', 'adventure-current', 'adventure-available');

      let step = card.querySelector('.adventure-step');
      if (!step) {
        step = document.createElement('span');
        step.className = 'adventure-step';
        card.prepend(step);
      }
      step.textContent = completedCount > 0 ? '✓' : String(index + 1);

      const status = card.querySelector('.topic-status, .english-topic-status');
      if (completedCount > 0) {
        card.classList.add('adventure-completed');
        if (status) status.textContent = completedCount > 1 ? `✓ Completado ${completedCount} veces` : '✓ Completado';
      } else if (!foundCurrent) {
        foundCurrent = true;
        card.classList.add('adventure-current');
        if (status) status.textContent = '▶ Siguiente estación';
      } else {
        card.classList.add('adventure-available');
        if (status) status.textContent = 'Disponible';
      }
    });
  }

  function updateDailyStreak() {
    const today = todayStamp();
    if (game.lastStudyDate === today) return;
    const difference = daysBetween(game.lastStudyDate, today);
    if (difference === 1) game.streakDays = Math.max(1, Number(game.streakDays) || 0) + 1;
    else game.streakDays = 1;
    game.lastStudyDate = today;
  }

  function awardCorrect(delta) {
    if (!subjects[currentSubject] || delta <= 0) return;
    const gained = delta * XP_PER_CORRECT;
    game.xp += gained;
    game.dailyXp += gained;
    game.subjectXp[currentSubject] = (Number(game.subjectXp[currentSubject]) || 0) + gained;
    lessonXp += gained;
    saveGameProgress();
    renderGameProgress();
  }

  function currentModeLabel() {
    const subject = subjects[currentSubject];
    if (!subject) return '';
    return document.querySelector(subject.mode)?.textContent?.trim() || '';
  }

  function completeLesson() {
    if (!subjects[currentSubject]) return;
    normalizeDailyProgress();
    updateDailyStreak();
    game.xp += XP_LESSON_BONUS;
    game.dailyXp += XP_LESSON_BONUS;
    game.dailyLessons += 1;
    game.totalLessons += 1;
    game.subjectXp[currentSubject] = (Number(game.subjectXp[currentSubject]) || 0) + XP_LESSON_BONUS;
    game.lastSubject = currentSubject;
    game.lastTopic = currentModeLabel();
    const gained = lessonXp + XP_LESSON_BONUS;
    lessonXp = 0;
    saveGameProgress();
    renderGameProgress();
    setTimeout(() => {
      decoratePath();
      showLessonCelebration(gained);
    }, 40);
  }

  function showLessonCelebration(gainedXp) {
    const subject = subjects[currentSubject];
    if (!subject) return;
    const result = document.querySelector(subject.result);
    const panel = result?.querySelector('.result-panel');
    if (!panel) return;

    let summary = panel.querySelector('[data-adventure-result]');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'adventure-result-summary';
      summary.dataset.adventureResult = 'true';
      const score = panel.querySelector('.result-score');
      if (score) score.insertAdjacentElement('afterend', summary);
      else panel.prepend(summary);
    }
    summary.innerHTML = `
      <div class="adventure-xp-pop">+${gainedXp} XP</div>
      <div class="adventure-result-stats">
        <span>🔥 <strong>${game.streakDays}</strong> días</span>
        <span>🏅 Nivel <strong>${levelFromXp(game.xp)}</strong></span>
        <span>🎯 Hoy <strong>${Math.min(game.dailyLessons, DAILY_GOAL)}/${DAILY_GOAL}</strong></span>
      </div>
      <div class="level-progress" aria-label="Progreso hacia el siguiente nivel"><i style="width:${percentToNextLevel(game.xp)}%"></i></div>
    `;
    launchConfetti();
  }

  function launchConfetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const existing = document.querySelector('.adventure-confetti');
    if (existing) existing.remove();
    const layer = document.createElement('div');
    layer.className = 'adventure-confetti';
    layer.setAttribute('aria-hidden', 'true');
    const symbols = ['⭐', '✨', '◆', '●'];
    for (let index = 0; index < 18; index += 1) {
      const piece = document.createElement('span');
      piece.textContent = symbols[index % symbols.length];
      piece.style.setProperty('--x', `${8 + ((index * 17) % 84)}vw`);
      piece.style.setProperty('--delay', `${(index % 6) * 35}ms`);
      piece.style.setProperty('--spin', `${180 + index * 23}deg`);
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1500);
  }

  function observeCounter(selector, onIncrease) {
    const element = document.querySelector(selector);
    if (!element) return;
    let previous = Number(element.textContent) || 0;
    const observer = new MutationObserver(() => {
      const current = Number(element.textContent) || 0;
      if (current > previous) onIncrease(current - previous);
      previous = current;
    });
    observer.observe(element, { childList: true, characterData: true, subtree: true });
  }

  function initSubjectObservers() {
    const subject = subjects[currentSubject];
    if (!subject) return;
    game.lastSubject = currentSubject;
    saveGameProgress();
    observeCounter(subject.stars, awardCorrect);
    observeCounter(subject.sessions, delta => {
      for (let index = 0; index < delta; index += 1) completeLesson();
    });
  }

  migrateExistingProgress();
  normalizeDailyProgress();
  injectGameStrip();
  renderGameProgress();
  decoratePath();
  initSubjectObservers();
  setTimeout(decoratePath, 0);

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    const fresh = loadGameProgress();
    Object.assign(game, fresh);
    renderGameProgress();
  });
})();
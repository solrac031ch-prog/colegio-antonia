import { test, expect } from '@playwright/test';

const subjects = [
  { key: 'math', name: 'Matemáticas', path: '/math.html', heading: 'Matemáticas', home: '#homeView', cards: '#curriculumGrid .topic-card', quiz: '#quizView', answers: '#answers .answer-button', next: '#nextButton', counter: '#questionCounter', result: '#resultView', directStart: false, enhanced: false },
  { key: 'english', name: 'Inglés', path: '/english.html', heading: 'Inglés', home: '#englishHome', cards: '#englishTopicGrid .english-topic-card', quiz: '#englishQuiz', answers: '#englishAnswers .answer-button', next: '#englishNextButton', counter: '#englishCounter', result: '#englishResult', directStart: true, enhanced: false },
  { key: 'language', name: 'Lenguaje', path: '/language.html', heading: 'Lenguaje', home: '#languageHome', cards: '#languageTopicGrid .english-topic-card', quiz: '#languageQuiz', answers: '#languageAnswers .answer-button', next: '#languageNextButton', counter: '#languageCounter', result: '#languageResult', directStart: true, enhanced: true },
  { key: 'science', name: 'Ciencias', path: '/science.html', heading: 'Ciencias Naturales', home: '#scienceHome', cards: '#scienceTopicGrid .english-topic-card', quiz: '#scienceQuiz', answers: '#scienceAnswers .answer-button', next: '#scienceNextButton', counter: '#scienceCounter', result: '#scienceResult', directStart: true, enhanced: true },
  { key: 'history', name: 'Historia', path: '/history.html', heading: 'Historia y Geografía', home: '#historyHome', cards: '#historyTopicGrid .english-topic-card', quiz: '#historyQuiz', answers: '#historyAnswers .answer-button', next: '#historyNextButton', counter: '#historyCounter', result: '#historyResult', directStart: true, enhanced: true },
];

async function openTopic(page, subject, cardIndex = 0) {
  await expect(page.locator(subject.cards).nth(cardIndex)).toBeVisible();
  await page.locator(subject.cards).nth(cardIndex).click();
  if (!subject.directStart) {
    const genericStart = page.locator('#startTopicButton');
    if (await genericStart.isVisible()) await genericStart.click();
    else { await expect(page.locator('#mixedButton')).toBeVisible(); await page.locator('#mixedButton').click(); }
  }
  await expect(page.locator(subject.quiz)).toHaveClass(/active/);
  await expect(page.locator(subject.answers).first()).toBeVisible();
}

async function finishCurrentQuestion(page, subject) {
  const next = page.locator(subject.next);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await next.isVisible()) return;
    const enabled = page.locator(`${subject.answers}:not(:disabled)`);
    if (!(await enabled.count())) break;
    await enabled.first().click();
  }
  await expect(next).toBeVisible();
}

async function answerEnglishCorrectly(page) {
  const next = page.locator('#englishNextButton');
  const first = page.locator('#englishAnswers .answer-button:not(:disabled)').first();
  await first.click();
  if (await next.isVisible()) return;
  const hint = page.locator('#englishFeedback .english-feedback-answer');
  await expect(hint).toBeVisible();
  const hintText = (await hint.textContent() || '').replace(/^Busca:\s*/, '').trim();
  const correctButton = page.locator('#englishAnswers .answer-button:not(:disabled)').filter({ hasText: hintText }).first();
  await expect(correctButton).toBeVisible();
  await correctButton.click();
  await expect(next).toBeVisible();
}

async function fillOrderAttempt(page) {
  const bank = page.locator('.quick-token-bank .quick-token:not(:disabled)');
  let guard = 0;
  while (await bank.count()) {
    await bank.first().click();
    guard += 1;
    if (guard > 12) throw new Error('No se pudo completar el orden');
  }
  await page.locator('[data-quick-check]').click();
}

async function solveMatch(page) {
  let guard = 0;
  while ((await page.locator('.quick-match-card:not(:disabled)').count()) > 0) {
    const enabled = page.locator('.quick-match-card:not(:disabled)');
    const firstText = await enabled.first().textContent();
    let matched = false;
    const count = await enabled.count();
    for (let index = 1; index < count; index += 1) {
      const first = page.locator('.quick-match-card:not(:disabled)').filter({ hasText: firstText || '' }).first();
      if (!(await first.count())) { matched = true; break; }
      const candidate = page.locator('.quick-match-card:not(:disabled)').nth(index);
      await first.click();
      await candidate.click();
      await page.waitForTimeout(390);
      if (!(await page.locator('.quick-match-card:not(:disabled)').filter({ hasText: firstText || '' }).count())) { matched = true; break; }
    }
    guard += 1;
    if (!matched && guard > 12) throw new Error('No se pudieron resolver las parejas');
    if (guard > 20) throw new Error('Bucle de parejas');
  }
  await expect(page.locator('[data-quick-next]')).toBeVisible();
}

async function finishQuickRound(page) {
  const next = page.locator('[data-quick-next]');
  if (await page.locator('.quick-match-card').count()) { await solveMatch(page); return; }
  if (await page.locator('.quick-input').count()) {
    const input = page.locator('.quick-input');
    await input.fill('__respuesta__');
    await page.locator('[data-quick-check]').click();
    if (!(await next.isVisible())) { await input.fill('__respuesta__'); await page.locator('[data-quick-check]').click(); }
    await expect(next).toBeVisible();
    return;
  }
  if (await page.locator('.quick-order-tray').count()) {
    await fillOrderAttempt(page);
    if (!(await next.isVisible())) await fillOrderAttempt(page);
    await expect(next).toBeVisible();
    return;
  }
  const choice = page.locator('.quick-choice:not(:disabled)').first();
  await expect(choice).toBeVisible();
  await choice.click();
  if (!(await next.isVisible())) await page.locator('.quick-choice:not(:disabled)').first().click();
  await expect(next).toBeVisible();
}

test('portada muestra aventura, cinco materias y desafío rápido', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '¡Sigue aprendiendo!', exact: true })).toBeVisible();
  await expect(page.locator('.dashboard-game-panel')).toBeVisible();
  await expect(page.locator('[data-game-xp]').first()).toBeVisible();
  await expect(page.locator('[data-game-streak]').first()).toBeVisible();
  await expect(page.locator('[data-game-level]').first()).toBeVisible();
  await expect(page.locator('.subject-dashboard-grid .subject-card')).toHaveCount(5);
  await expect(page.getByRole('link', { name: /Desafío rápido/ })).toHaveAttribute('href', /games\.html\?subject=math/);
  await expect(page.locator('body')).not.toContainText('Antonia');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBeTruthy();
});

for (const subject of subjects) {
  test(`${subject.name}: camino, juego y preguntas funcionan`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(subject.path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: subject.heading, exact: true })).toBeVisible();
    await expect(page.locator(subject.home)).toHaveClass(/active/);
    await expect(page.locator('.subject-switcher .subject-link')).toHaveCount(5);
    await expect(page.locator('[data-app-back]')).toBeVisible();
    await expect(page.locator('[data-reset-progress]')).toBeVisible();
    await expect(page.locator('.game-strip')).toBeVisible();
    await expect(page.locator(`a[href*="games.html?subject=${subject.key}"]`)).toBeVisible();
    await expect(page.locator(subject.cards).first()).toHaveClass(/adventure-current|adventure-completed/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBeTruthy();
    await openTopic(page, subject, 0);
    await expect(page.locator(subject.counter)).toContainText('1 / 10');
    await finishCurrentQuestion(page, subject);
    if (subject.enhanced) await expect(page.locator('.learning-explanation')).toBeVisible();
    await page.locator(subject.next).click();
    await expect(page.locator(subject.counter)).toContainText('2 / 10');
    expect(pageErrors).toEqual([]);
  });
}

test('una respuesta correcta entrega XP', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'windows-chromium', 'La prueba de XP corre una vez en Chromium.');
  await page.goto('/english.html', { waitUntil: 'domcontentloaded' });
  await openTopic(page, subjects[1], 0);
  await expect(page.locator('.game-strip [data-game-xp]')).toHaveText('0');
  await answerEnglishCorrectly(page);
  await expect(page.locator('.game-strip [data-game-xp]')).toHaveText('10');
});

test('desafíos rápidos de las cinco materias completan 5 rondas', async ({ page }, testInfo) => {
  test.setTimeout(180000);
  test.skip(testInfo.project.name !== 'windows-chromium', 'La prueba exhaustiva de minijuegos corre una vez.');
  for (const subject of subjects) {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`/games.html?subject=${subject.key}`, { waitUntil: 'domcontentloaded' });
    const expectedTitle = subject.key === 'history' ? 'Historia y Geografía' : subject.heading;
    await expect(page.locator('[data-quick-subject-title]')).toHaveText(expectedTitle);
    await expect(page.locator('[data-quick-counter]')).toHaveText('1 / 5');
    let sawAudio = false;
    for (let round = 0; round < 5; round += 1) {
      if (await page.locator('.quick-audio-button').count()) { sawAudio = true; await page.locator('.quick-audio-button').click(); }
      await finishQuickRound(page);
      await page.locator('[data-quick-next]').click();
      if (round < 4) await expect(page.locator('[data-quick-counter]')).toHaveText(`${round + 2} / 5`);
    }
    await expect(page.locator('[data-quick-result]')).toBeVisible();
    await expect(page.locator('[data-quick-result-xp]')).toContainText('XP');
    if (subject.key === 'english') expect(sawAudio).toBeTruthy();
    expect(pageErrors).toEqual([]);
  }
});

test('todos los módulos activos completan una sesión y celebran', async ({ page }, testInfo) => {
  test.setTimeout(300000);
  test.skip(testInfo.project.name !== 'windows-chromium', 'La prueba exhaustiva corre una vez en Chromium.');
  for (const subject of subjects) {
    await page.goto(subject.path, { waitUntil: 'domcontentloaded' });
    const totalCards = await page.locator(subject.cards).count();
    expect(totalCards).toBeGreaterThan(0);
    for (let cardIndex = 0; cardIndex < totalCards; cardIndex += 1) {
      await page.goto(subject.path, { waitUntil: 'domcontentloaded' });
      await openTopic(page, subject, cardIndex);
      for (let question = 0; question < 10; question += 1) {
        await finishCurrentQuestion(page, subject);
        await page.locator(subject.next).click();
        if (question < 9) await expect(page.locator(subject.counter)).toContainText(`${question + 2} / 10`);
      }
      await expect(page.locator(subject.result)).toHaveClass(/active/);
      await expect(page.locator(`${subject.result} [data-adventure-result]`)).toBeVisible();
    }
  }
});

test('juego funciona al recargar sin conexión', async ({ page, context, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'windows-chromium', 'Prueba offline en Chromium.');
  await page.goto('/games.html?subject=science', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { if ('serviceWorker' in navigator) await navigator.serviceWorker.ready; });
  await page.waitForTimeout(500);
  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-quick-subject-title]')).toHaveText('Ciencias Naturales');
    await expect(page.locator('[data-quick-counter]')).toHaveText('1 / 5');
  } finally { await context.setOffline(false); }
});

test('manifest y service worker usan aventura interactiva v19', async ({ request }) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const data = await manifest.json();
  expect(data.name).toBe('Aprende 3° Básico');
  expect(data.short_name).toBe('3° Básico');
  expect(data.shortcuts.some(item => item.url.includes('games.html'))).toBeTruthy();
  const serviceWorker = await request.get('/sw.js');
  expect(serviceWorker.ok()).toBeTruthy();
  const swText = await serviceWorker.text();
  expect(swText).toContain('aprende-3-basico-v19');
  expect(swText).toContain('./games.html');
  expect(swText).toContain('./games.js');
  expect(swText).toContain('./games.css');
});

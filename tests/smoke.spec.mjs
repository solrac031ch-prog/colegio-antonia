import { test, expect } from '@playwright/test';

const subjects = [
  { name: 'Matemáticas', path: '/math.html', heading: 'Matemáticas', home: '#homeView', cards: '#curriculumGrid .topic-card', quiz: '#quizView', answers: '#answers .answer-button', next: '#nextButton', counter: '#questionCounter', result: '#resultView', directStart: false, enhanced: false },
  { name: 'Inglés', path: '/english.html', heading: 'Inglés', home: '#englishHome', cards: '#englishTopicGrid .english-topic-card', quiz: '#englishQuiz', answers: '#englishAnswers .answer-button', next: '#englishNextButton', counter: '#englishCounter', result: '#englishResult', directStart: true, enhanced: false },
  { name: 'Lenguaje', path: '/language.html', heading: 'Lenguaje', home: '#languageHome', cards: '#languageTopicGrid .english-topic-card', quiz: '#languageQuiz', answers: '#languageAnswers .answer-button', next: '#languageNextButton', counter: '#languageCounter', result: '#languageResult', directStart: true, enhanced: true },
  { name: 'Ciencias', path: '/science.html', heading: 'Ciencias Naturales', home: '#scienceHome', cards: '#scienceTopicGrid .english-topic-card', quiz: '#scienceQuiz', answers: '#scienceAnswers .answer-button', next: '#scienceNextButton', counter: '#scienceCounter', result: '#scienceResult', directStart: true, enhanced: true },
  { name: 'Historia', path: '/history.html', heading: 'Historia y Geografía', home: '#historyHome', cards: '#historyTopicGrid .english-topic-card', quiz: '#historyQuiz', answers: '#historyAnswers .answer-button', next: '#historyNextButton', counter: '#historyCounter', result: '#historyResult', directStart: true, enhanced: true },
];

async function openTopic(page, subject, cardIndex = 0) {
  await expect(page.locator(subject.cards).nth(cardIndex)).toBeVisible();
  await page.locator(subject.cards).nth(cardIndex).click();

  if (!subject.directStart) {
    const genericStart = page.locator('#startTopicButton');
    if (await genericStart.isVisible()) {
      await genericStart.click();
    } else {
      await expect(page.locator('#mixedButton')).toBeVisible();
      await page.locator('#mixedButton').click();
    }
  }

  await expect(page.locator(subject.quiz)).toHaveClass(/active/);
  await expect(page.locator(subject.answers).first()).toBeVisible();
}

async function finishCurrentQuestion(page, subject) {
  const next = page.locator(subject.next);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await next.isVisible()) return;
    const enabled = page.locator(`${subject.answers}:not(:disabled)`);
    const count = await enabled.count();
    if (!count) break;
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

test('portada muestra dashboard de aventura y cinco materias', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '¡Sigue aprendiendo!', exact: true })).toBeVisible();
  await expect(page.locator('.dashboard-game-panel')).toBeVisible();
  await expect(page.locator('[data-game-xp]').first()).toBeVisible();
  await expect(page.locator('[data-game-streak]').first()).toBeVisible();
  await expect(page.locator('[data-game-level]').first()).toBeVisible();
  await expect(page.locator('[data-game-continue]')).toHaveAttribute('href', /math\.html/);
  await expect(page.locator('.subject-dashboard-grid .subject-card')).toHaveCount(5);
  await expect(page.locator('.subject-dashboard-grid .subject-card[href*="math.html"]')).toHaveAttribute('href', /math\.html/);
  await expect(page.getByRole('link', { name: /Ciencias Naturales/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Historia, Geografía/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Antonia');
  const noPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
  expect(noPageOverflow).toBeTruthy();
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
    await expect(page.locator(subject.cards).first()).toHaveClass(/adventure-current|adventure-completed/);
    await expect(page.locator(`${subject.cards} .adventure-step`).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Colegio de Antonia');

    const noPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
    expect(noPageOverflow).toBeTruthy();

    await openTopic(page, subject, 0);
    await expect(page.locator(subject.counter)).toContainText('1 / 10');
    await finishCurrentQuestion(page, subject);
    if (subject.enhanced) await expect(page.locator('.learning-explanation')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Antonia');
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
      await expect(page.locator(`${subject.result} .adventure-xp-pop`)).toContainText('XP');
    }
  }
});

test('Ciencias conserva su pantalla al recargar sin conexión', async ({ page, context, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'windows-chromium', 'Prueba offline en Chromium.');

  await page.goto('/science.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
  });
  await page.waitForTimeout(500);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Ciencias Naturales', exact: true })).toBeVisible();
    await expect(page.locator('.game-strip')).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test('manifest y service worker usan identidad genérica y aventura v18', async ({ request }) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const data = await manifest.json();
  expect(data.name).toBe('Aprende 3° Básico');
  expect(data.short_name).toBe('3° Básico');
  expect(data.start_url).toBe('./');
  expect(data.id).toBe('./');

  const serviceWorker = await request.get('/sw.js');
  expect(serviceWorker.ok()).toBeTruthy();
  const swText = await serviceWorker.text();
  expect(swText).toContain('aprende-3-basico-v18');
  expect(swText).toContain('./game-progress.js');
  expect(swText).toContain('./adventure.css');
});

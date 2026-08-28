import { test, expect } from '@playwright/test';

const subjects = [
  { name: 'Matemáticas', path: '/index.html', heading: 'Matemáticas', home: '#homeView', cards: '#curriculumGrid .topic-card', quiz: '#quizView', answers: '#answers .answer-button', next: '#nextButton', counter: '#questionCounter', result: '#resultView', directStart: false },
  { name: 'Inglés', path: '/english.html', heading: 'Inglés', home: '#englishHome', cards: '#englishTopicGrid .english-topic-card', quiz: '#englishQuiz', answers: '#englishAnswers .answer-button', next: '#englishNextButton', counter: '#englishCounter', result: '#englishResult', directStart: true },
  { name: 'Lenguaje', path: '/language.html', heading: 'Lenguaje', home: '#languageHome', cards: '#languageTopicGrid .english-topic-card', quiz: '#languageQuiz', answers: '#languageAnswers .answer-button', next: '#languageNextButton', counter: '#languageCounter', result: '#languageResult', directStart: true },
  { name: 'Ciencias', path: '/science.html', heading: 'Ciencias Naturales', home: '#scienceHome', cards: '#scienceTopicGrid .english-topic-card', quiz: '#scienceQuiz', answers: '#scienceAnswers .answer-button', next: '#scienceNextButton', counter: '#scienceCounter', result: '#scienceResult', directStart: true },
  { name: 'Historia', path: '/history.html', heading: 'Historia y Geografía', home: '#historyHome', cards: '#historyTopicGrid .english-topic-card', quiz: '#historyQuiz', answers: '#historyAnswers .answer-button', next: '#historyNextButton', counter: '#historyCounter', result: '#historyResult', directStart: true },
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

for (const subject of subjects) {
  test(`${subject.name}: abre, responde y avanza sin errores`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(subject.path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: subject.heading, exact: true })).toBeVisible();
    await expect(page.locator(subject.home)).toHaveClass(/active/);
    await expect(page.locator('.subject-switcher .subject-link')).toHaveCount(5);
    await expect(page.locator('[data-app-back]')).toBeVisible();
    await expect(page.locator('[data-reset-progress]')).toBeVisible();

    const noPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
    expect(noPageOverflow).toBeTruthy();

    await openTopic(page, subject, 0);
    await expect(page.locator(subject.counter)).toContainText('1 / 10');
    await finishCurrentQuestion(page, subject);
    await page.locator(subject.next).click();
    await expect(page.locator(subject.counter)).toContainText('2 / 10');
    expect(pageErrors).toEqual([]);
  });
}

test('todos los módulos activos completan una sesión entera', async ({ page }, testInfo) => {
  test.setTimeout(240000);
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
        if (question < 9) {
          await expect(page.locator(subject.counter)).toContainText(`${question + 2} / 10`);
        }
      }

      await expect(page.locator(subject.result)).toHaveClass(/active/);
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
  } finally {
    await context.setOffline(false);
  }
});

test('manifest y service worker están disponibles', async ({ request }) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const data = await manifest.json();
  expect(data.name).toBe('Colegio de Antonia');
  expect(data.start_url).toBe('./');
  expect(data.id).toBe('./');

  const serviceWorker = await request.get('/sw.js');
  expect(serviceWorker.ok()).toBeTruthy();
});

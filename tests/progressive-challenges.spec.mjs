import { test, expect } from '@playwright/test';

async function waitMatchReady(page) {
  await expect(page.locator('.quick-match-card.wrong')).toHaveCount(0, { timeout: 2_000 });
}

async function solveMatch(page) {
  let guard = 0;
  while ((await page.locator('.quick-match-card:not(:disabled)').count()) > 0) {
    await waitMatchReady(page);
    const cards = page.locator('.quick-match-card:not(:disabled)');
    const count = await cards.count();
    let matched = false;

    for (let i = 0; i < count && !matched; i += 1) {
      for (let j = i + 1; j < count && !matched; j += 1) {
        await waitMatchReady(page);
        const current = page.locator('.quick-match-card:not(:disabled)');
        if ((await current.count()) <= j) break;

        const first = current.nth(i);
        const firstText = await first.textContent();
        await first.click();

        const afterFirst = page.locator('.quick-match-card:not(:disabled)');
        if ((await afterFirst.count()) <= j) break;
        await afterFirst.nth(j).click();

        await waitMatchReady(page);
        matched = !(await page.locator('.quick-match-card:not(:disabled)').filter({ hasText: firstText || '' }).count());
      }
    }

    guard += 1;
    if (guard > 18) throw new Error('No se pudieron resolver las parejas');
  }
  await expect(page.locator('[data-quick-next]')).toBeVisible();
}

async function finishRound(page) {
  const next = page.locator('[data-quick-next]');
  if (await page.locator('.quick-match-card').count()) return solveMatch(page);

  if (await page.locator('.quick-input').count()) {
    const input = page.locator('.quick-input');
    await input.fill('__wrong__');
    await page.locator('[data-quick-check]').click();
    if (!(await next.isVisible())) {
      await input.fill('__wrong__');
      await page.locator('[data-quick-check]').click();
    }
    return expect(next).toBeVisible();
  }

  if (await page.locator('.quick-order-tray').count()) {
    for (let attempt = 0; attempt < 2 && !(await next.isVisible()); attempt += 1) {
      let guard = 0;
      while (await page.locator('.quick-token-bank .quick-token:not(:disabled)').count()) {
        await page.locator('.quick-token-bank .quick-token:not(:disabled)').first().click();
        if (++guard > 12) throw new Error('No se pudo completar el orden');
      }
      await page.locator('[data-quick-check]').click();
    }
    return expect(next).toBeVisible();
  }

  const choices = page.locator('.quick-choice:not(:disabled)');
  await expect(choices.first()).toBeVisible();
  await choices.first().click();
  if (!(await next.isVisible())) {
    await expect(choices.first()).toBeVisible();
    await choices.first().click();
  }
  await expect(next).toBeVisible();
}

async function advanceToNextRound(page, expectedCounter) {
  await page.locator('[data-quick-next]').click();
  await expect(page.locator('[data-quick-counter]')).toHaveText(expectedCounter);
}

test('los desafíos avanzan sin bloquearse en Windows Android e iPhone', async ({ page }) => {
  test.setTimeout(120_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/games.html?subject=math', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-quick-challenge-number]')).toHaveText('Desafío 1');
  await expect(page.locator('[data-quick-counter]')).toHaveText('1 / 5');

  for (let round = 0; round < 5; round += 1) {
    await finishRound(page);
    if (round < 4) {
      await advanceToNextRound(page, `${round + 2} / 5`);
    } else {
      await page.locator('[data-quick-next]').click();
    }
  }

  await expect(page.locator('[data-quick-result]')).toBeVisible();
  await expect(page.locator('[data-quick-next-challenge]')).toBeVisible();
  await page.locator('[data-quick-next-challenge]').click();
  await expect(page.locator('[data-quick-challenge-number]')).toHaveText('Desafío 2');
  await expect(page.locator('[data-quick-counter]')).toHaveText('1 / 5');
  await expect(page.locator('[data-quick-game]')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

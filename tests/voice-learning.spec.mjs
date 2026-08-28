import { test, expect } from '@playwright/test';

async function installSpeechMock(page) {
  await page.addInitScript(() => {
    window.__spokenLearning = [];
    class MockUtterance {
      constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
      }
    }
    const voices = [
      { lang: 'en-US', name: 'Premium English Natural', voiceURI: 'premium-natural', localService: true },
      { lang: 'en-US', name: 'Basic English', voiceURI: 'basic', localService: true },
      { lang: 'es-CL', name: 'Enhanced Catalina', voiceURI: 'enhanced-catalina', localService: true },
    ];
    const mock = {
      speaking: false,
      getVoices: () => voices,
      addEventListener() {},
      speak(utterance) {
        this.speaking = true;
        window.__spokenLearning.push({
          text: utterance.text,
          lang: utterance.lang,
          rate: utterance.rate,
          pitch: utterance.pitch,
          voice: utterance.voice?.name || ''
        });
        setTimeout(() => {
          this.speaking = false;
          utterance.onend?.();
        }, 0);
      },
      cancel() { this.speaking = false; },
    };
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockUtterance });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: mock });
  });
}

test('English offers clear and slow pronunciation with the best available voice', async ({ page }) => {
  await installSpeechMock(page);
  await page.goto('/english.html', { waitUntil: 'domcontentloaded' });
  await page.locator('#englishTopicGrid .english-topic-card').first().click();

  const clear = page.locator('[data-voice-english-question]');
  const slow = page.locator('[data-voice-english-slow]');
  await expect(clear).toBeVisible();
  await expect(slow).toBeVisible();
  await expect(clear).toContainText('Listen');
  await expect(slow).toContainText('Repeat slowly');

  await clear.click();
  await expect.poll(async () => page.evaluate(() => window.__spokenLearning.at(-1) || null)).toMatchObject({
    lang: 'en-US', voice: 'Premium English Natural', pitch: 1
  });
  const clearSpeech = await page.evaluate(() => window.__spokenLearning.at(-1));
  expect(clearSpeech.rate).toBeGreaterThanOrEqual(0.84);
  expect(clearSpeech.rate).toBeLessThanOrEqual(0.9);

  await slow.click();
  await expect.poll(async () => page.evaluate(() => window.__spokenLearning.at(-1)?.rate || 1)).toBeLessThan(clearSpeech.rate);
  const slowSpeech = await page.evaluate(() => window.__spokenLearning.at(-1));
  expect(slowSpeech.lang).toBe('en-US');
  expect(slowSpeech.voice).toBe('Premium English Natural');
  expect(slowSpeech.rate).toBeLessThanOrEqual(0.72);
});

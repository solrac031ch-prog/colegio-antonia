'use strict';

(() => {
  const synth = window.speechSynthesis;
  const supported = Boolean(synth && window.SpeechSynthesisUtterance);
  const subject = document.body?.dataset?.subject || '';
  let activeButton = null;
  let activeUtterance = null;

  function cleanText(value, lang = 'es-CL') {
    let text = String(value || '')
      .replace(/[🔊🔈🔉🔇⏹️▶️⭐✨💡🌱🎉🏆🔥⚡🎯🏅🧠📚🔬🌎🧮🇬🇧]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (lang.toLowerCase().startsWith('es')) {
      text = text
        .replace(/×/g, ' por ')
        .replace(/÷/g, ' dividido por ')
        .replace(/−/g, ' menos ')
        .replace(/\+/g, ' más ')
        .replace(/=/g, ' igual a ')
        .replace(/\b1\/2\b/g, 'un medio')
        .replace(/\b1\/3\b/g, 'un tercio')
        .replace(/\b1\/4\b/g, 'un cuarto')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return text;
  }

  function voiceFor(lang) {
    if (!supported || typeof synth.getVoices !== 'function') return null;
    const voices = synth.getVoices() || [];
    const wanted = lang.toLowerCase();
    const base = wanted.split('-')[0];
    return voices.find(voice => String(voice.lang || '').toLowerCase() === wanted)
      || voices.find(voice => String(voice.lang || '').toLowerCase().startsWith(`${base}-`))
      || voices.find(voice => String(voice.lang || '').toLowerCase().startsWith(base))
      || null;
  }

  function resetActiveButton() {
    if (!activeButton) return;
    activeButton.classList.remove('is-speaking');
    activeButton.textContent = activeButton.dataset.voiceLabel || '🔊 Escuchar';
    activeButton.setAttribute('aria-pressed', 'false');
    activeButton = null;
    activeUtterance = null;
  }

  function stopSpeech() {
    if (!supported) return;
    try { synth.cancel(); } catch {}
    resetActiveButton();
  }

  function speak(text, lang, button) {
    if (!supported) return;
    const prepared = cleanText(text, lang);
    if (!prepared) return;

    if (activeButton === button) {
      stopSpeech();
      return;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(prepared);
    utterance.lang = lang;
    utterance.rate = lang.toLowerCase().startsWith('en') ? 0.78 : 0.84;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = voiceFor(lang);
    if (voice) utterance.voice = voice;

    activeButton = button;
    activeUtterance = utterance;
    button.classList.add('is-speaking');
    button.textContent = '⏹ Detener';
    button.setAttribute('aria-pressed', 'true');

    utterance.onend = resetActiveButton;
    utterance.onerror = resetActiveButton;
    try { synth.speak(utterance); } catch { resetActiveButton(); }
  }

  function makeVoiceButton(label, lang, getText, extraClass = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `voice-button ${extraClass}`.trim();
    button.dataset.voiceLabel = label;
    button.dataset.voiceLang = lang;
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => speak(getText(), lang, button));
    return button;
  }

  function englishQuestionText() {
    const prompt = document.querySelector('#englishPrompt')?.textContent?.trim() || '';
    const question = document.querySelector('#englishQuestion')?.textContent?.trim() || '';
    if (!question) return prompt;
    if (!prompt || /elige|responde|completa|ordena/i.test(prompt)) return question;
    return `${prompt}. ${question}`;
  }

  function injectEnglishQuestionVoice() {
    if (!supported || subject !== 'english' || document.querySelector('[data-voice-english-question]')) return;
    const answers = document.querySelector('#englishAnswers');
    if (!answers) return;
    const row = document.createElement('div');
    row.className = 'voice-question-actions';
    const button = makeVoiceButton('🔊 Escuchar inglés', 'en-US', englishQuestionText, 'voice-english-button');
    button.dataset.voiceEnglishQuestion = 'true';
    row.appendChild(button);
    answers.insertAdjacentElement('beforebegin', row);
  }

  function explanationText(container) {
    const clone = container.cloneNode(true);
    clone.querySelectorAll('.voice-button, [data-voice-explanation]').forEach(node => node.remove());
    return clone.textContent || '';
  }

  function ensureExplanationVoice(container) {
    if (!supported || !container || container.querySelector('[data-voice-explanation]')) return;
    const text = explanationText(container).trim();
    if (text.length < 8) return;

    const button = makeVoiceButton('🔊 Escuchar explicación', 'es-CL', () => explanationText(container), 'voice-explanation-button');
    button.dataset.voiceExplanation = 'true';
    const wrap = document.createElement('div');
    wrap.className = 'voice-explanation-actions';
    wrap.appendChild(button);
    container.appendChild(wrap);
  }

  function explanationContainers() {
    return [
      '#feedback',
      '#englishFeedback',
      '#languageFeedback',
      '#scienceFeedback',
      '#historyFeedback',
      '[data-quick-feedback]'
    ].flatMap(selector => Array.from(document.querySelectorAll(selector)));
  }

  function scanExplanations() {
    explanationContainers().forEach(ensureExplanationVoice);
  }

  function initExplanationObserver() {
    if (!supported) return;
    scanExplanations();
    const observer = new MutationObserver(() => scanExplanations());
    explanationContainers().forEach(container => observer.observe(container, { childList: true, characterData: true, subtree: true }));
  }

  function init() {
    if (!supported) {
      document.documentElement.classList.add('voice-unavailable');
      return;
    }
    injectEnglishQuestionVoice();
    initExplanationObserver();
    if (typeof synth.getVoices === 'function') synth.getVoices();
  }

  window.addEventListener('pagehide', stopSpeech);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSpeech();
  });
  window.addEventListener('beforeunload', stopSpeech);

  init();
})();

'use strict';

(() => {
  const synth = window.speechSynthesis;
  const supported = Boolean(synth && window.SpeechSynthesisUtterance);
  const subject = document.body?.dataset?.subject || '';
  const gameSubject = subject === 'games' ? new URLSearchParams(window.location.search).get('subject') : '';
  const englishContext = subject === 'english' || gameSubject === 'english';
  let activeButton = null;
  let activeUtterance = null;
  let availableVoices = [];

  const labels = englishContext
    ? {
        listen: '🔊 Listen',
        slow: '🐢 Repeat slowly',
        explanation: '🔊 Listen to explanation',
        slowExplanation: '🐢 Repeat explanation slowly',
        stop: '⏹ Stop'
      }
    : {
        listen: '🔊 Escuchar',
        slow: '🐢 Repetir lento',
        explanation: '🔊 Escuchar explicación',
        slowExplanation: '🐢 Repetir explicación lento',
        stop: '⏹ Detener'
      };

  function refreshVoices() {
    if (!supported || typeof synth.getVoices !== 'function') return [];
    try {
      const voices = synth.getVoices() || [];
      if (voices.length) availableVoices = voices;
    } catch {
      // Si el navegador aún no entrega voces, usamos la voz predeterminada.
    }
    return availableVoices;
  }

  function cleanText(value, lang = 'es-CL') {
    let text = String(value || '')
      .replace(/[🔊🔈🔉🔇⏹️▶️⭐✨💡🌱🎉🏆🔥⚡🎯🏅🧠📚🔬🌎🧮🇬🇧🐢]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (lang.toLowerCase().startsWith('en')) {
      text = text
        .replace(/×/g, ' times ')
        .replace(/÷/g, ' divided by ')
        .replace(/−/g, ' minus ')
        .replace(/\+/g, ' plus ')
        .replace(/=/g, ' equals ')
        .replace(/\b1\/2\b/g, 'one half')
        .replace(/\b1\/3\b/g, 'one third')
        .replace(/\b1\/4\b/g, 'one quarter');
    } else {
      text = text
        .replace(/×/g, ' por ')
        .replace(/÷/g, ' dividido por ')
        .replace(/−/g, ' menos ')
        .replace(/\+/g, ' más ')
        .replace(/=/g, ' igual a ')
        .replace(/\b1\/2\b/g, 'un medio')
        .replace(/\b1\/3\b/g, 'un tercio')
        .replace(/\b1\/4\b/g, 'un cuarto');
    }

    return text.replace(/\s+/g, ' ').trim();
  }

  function scoreVoice(voice, lang) {
    const voiceLang = String(voice.lang || '').toLowerCase();
    const wanted = lang.toLowerCase();
    const base = wanted.split('-')[0];
    if (!voiceLang.startsWith(base)) return -1000;

    let score = voiceLang === wanted ? 120 : 70;
    const descriptor = `${String(voice.name || '')} ${String(voice.voiceURI || '')}`.toLowerCase();
    const qualityTerms = [
      ['premium', 260], ['enhanced', 245], ['natural', 235], ['neural', 235], ['siri', 205],
      ['ava', 175], ['samantha', 170], ['allison', 165], ['serena', 162], ['daniel', 160],
      ['karen', 155], ['moira', 150], ['tessa', 148], ['aaron', 145], ['nicky', 145],
      ['google us english', 175], ['google uk english', 165],
      ['microsoft aria', 180], ['microsoft jenny', 180], ['microsoft guy', 165],
      ['catalina', 175], ['paulina', 165], ['monica', 160], ['mónica', 160],
      ['google español', 155], ['google spanish', 155]
    ];
    qualityTerms.forEach(([term, points]) => {
      if (descriptor.includes(term)) score += points;
    });

    const noveltyTerms = [
      'bells', 'boing', 'bubbles', 'cellos', 'organ', 'trinoids', 'whisper', 'zarvox',
      'bad news', 'good news', 'bahh', 'jester', 'wobble'
    ];
    if (noveltyTerms.some(term => descriptor.includes(term))) score -= 600;
    if (voice.localService) score += 25;
    if (voice.default) score += 8;
    return score;
  }

  function voiceFor(lang) {
    if (!supported) return null;
    const voices = availableVoices.length ? availableVoices : refreshVoices();
    return voices
      .map(voice => ({ voice, score: scoreVoice(voice, lang) }))
      .filter(item => item.score > -1000)
      .sort((a, b) => b.score - a.score)[0]?.voice || null;
  }

  function resetButton(button) {
    if (!button) return;
    button.classList.remove('is-speaking');
    button.textContent = button.dataset.voiceLabel || labels.listen;
    button.setAttribute('aria-pressed', 'false');
  }

  function finishUtterance(utterance, button) {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    activeButton = null;
    resetButton(button);
  }

  function stopSpeech() {
    if (!supported) return;
    const previousButton = activeButton;
    activeButton = null;
    activeUtterance = null;
    try { synth.cancel(); } catch {}
    resetButton(previousButton);
  }

  function speechRate(text, lang, options = {}) {
    const isEnglish = lang.toLowerCase().startsWith('en');
    if (!isEnglish) return options.slow ? 0.8 : 0.92;

    const wordCount = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    if (options.slow) return wordCount <= 2 ? 0.66 : 0.72;
    return wordCount <= 2 ? 0.84 : 0.9;
  }

  function speakText(text, lang = 'es-CL', button = null, options = {}) {
    if (!supported) return false;
    const prepared = cleanText(text, lang);
    if (!prepared) return false;

    if (button && activeButton === button) {
      stopSpeech();
      return true;
    }

    stopSpeech();
    refreshVoices();
    const utterance = new SpeechSynthesisUtterance(prepared);
    utterance.lang = lang;
    utterance.rate = speechRate(prepared, lang, options);
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = voiceFor(lang);
    if (voice) utterance.voice = voice;

    activeButton = button;
    activeUtterance = utterance;
    if (button) {
      button.classList.add('is-speaking');
      button.textContent = labels.stop;
      button.setAttribute('aria-pressed', 'true');
    }

    utterance.onend = () => finishUtterance(utterance, button);
    utterance.onerror = () => finishUtterance(utterance, button);
    try {
      synth.speak(utterance);
      return true;
    } catch {
      finishUtterance(utterance, button);
      return false;
    }
  }

  function makeVoiceButton(label, lang, getText, extraClass = '', options = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `voice-button ${extraClass}`.trim();
    button.dataset.voiceLabel = label;
    button.dataset.voiceLang = lang;
    button.dataset.voiceSpeed = options.slow ? 'slow' : 'clear';
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => speakText(getText(), lang, button, options));
    return button;
  }

  function englishQuestionText() {
    const prompt = document.querySelector('#englishPrompt')?.textContent?.trim() || '';
    const question = document.querySelector('#englishQuestion')?.textContent?.trim() || '';
    return [prompt, question].filter(Boolean).join('. ');
  }

  function injectEnglishQuestionVoice() {
    if (!supported || subject !== 'english' || document.querySelector('[data-voice-english-question]')) return;
    const answers = document.querySelector('#englishAnswers');
    if (!answers) return;

    const row = document.createElement('div');
    row.className = 'voice-question-actions';

    const listenButton = makeVoiceButton(labels.listen, 'en-US', englishQuestionText, 'voice-english-button');
    listenButton.dataset.voiceEnglishQuestion = 'true';

    const slowButton = makeVoiceButton(labels.slow, 'en-US', englishQuestionText, 'voice-slow-button', { slow: true });
    slowButton.dataset.voiceEnglishSlow = 'true';

    row.append(listenButton, slowButton);
    answers.insertAdjacentElement('beforebegin', row);
  }

  function explanationText(container) {
    const clone = container.cloneNode(true);
    clone.querySelectorAll('.voice-button, .voice-explanation-actions').forEach(node => node.remove());
    return clone.textContent || '';
  }

  function ensureExplanationVoice(container) {
    if (!supported || !container || container.querySelector('[data-voice-explanation]')) return;
    const text = explanationText(container).trim();
    if (text.length < 8) return;

    const lang = englishContext ? 'en-US' : 'es-CL';
    const wrap = document.createElement('div');
    wrap.className = 'voice-explanation-actions';

    const listenButton = makeVoiceButton(labels.explanation, lang, () => explanationText(container), 'voice-explanation-button');
    listenButton.dataset.voiceExplanation = 'true';
    wrap.appendChild(listenButton);

    if (englishContext) {
      const slowButton = makeVoiceButton(labels.slowExplanation, lang, () => explanationText(container), 'voice-explanation-button voice-slow-button', { slow: true });
      slowButton.dataset.voiceExplanationSlow = 'true';
      wrap.appendChild(slowButton);
    }

    container.appendChild(wrap);
  }

  function explanationContainers() {
    return ['#feedback', '#englishFeedback', '#languageFeedback', '#scienceFeedback', '#historyFeedback', '[data-quick-feedback]']
      .flatMap(selector => Array.from(document.querySelectorAll(selector)));
  }

  function initExplanationObservers() {
    if (!supported) return;
    explanationContainers().forEach(container => {
      let scheduled = false;
      const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          ensureExplanationVoice(container);
        });
      };
      ensureExplanationVoice(container);
      const observer = new MutationObserver(schedule);
      observer.observe(container, { childList: true, characterData: true, subtree: true });
    });
  }

  function init() {
    if (!supported) {
      document.documentElement.classList.add('voice-unavailable');
      return;
    }

    refreshVoices();
    try {
      if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
      else synth.onvoiceschanged = refreshVoices;
    } catch {}

    injectEnglishQuestionVoice();
    initExplanationObservers();
  }

  window.AppVoice = {
    speakText: (text, lang = 'es-CL', options = {}) => speakText(text, lang, null, options),
    stop: stopSpeech,
    bestVoiceName: lang => voiceFor(lang)?.name || '',
    refreshVoices,
  };

  window.addEventListener('pagehide', stopSpeech);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
  init();
})();

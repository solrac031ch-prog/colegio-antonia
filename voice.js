'use strict';

(() => {
  const synth = window.speechSynthesis;
  const supported = Boolean(synth && window.SpeechSynthesisUtterance);
  const subject = document.body?.dataset?.subject || '';
  const gameSubject = subject === 'games' ? new URLSearchParams(window.location.search).get('subject') : '';
  const englishContext = subject === 'english' || gameSubject === 'english';
  let activeButton = null;
  let activeUtterance = null;

  const labels = englishContext
    ? { listen: '🔊 Listen', explanation: '🔊 Listen to explanation', stop: '⏹ Stop' }
    : { listen: '🔊 Escuchar', explanation: '🔊 Escuchar explicación', stop: '⏹ Detener' };

  function cleanText(value, lang = 'es-CL') {
    let text = String(value || '')
      .replace(/[🔊🔈🔉🔇⏹️▶️⭐✨💡🌱🎉🏆🔥⚡🎯🏅🧠📚🔬🌎🧮🇬🇧]/gu, ' ')
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

    let score = voiceLang === wanted ? 80 : 45;
    const name = String(voice.name || '').toLowerCase();
    const premiumTerms = [
      ['premium', 160], ['enhanced', 150], ['natural', 140], ['neural', 140],
      ['siri', 120], ['samantha', 110], ['ava', 108], ['serena', 104],
      ['daniel', 100], ['karen', 98], ['moira', 96], ['tessa', 94],
      ['google us english', 105], ['google uk english', 100],
      ['microsoft aria', 105], ['microsoft jenny', 105], ['microsoft guy', 95],
      ['catalina', 105], ['paulina', 100], ['monica', 95], ['mónica', 95],
      ['google español', 95], ['google spanish', 95]
    ];
    premiumTerms.forEach(([term, points]) => { if (name.includes(term)) score += points; });

    const noveltyTerms = ['bells', 'boing', 'bubbles', 'cellos', 'organ', 'trinoids', 'whisper', 'zarvox', 'bad news', 'good news'];
    if (noveltyTerms.some(term => name.includes(term))) score -= 400;
    if (voice.localService) score += 12;
    if (voice.default) score += 5;
    return score;
  }

  function voiceFor(lang) {
    if (!supported || typeof synth.getVoices !== 'function') return null;
    const voices = synth.getVoices() || [];
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

  function speakText(text, lang = 'es-CL', button = null) {
    if (!supported) return false;
    const prepared = cleanText(text, lang);
    if (!prepared) return false;

    if (button && activeButton === button) {
      stopSpeech();
      return true;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(prepared);
    utterance.lang = lang;
    utterance.rate = lang.toLowerCase().startsWith('en') ? 0.95 : 0.98;
    utterance.pitch = 1.02;
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

  function makeVoiceButton(label, lang, getText, extraClass = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `voice-button ${extraClass}`.trim();
    button.dataset.voiceLabel = label;
    button.dataset.voiceLang = lang;
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => speakText(getText(), lang, button));
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
    const button = makeVoiceButton('🔊 Listen', 'en-US', englishQuestionText, 'voice-english-button');
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

    const lang = englishContext ? 'en-US' : 'es-CL';
    const button = makeVoiceButton(labels.explanation, lang, () => explanationText(container), 'voice-explanation-button');
    button.dataset.voiceExplanation = 'true';
    const wrap = document.createElement('div');
    wrap.className = 'voice-explanation-actions';
    wrap.appendChild(button);
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
    if (typeof synth.getVoices === 'function') synth.getVoices();
    injectEnglishQuestionVoice();
    initExplanationObservers();
  }

  window.AppVoice = {
    speakText: (text, lang = 'es-CL') => speakText(text, lang, null),
    stop: stopSpeech,
    bestVoiceName: lang => voiceFor(lang)?.name || '',
  };

  window.addEventListener('pagehide', stopSpeech);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
  init();
})();

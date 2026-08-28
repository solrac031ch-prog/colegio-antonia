(() => {
  let renderToken = 0;

  function isCurrent(question, index, token) {
    return token === renderToken &&
      index === state.questionIndex &&
      state.questions[index] === question;
  }

  function syncedFinishAnswer(question, index, token) {
    if (!isCurrent(question, index, token)) return;

    const buttons = [...els.answers.querySelectorAll('.answer-button')];
    state.answered = true;

    buttons.forEach(button => {
      button.disabled = true;
      if (button.dataset.value === question.correct) button.classList.add('correct');
    });

    progress.bestStreak = Math.max(progress.bestStreak, state.streak);
    saveProgress();
    els.streak.textContent = state.streak;
    els.nextButton.textContent = state.questionIndex === 9 ? 'Ver resultado 🌟' : 'Siguiente →';
    els.nextButton.classList.remove('hidden');
  }

  function syncedAnswer(question, index, token, value, selectedButton) {
    if (!isCurrent(question, index, token)) {
      renderQuestion();
      return;
    }
    if (state.answered || selectedButton.disabled) return;

    if (String(value) === question.correct) {
      selectedButton.classList.add('correct');
      state.score += 1;
      state.streak += 1;
      progress.stars += 1;

      if (state.attempts === 1) {
        showFeedback(
          'success',
          `<div class="feedback-heading success-heading"><div><strong>🌟 ¡Eso, Antonia!</strong><span>Lo miraste y lo corregiste.</span></div></div>
           <div class="feedback-mini-equation">${question.summary}</div>
           <div class="feedback-action">¡Muy bien! 💛</div>`,
          true
        );
      } else {
        const message = state.streak >= 3 ? '🔥 ¡Excelente racha, Antonia!' : '✨ ¡Muy bien, Antonia!';
        showFeedback(
          'success',
          `<div class="feedback-heading success-heading"><div><strong>${message}</strong><span>${question.summary}</span></div></div>`,
          true
        );
      }

      syncedFinishAnswer(question, index, token);
      return;
    }

    selectedButton.classList.add('wrong');
    selectedButton.disabled = true;

    if (state.attempts === 0) {
      state.attempts = 1;
      showFeedback('hint', learningCard(question, false));
      return;
    }

    state.attempts = 2;
    state.streak = 0;
    showFeedback('gentle', learningCard(question, true));
    syncedFinishAnswer(question, index, token);
  }

  window.renderQuestion = function() {
    const index = state.questionIndex;
    const question = state.questions[index];
    if (!question) return;

    const token = ++renderToken;
    state.answered = false;
    state.attempts = 0;

    els.questionCounter.textContent = `${index + 1} / 10`;
    els.questionPrompt.textContent = question.prompt;
    els.question.textContent = question.display;
    els.question.classList.toggle(
      'question-text',
      question.textMode || String(question.display).length > 18 || String(question.display).includes('\n')
    );
    els.streak.textContent = state.streak;
    resetFeedback();
    els.nextButton.classList.add('hidden');
    els.answers.innerHTML = '';

    question.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'answer-button';
      button.type = 'button';
      button.textContent = option;
      button.dataset.value = String(option);
      button.dataset.questionToken = String(token);
      button.addEventListener('click', () => syncedAnswer(question, index, token, option, button));
      els.answers.appendChild(button);
    });
  };
})();

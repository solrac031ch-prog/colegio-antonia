'use strict';

(() => {
  const backButton = document.querySelector('[data-app-back]');
  if (backButton) {
    backButton.addEventListener('click', () => {
      const fallback = backButton.dataset.fallback || 'index.html';
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = fallback;
      }
    });
  }

  const resetButton = document.querySelector('[data-reset-progress]');
  if (!resetButton) return;

  resetButton.classList.add('secondary-button');
  resetButton.style.marginTop = '12px';
  resetButton.style.background = '#f3f0f7';
  resetButton.style.color = '#6b5b76';
  resetButton.style.boxShadow = 'none';

  const row = resetButton.closest('.progress-reset-row');
  if (row) {
    row.style.marginTop = '7px';
    row.style.paddingTop = '7px';
    row.style.borderTop = '1px solid #ede9fe';
  }

  resetButton.addEventListener('click', () => {
    const storageKey = resetButton.dataset.storageKey;
    const subjectName = resetButton.dataset.subjectName || 'esta asignatura';
    if (!storageKey) return;

    const confirmed = window.confirm(`¿Reiniciar el progreso de ${subjectName}?\n\nLas estrellas, sesiones y mejor racha volverán a 0. Esta acción no afecta las otras asignaturas.`);
    if (!confirmed) return;

    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Si el navegador bloquea el almacenamiento, recargamos igualmente.
    }

    window.location.reload();
  });
})();

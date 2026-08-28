'use strict';

(() => {
  const resetButton = document.querySelector('[data-reset-progress]');
  if (!resetButton) return;

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

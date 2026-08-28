'use strict';

(() => {
  const subject = document.body?.dataset?.subject || '';
  const gameSubject = subject === 'games' ? new URLSearchParams(window.location.search).get('subject') : '';
  const englishContext = subject === 'english' || gameSubject === 'english';

  if ('serviceWorker' in navigator) {
    const registerWorker = () => navigator.serviceWorker.register('./sw.js').catch(() => {});
    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(registerWorker, { timeout: 2200 });
      else setTimeout(registerWorker, 700);
    }, { once: true });
  }

  function getAppRootPath() {
    try { return new URL('./', window.location.href).pathname; } catch { return '/'; }
  }

  function hasInternalReferrer() {
    if (!document.referrer) return false;
    try {
      const referrer = new URL(document.referrer);
      return referrer.origin === window.location.origin && referrer.pathname.startsWith(getAppRootPath());
    } catch {
      return false;
    }
  }

  const backButton = document.querySelector('[data-app-back]');
  if (backButton) {
    backButton.addEventListener('click', () => {
      const fallback = backButton.dataset.fallback || 'index.html';
      if (window.history.length > 1 && hasInternalReferrer()) window.history.back();
      else window.location.assign(fallback);
    });
  }

  let connectionStatus = null;
  function updateConnectionStatus() {
    if (navigator.onLine) {
      connectionStatus?.remove();
      connectionStatus = null;
      return;
    }
    if (connectionStatus) return;
    connectionStatus = document.createElement('div');
    connectionStatus.className = 'connection-status';
    connectionStatus.setAttribute('role', 'status');
    connectionStatus.textContent = englishContext
      ? '📴 Offline · you can keep using saved content.'
      : '📴 Sin conexión · puedes seguir usando el contenido guardado.';
    document.body.appendChild(connectionStatus);
  }

  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  updateConnectionStatus();

  let runtimeErrorShown = false;
  function showRuntimeError() {
    if (runtimeErrorShown) return;
    runtimeErrorShown = true;
    const main = document.querySelector('main');
    if (!main) return;
    const notice = document.createElement('section');
    notice.className = 'panel runtime-error';
    notice.setAttribute('role', 'alert');
    notice.innerHTML = englishContext
      ? '<h2>Something did not load correctly</h2><p>Your progress is saved. Reload the app to continue.</p><button class="secondary-button" type="button" data-runtime-reload>↻ Reload</button>'
      : '<h2>Algo no cargó bien</h2><p>El progreso está guardado. Recarga la app para continuar.</p><button class="secondary-button" type="button" data-runtime-reload>↻ Recargar</button>';
    notice.querySelector('[data-runtime-reload]')?.addEventListener('click', () => window.location.reload());
    main.prepend(notice);
  }

  window.addEventListener('error', event => {
    const target = event.target;
    if (target instanceof HTMLScriptElement || target instanceof HTMLLinkElement) showRuntimeError();
  }, true);
  window.addEventListener('unhandledrejection', showRuntimeError);

  const resetAllButton = document.querySelector('[data-reset-all-progress]');
  if (resetAllButton) {
    resetAllButton.addEventListener('click', () => {
      const confirmed = window.confirm('¿Reiniciar TODO el progreso?\n\nSe borrarán XP, racha, nivel, meta diaria, estrellas, sesiones y avance de Matemáticas, Inglés, Lenguaje, Ciencias e Historia.\n\nEsta acción no se puede deshacer.');
      if (!confirmed) return;
      const appStorageKeys = [
        'aprende3GameProgress', 'antoniaMathProgress', 'antoniaEnglishProgress',
        'antoniaLanguageProgress', 'antoniaScienceProgress', 'antoniaHistoryProgress',
      ];
      try { appStorageKeys.forEach(key => localStorage.removeItem(key)); } catch {}
      window.location.reload();
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
    const subjectName = resetButton.dataset.subjectName || (englishContext ? 'this subject' : 'esta asignatura');
    if (!storageKey) return;

    const confirmed = window.confirm(englishContext
      ? `Reset ${subjectName} progress?\n\nStars, sessions and best streak will return to 0. Other subjects will not be affected.`
      : `¿Reiniciar el progreso de ${subjectName}?\n\nLas estrellas, sesiones y mejor racha volverán a 0. Esta acción no afecta las otras asignaturas.`);
    if (!confirmed) return;

    try { localStorage.removeItem(storageKey); } catch {}
    window.location.reload();
  });
})();

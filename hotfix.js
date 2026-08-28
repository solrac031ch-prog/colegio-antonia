(() => {
  const topicKeys = [
    'numbers',
    'addition',
    'subtraction',
    'fractions',
    'shapes',
    'data',
    'multiplication',
    'division',
    'measurement',
    'time',
    'position'
  ];

  // Safari/iPhone puede quedar en una posición de scroll inválida al cambiar
  // desde una portada larga hacia una vista corta. Forzamos el salto al inicio.
  window.showView = function(view) {
    const views = [
      document.querySelector('#homeView'),
      document.querySelector('#moduleView'),
      document.querySelector('#quizView'),
      document.querySelector('#resultView')
    ].filter(Boolean);

    views.forEach(element => element.classList.remove('active'));
    if (view) view.classList.add('active');

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  // Respaldo táctil: garantiza que las 11 tarjetas respondan aunque WebKit
  // pierda el listener original después de una actualización de la PWA.
  document.addEventListener('click', event => {
    const card = event.target.closest('.topic-card');
    if (!card) return;

    const cards = Array.from(document.querySelectorAll('.topic-card'));
    const index = cards.indexOf(card);
    const key = topicKeys[index];
    if (!key || typeof window.openTopic !== 'function') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    window.openTopic(key);
  }, true);

  document.querySelectorAll('.topic-card').forEach(card => {
    card.style.touchAction = 'manipulation';
    card.style.webkitTapHighlightColor = 'rgba(124,58,237,.12)';
  });
})();
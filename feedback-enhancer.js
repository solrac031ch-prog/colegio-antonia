'use strict';

(() => {
  const path = window.location.pathname.toLowerCase();
  const subject = path.endsWith('/language.html') ? 'language' : path.endsWith('/science.html') ? 'science' : path.endsWith('/history.html') ? 'history' : null;
  if (!subject) return;

  const config = {
    language: { feedback: '#languageFeedback', mode: '#languageModeLabel' },
    science: { feedback: '#scienceFeedback', mode: '#scienceModeLabel' },
    history: { feedback: '#historyFeedback', mode: '#historyModeLabel' },
  }[subject];

  const strategies = {
    language: [
      { match: ['comprensión'], title: 'Cómo razonarlo', steps: ['Lee primero la pregunta y luego vuelve al texto.', 'Busca una frase o palabra que sirva como evidencia y compárala con cada alternativa.'] },
      { match: ['vocabulario'], title: 'Cómo razonarlo', steps: ['Prueba reemplazar la palabra por cada alternativa dentro de la oración.', 'Elige la opción que conserva el sentido de la idea.'] },
      { match: ['ortografía'], title: 'Cómo razonarlo', steps: ['Lee la palabra lentamente por sílabas.', 'Fíjate en la letra o regla que cambia entre las opciones y descarta las formas que no corresponden.'] },
      { match: ['gramática'], title: 'Cómo razonarlo', steps: ['Pregunta qué función cumple cada palabra: nombra, describe o expresa una acción.', 'Después identifica si es sustantivo, adjetivo, verbo u otra categoría.'] },
      { match: ['escritura'], title: 'Cómo razonarlo', steps: ['Lee la oración completa en voz baja.', 'Comprueba que tenga sentido, orden lógico, mayúscula inicial y cierre adecuado.'] },
      { match: ['repaso'], title: 'Cómo razonarlo', steps: ['Identifica primero qué habilidad está preguntando el ejercicio.', 'Luego aplica la estrategia correspondiente: buscar evidencia, reconocer una regla o revisar el sentido de la oración.'] },
    ],
    science: [
      { match: ['seres vivos'], title: 'Cómo razonarlo', steps: ['Relaciona cada estructura o necesidad con su función.', 'Piensa qué necesita el ser vivo para crecer, obtener energía o sobrevivir.'] },
      { match: ['cuerpo'], title: 'Cómo razonarlo', steps: ['Identifica primero la función que menciona la pregunta.', 'Después busca el órgano, sentido o hábito que cumple exactamente esa función.'] },
      { match: ['materiales', 'materia'], title: 'Cómo razonarlo', steps: ['Observa propiedades como forma, flujo, dureza, transparencia o respuesta al calor.', 'Compara esas propiedades con las opciones antes de elegir.'] },
      { match: ['fuerzas', 'movimiento'], title: 'Cómo razonarlo', steps: ['Busca la causa y el efecto: qué fuerza se aplica y qué cambia.', 'Una fuerza puede iniciar, detener, acelerar, frenar o cambiar la dirección del movimiento.'] },
      { match: ['tierra', 'ambiente'], title: 'Cómo razonarlo', steps: ['Ubica el fenómeno dentro de agua, aire, clima o cuidado ambiental.', 'Relaciona la observación con lo que ocurre en la naturaleza y sus consecuencias.'] },
      { match: ['repaso'], title: 'Cómo razonarlo', steps: ['Identifica primero el tema científico de la pregunta.', 'Piensa en causa, función, propiedad o cambio antes de mirar las alternativas.'] },
    ],
    history: [
      { match: ['mapas', 'ubicación'], title: 'Cómo razonarlo', steps: ['Ubica primero norte, sur, este y oeste o identifica qué elemento del mapa se está usando.', 'Luego aplica la leyenda, la escala o la orientación según corresponda.'] },
      { match: ['clima', 'paisajes'], title: 'Cómo razonarlo', steps: ['Distingue entre tiempo atmosférico de un día y clima de un lugar durante muchos años.', 'Relaciona temperatura, lluvias, relieve y formas de adaptación de las personas.'] },
      { match: ['grecia', 'roma'], title: 'Cómo razonarlo', steps: ['Primero identifica si la pregunta habla de Grecia o Roma.', 'Después relaciona lugar, vida cotidiana, organización o legado con esa civilización.'] },
      { match: ['sociedad'], title: 'Cómo razonarlo', steps: ['Piensa qué opción ayuda a organizar la comunidad y convivir mejor.', 'Busca ideas de colaboración, normas, servicios y cuidado de espacios compartidos.'] },
      { match: ['ciudadanía'], title: 'Cómo razonarlo', steps: ['Distingue entre un derecho, una responsabilidad y una acción respetuosa.', 'Elige la opción que protege a las personas y favorece el bien común.'] },
      { match: ['repaso'], title: 'Cómo razonarlo', steps: ['Identifica si la pregunta trata de ubicación, ambiente, sociedades antiguas o ciudadanía.', 'Usa esa categoría para descartar alternativas que pertenecen a otro tema.'] },
    ],
  };

  const feedback = document.querySelector(config.feedback);
  const mode = document.querySelector(config.mode);
  if (!feedback || !mode) return;

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function selectStrategy() {
    const label = normalize(mode.textContent);
    return strategies[subject].find(item => item.match.some(word => label.includes(normalize(word)))) || strategies[subject][strategies[subject].length - 1];
  }

  function enhance() {
    if (!feedback.children.length || feedback.querySelector('.learning-explanation')) return;
    const strategy = selectStrategy();
    const box = document.createElement('div');
    box.className = 'learning-explanation';
    const heading = document.createElement('strong');
    heading.className = 'learning-explanation-title';
    heading.textContent = `🧠 ${strategy.title}`;
    box.appendChild(heading);
    const list = document.createElement('ol');
    list.className = 'learning-explanation-steps';
    strategy.steps.forEach(step => {
      const item = document.createElement('li');
      item.textContent = step;
      list.appendChild(item);
    });
    box.appendChild(list);
    feedback.appendChild(box);
  }

  new MutationObserver(enhance).observe(feedback, { childList: true, subtree: true });
  enhance();
})();

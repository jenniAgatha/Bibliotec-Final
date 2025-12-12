window.addEventListener('load', function () {
  const container = document.getElementById('caroussel-books');
  const prev = document.getElementById('prev-btn');
  const next = document.getElementById('next-btn');

  const originals = [...container.querySelectorAll('.books')];
  originals.forEach(item => {
    container.appendChild(item.cloneNode(true));
  });

  function getStep() {
    const first = container.querySelector('.books');
    if (!first) return 260;
    const width = first.getBoundingClientRect().width;
    const gap = parseInt(getComputedStyle(container).gap) || 20;
    return Math.round(width + gap);
  }

  const step = getStep();

  next.addEventListener('click', () => {
    container.scrollBy({ left: step, behavior: 'smooth' });
  });

  prev.addEventListener('click', () => {
    container.scrollBy({ left: -step, behavior: 'smooth' });
  });

  container.addEventListener('scroll', () => {
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft >= maxScroll - step) {
      container.scrollLeft = 0;
    }

    if (container.scrollLeft <= 0) {
      container.scrollLeft = maxScroll - step;
    }
  });
});




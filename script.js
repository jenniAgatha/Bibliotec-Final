window.addEventListener('load', function () {
  const container = document.getElementById('caroussel-books');
  const prev = document.getElementById('prev-btn');
  const next = document.getElementById('next-btn');

  // calcula passo: largura de um item (books) + gap aproximado
  function getStep() {
    const first = container.querySelector('.books');
    if (!first) return 260;
    const style = window.getComputedStyle(first);
    const width = first.getBoundingClientRect().width;
    const gap = parseInt(getComputedStyle(container).gap) || 20;
    return Math.round(width + gap);
  }

  next.addEventListener('click', () => {
    container.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  prev.addEventListener('click', () => {
    container.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  // opcional: desativar botão quando alcance início/fim
  function updateButtons() {
    const maxScroll = container.scrollWidth - container.clientWidth;
    prev.disabled = container.scrollLeft <= 5;
    next.disabled = container.scrollLeft >= maxScroll - 5;
    prev.style.opacity = prev.disabled ? '0.45' : '1';
    next.style.opacity = next.disabled ? '0.45' : '1';
    prev.style.cursor = prev.disabled ? 'default' : 'pointer';
    next.style.cursor = next.disabled ? 'default' : 'pointer';
  }

  container.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();
});

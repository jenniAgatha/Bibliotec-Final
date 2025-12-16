// ...existing code...
(function(){
  const track = document.getElementById('caroussel-books');
  const prev = document.getElementById('prev-btn');
  const next = document.getElementById('next-btn');
  if(!track || !prev || !next){ console.warn('carousel: elementos não encontrados'); return; }

  const slideSize = ()=> {
    const card = track.querySelector('.books');
    return card ? card.offsetWidth + 12 : Math.floor(track.clientWidth * 0.8);
  };

  prev.addEventListener('click', ()=> track.scrollBy({ left: -slideSize(), behavior: 'smooth' }) );
  next.addEventListener('click', ()=> track.scrollBy({ left: slideSize(), behavior: 'smooth' }) );

  function updateButtons(){
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  }
  track.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();

  // suporte a arrastar (mouse / touch)
  let isDown=false, startX=0, startScroll=0;
  track.addEventListener('pointerdown', (e)=>{
    isDown = true;
    track.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', (e)=>{
    if(!isDown) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startScroll - dx;
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>{
    track.addEventListener(ev, ()=>{
      isDown = false;
      track.classList.remove('dragging');
    });
  });
})();

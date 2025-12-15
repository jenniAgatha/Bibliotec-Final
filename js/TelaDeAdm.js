const caroussel = document.getElementById('caroussel-books');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const scrollAmount = 240; // Distância de cada movimento
const intervalTime = 5000; // Tempo em milissegundos (5 segundos)
let autoPlayInterval;

// Função para mover para a direita
function moveNext() {
    const maxScroll = caroussel.scrollWidth - caroussel.clientWidth;
    
    // Se chegar ao fim, volta para o início, senão avança
    if (caroussel.scrollLeft >= maxScroll - 5) {
        caroussel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        caroussel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Função para mover para a esquerda
function movePrev() {
    if (caroussel.scrollLeft <= 0) {
        const maxScroll = caroussel.scrollWidth - caroussel.clientWidth;
        caroussel.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
        caroussel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
}

// Inicia o Auto-play
function startAutoPlay() {
    autoPlayInterval = setInterval(moveNext, intervalTime);
}

// Para o Auto-play (usado quando o utilizador clica nos botões)
function stopAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay(); // Reinicia o contador para não saltar logo a seguir ao clique
}

// Eventos dos botões
nextBtn.addEventListener('click', () => {
    moveNext();
    stopAutoPlay();
});

prevBtn.addEventListener('click', () => {
    movePrev();
    stopAutoPlay();
});

// Pausa o carrossel se o rato estiver por cima (opcional, melhora a experiência)
caroussel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
caroussel.addEventListener('mouseleave', startAutoPlay);

// Inicia o ciclo ao carregar a página
startAutoPlay();
// nossosLivros.js - Carrega e exibe os livros cadastrados

const API_URL = 'http://localhost:3000/livros';
let livroAtualId = null; // Para armazenar o ID do livro atual no modal

// Função para mostrar detalhes do livro
function mostrarDetalhes(id) {
    livroAtualId = id; // Armazenar ID
    // Buscar detalhes do livro (assumindo que temos a lista carregada)
    // Para simplificar, buscar novamente ou armazenar em variável global
    fetch(`${API_URL}/${id}`)
        .then(response => response.json())
        .then(livro => {
            const capaUrl = livro.caminho_capa || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'%3E%3Crect fill='%23667eea' width='150' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='50' fill='white'%3E📖%3C/text%3E%3C/svg%3E";
            const details = `
                <img src="${capaUrl}" alt="${livro.titulo}">
                <h2>${livro.titulo}</h2>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                ${livro.genero ? `<p><strong>Gênero:</strong> ${livro.genero}</p>` : ''}
                ${livro.ano_publicacao ? `<p><strong>Ano de Publicação:</strong> ${livro.ano_publicacao}</p>` : ''}
                ${livro.editora ? `<p><strong>Editora:</strong> ${livro.editora}</p>` : ''}
                ${livro.isbn ? `<p><strong>ISBN:</strong> ${livro.isbn}</p>` : ''}
                ${livro.sinopse ? `<p><strong>Sinopse:</strong> ${livro.sinopse}</p>` : ''}
            `;
            document.getElementById('bookDetails').innerHTML = details;
            document.getElementById('bookModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao buscar detalhes:', error);
        });
}

// Função para fechar modal
function fecharModal() {
    document.getElementById('bookModal').style.display = 'none';
}

// Função para reservar livro
async function reservarLivro() {
    if (!livroAtualId) {
        console.error('Nenhum livro selecionado');
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert('Faça login para reservar livros!');
        return;
    }

    // Definir datas: retirada hoje, devolução em 15 dias
    const hoje = new Date();
    const devolucao = new Date();
    devolucao.setDate(hoje.getDate() + 15);

    const reserva = {
        usuario_id: usuario.id,
        livro_id: livroAtualId,
        data_retirada: hoje.toISOString().split('T')[0],
        data_devolucao: devolucao.toISOString().split('T')[0],
        confirmado_email: false
    };

    try {
        const response = await fetch('http://localhost:3000/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
        });

        if (response.ok) {
            alert('Reserva realizada com sucesso!');
            fecharModal();
        } else {
            const error = await response.json();
            alert('Erro: ' + error.error);
        }
    } catch (error) {
        console.error('Erro ao reservar:', error);
        alert('Erro ao conectar com o servidor');
    }
}

// Event listeners para modal
document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();

    // Fechar modal ao clicar no X
    document.querySelector('.close').addEventListener('click', fecharModal);

    // Fechar modal ao clicar fora
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('bookModal');
        if (event.target === modal) {
            fecharModal();
        }
    });

    // Botão reservar
    document.getElementById('reserveBtn').addEventListener('click', reservarLivro);
});

// Função para carregar livros
async function carregarLivros() {
    const container = document.getElementById('booksList');
    container.innerHTML = '<div class="loading">Carregando livros...</div>';

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.livros && data.livros.length > 0) {
            container.innerHTML = '';
            data.livros.forEach(livro => {
                container.innerHTML += criarCardLivro(livro);
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📚 Nenhum livro cadastrado</h3>
                    <p>Os livros aparecerão aqui quando forem adicionados.</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>❌ Erro ao carregar livros</h3>
                <p>${error.message}</p>
                <p>Certifique-se de que a API está rodando!</p>
            </div>
        `;
    }
}

// Função para criar o card do livro
function criarCardLivro(livro) {
    const capaUrl = livro.caminho_capa || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='110' viewBox='0 0 80 110'%3E%3Crect fill='%23667eea' width='80' height='110'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='white'%3E📖%3C/text%3E%3C/svg%3E";

    return `
        <div class="book-card" onclick="mostrarDetalhes(${livro.id})">
            <img src="${capaUrl}" alt="${livro.titulo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%27110%27 viewBox=%270 0 80 110%27%3E%3Crect fill=%27%23667eea%27 width=%2780%27 height=%27110%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27white%27%3E📖%3C/text%3E%3C/svg%3E'">
            <div class="book-info">
                <h3>${livro.titulo}</h3>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                ${livro.ano_publicacao ? `<p><strong>Ano:</strong> ${livro.ano_publicacao}</p>` : ''}
                ${livro.genero ? `<span class="book-genre">${livro.genero}</span>` : ''}
            </div>
        </div>
    `;
}
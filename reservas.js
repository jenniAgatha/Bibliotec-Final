// reservas.js - Carrega e exibe as reservas

const API_URL = 'http://localhost:3000/reservas';

// Função para carregar reservas
async function carregarReservas() {
    const container = document.getElementById('reservasList');
    container.innerHTML = '<div class="loading">Carregando reservas...</div>';

    try {
        const response = await fetch(API_URL);
        const reservas = await response.json();

        if (reservas && reservas.length > 0) {
            container.innerHTML = '';
            reservas.forEach(reserva => {
                container.innerHTML += criarCardReserva(reserva);
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📚 Nenhuma reserva encontrada</h3>
                    <p>Não há reservas no sistema.</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>❌ Erro ao carregar reservas</h3>
                <p>${error.message}</p>
                <p>Certifique-se de que a API está rodando!</p>
            </div>
        `;
    }
}

// Função para criar o card da reserva
function criarCardReserva(reserva) {
    const capaUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='110' viewBox='0 0 80 110'%3E%3Crect fill='%23667eea' width='80' height='110'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='white'%3E📖%3C/text%3E%3C/svg%3E";

    return `
        <div class="book-card">
            <img src="${capaUrl}" alt="${reserva.titulo_livro}">
            <div class="book-info">
                <h3>${reserva.titulo_livro}</h3>
                <p><strong>Autor:</strong> ${reserva.autor_livro}</p>
                <p><strong>Usuário ID:</strong> ${reserva.usuario_id}</p>
                <p><strong>Data de Retirada:</strong> ${new Date(reserva.data_retirada).toLocaleDateString('pt-BR')}</p>
                <p><strong>Data de Devolucao:</strong> ${new Date(reserva.data_devolucao).toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
    `;
}

// Carregar reservas ao carregar a página
document.addEventListener('DOMContentLoaded', carregarReservas);

// Função para logout
function logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('perfil:data');
    window.location.href = 'TelaDeLogin.html';
}
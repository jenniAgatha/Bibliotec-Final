 const API_URL = 'http://localhost:3000/livros';

      // Carrega os livros ao abrir a página
      document.addEventListener('DOMContentLoaded', () => {
        carregarLivros();
        setupFormListeners();
      });

      // Configurar listeners do formulário
      function setupFormListeners() {
        // Preview da imagem ao fazer upload
        document.getElementById('coverInput').addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
              document.getElementById('coverPreview').src = event.target.result;
            };
            reader.readAsDataURL(file);
          }
        });

        // Preview da imagem ao digitar URL
        document.getElementById('coverUrl').addEventListener('input', function(e) {
          const url = e.target.value;
          if (url) {
            document.getElementById('coverPreview').src = url;
          }
        });

        // Limpar formulário
        document.getElementById('clearForm').addEventListener('click', function() {
          document.getElementById('bookForm').reset();
          document.getElementById('coverPreview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect fill='%23667eea' width='200' height='280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='white'%3E📖%3C/text%3E%3C/svg%3E";
        });
      }

      // Carregar livros
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
                <p>Adicione seu primeiro livro usando o formulário ao lado!</p>
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

      // Criar card do livro
      function criarCardLivro(livro) {
        const capaUrl = livro.caminho_capa || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='110' viewBox='0 0 80 110'%3E%3Crect fill='%23667eea' width='80' height='110'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='white'%3E📖%3C/text%3E%3C/svg%3E";

        return `
          <div class="book-card">
            <img src="${capaUrl}" alt="${livro.titulo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%27110%27 viewBox=%270 0 80 110%27%3E%3Crect fill=%27%23667eea%27 width=%2780%27 height=%27110%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27white%27%3E📖%3C/text%3E%3C/svg%3E'">
            <div class="book-info">
              <h3>${livro.titulo}</h3>
              <p><strong>Autor:</strong> ${livro.autor}</p>
              ${livro.ano_publicacao ? `<p><strong>Ano:</strong> ${livro.ano_publicacao}</p>` : ''}
              ${livro.genero ? `<span class="book-genre">${livro.genero}</span>` : ''}
            </div>
            <div class="book-actions">
              <button class="edit-btn" onclick='editarLivro(${JSON.stringify(livro).replace(/'/g, "&apos;")})'>✏️ Editar</button>
              <button class="delete-btn" onclick="deletarLivro(${livro.id})">🗑️ Excluir</button>
            </div>
          </div>
        `;
      }

      // Adicionar livro
      document.getElementById('bookForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const livro = {
          titulo: document.getElementById('title').value,
          autor: document.getElementById('author').value,
          genero: document.getElementById('category').value || null,
          ano_publicacao: document.getElementById('year').value || null,
          editora: document.getElementById('editora').value || null,
          isbn: document.getElementById('isbn').value || null,
          sinopse: document.getElementById('description').value || null,
          caminho_capa: document.getElementById('coverUrl').value || null
        };

        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livro)
          });

          if (response.ok) {
            alert('✅ Livro adicionado com sucesso!');
            document.getElementById('bookForm').reset();
            document.getElementById('coverPreview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect fill='%23667eea' width='200' height='280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='white'%3E📖%3C/text%3E%3C/svg%3E";
            carregarLivros();
          } else {
            const error = await response.json();
            alert('❌ Erro: ' + error.erro);
          }
        } catch (error) {
          alert('❌ Erro ao adicionar livro: ' + error.message);
        }
      });

      // Editar livro
      function editarLivro(livro) {
        document.getElementById('edit_id').value = livro.id;
        document.getElementById('edit_title').value = livro.titulo;
        document.getElementById('edit_author').value = livro.autor;
        document.getElementById('edit_category').value = livro.genero || '';
        document.getElementById('edit_year').value = livro.ano_publicacao || '';
        document.getElementById('edit_editora').value = livro.editora || '';
        document.getElementById('edit_isbn').value = livro.isbn || '';
        document.getElementById('edit_description').value = livro.sinopse || '';
        document.getElementById('edit_coverUrl').value = livro.caminho_capa || '';
        
        document.getElementById('editModal').classList.add('active');
      }

      // Fechar modal de edição
      function closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
      }

      // Atualizar livro
      document.getElementById('editForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const id = document.getElementById('edit_id').value;
        const livro = {
          titulo: document.getElementById('edit_title').value,
          autor: document.getElementById('edit_author').value,
          genero: document.getElementById('edit_category').value || null,
          ano_publicacao: document.getElementById('edit_year').value || null,
          editora: document.getElementById('edit_editora').value || null,
          isbn: document.getElementById('edit_isbn').value || null,
          descricao: document.getElementById('edit_description').value || null,
          caminho_capa: document.getElementById('edit_coverUrl').value || null
        };

        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livro)
          });

          if (response.ok) {
            alert('✅ Livro atualizado com sucesso!');
            closeEditModal();
            carregarLivros();
          } else {
            const error = await response.json();
            alert('❌ Erro: ' + error.erro);
          }
        } catch (error) {
          alert('❌ Erro ao atualizar livro: ' + error.message);
        }
      });

      // Deletar livro
      async function deletarLivro(id) {
        if (!confirm('Tem certeza que deseja excluir este livro?')) {
          return;
        }

        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            alert('✅ Livro excluído com sucesso!');
            carregarLivros();
          } else {
            const error = await response.json();
            alert('❌ Erro: ' + error.erro);
          }
        } catch (error) {
          alert('❌ Erro ao excluir livro: ' + error.message);
        }
      }

      // Fechar modal ao clicar fora
      window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
          event.target.classList.remove('active');
        }
      }
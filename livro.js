const API_URL = 'http://localhost:3000/livros';

document.addEventListener('DOMContentLoaded', () => {
  setupFormListeners();
  carregarLivros();
});

function setupFormListeners() {
  const form = document.getElementById('bookForm');
  const clearBtn = document.getElementById('clearForm');
  const coverFile = document.getElementById('coverFile'); // corresponde ao HTML
  const coverUrl = document.getElementById('coverUrl');

  let coverDataUrl = '';

  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = () => rej(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  if (coverFile) {
    coverFile.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (f) {
        try {
          coverDataUrl = await readFileAsDataURL(f);
          // se tiver preview, atualiza
          const preview = document.getElementById('coverPreview');
          if (preview) preview.src = coverDataUrl;
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  if (coverUrl) {
    coverUrl.addEventListener('input', (e) => {
      // se o usuário inserir URL, prioriza ela
      coverDataUrl = ''; // limpa base64 se estiver usando URL
      const preview = document.getElementById('coverPreview');
      if (preview) preview.src = e.target.value || preview.src;
    });
  }

  if (clearBtn && form) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      form.reset();
      coverDataUrl = '';
      const preview = document.getElementById('coverPreview');
      if (preview) preview.src = '';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // validação local dos campos obrigatórios
      const required = [
        { id: 'title', name: 'Título' },
        { id: 'author', name: 'Autor' }
      ];
      const missing = required.filter(f => !(document.getElementById(f.id)?.value || '').trim());
      if (missing.length) {
        showToast('Preencha: ' + missing.map(m => m.name).join(', '), 'error', 4500);
        // foca o primeiro campo faltante
        const firstMissing = document.getElementById(missing[0].id);
        if (firstMissing) firstMissing.focus();
        return;
      }

      const livro = {
        titulo: document.getElementById('title')?.value || '',
        autor: document.getElementById('author')?.value || '',
        genero: document.getElementById('category')?.value || '',
        sinopse: document.getElementById('description')?.value || '',
        caminho_capa: (document.getElementById('coverUrl')?.value) || coverDataUrl || null
      };
      
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(livro)
        });
        if (!res.ok) {
          const errBody = await res.text().catch(()=>res.statusText);
          showToast('Erro ao cadastrar: ' + (errBody || res.statusText), 'error', 6000);
          console.error('POST erro', res.status, errBody);
          return;
        }
        showToast('Livro cadastrado com sucesso!', 'success', 3500);
        form.reset();
        coverDataUrl = '';
        carregarLivros();
      } catch (error) {
        console.error('fetch error', error);
        showToast('Falha ao conectar ao servidor. Verifique backend/CORS.', 'error', 6000);
      }
    });
  }
}

async function carregarLivros() {
  const container = document.getElementById('booksList');
  if (!container) return;
  container.innerHTML = '<div class="loading">Carregando livros...</div>';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      container.innerHTML = '<div class="error">Erro ao carregar livros</div>';
      console.error('GET /livros erro', res.status);
      return;
    }
    const livros = await res.json();
    container.innerHTML = '';
    if (!Array.isArray(livros) || livros.length === 0) {
      container.innerHTML = '<div>Nenhum livro cadastrado</div>';
      return;
    }
    livros.forEach(l => {
      const card = document.createElement('div');
      card.className = 'book-card-modern';
      card.innerHTML = `
        <img src="${l.caminho_capa || ''}" alt="${l.titulo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%27110%27%3E%3Crect fill=%27%23667eea%27 width=%2780%27 height=%27110%27/%3E%3C/text%3E%3C/svg%3E'">
        <div class="book-info">
          <h3>${escapeHtml(l.titulo || '')}</h3>
          <p>${escapeHtml(l.autor || '')}</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('carregarLivros error', err);
    container.innerHTML = '<div class="error"></div>';
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

/* função simples de toast */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  container.appendChild(t);
  // forçar reflow para animar
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

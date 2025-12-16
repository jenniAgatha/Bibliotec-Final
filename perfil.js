// perfil.js — gerenciar perfil do usuário
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('avatarInput');
  const preview = document.getElementById('avatarPreview');
  const nomeField = document.getElementById('nomePerfil');
  const emailField = document.getElementById('emailPerfil');
  const senhaAtualField = document.getElementById('senhaAtual');
  const novaSenhaField = document.getElementById('novaSenha');
  const confirmarSenhaField = document.getElementById('confirmarSenha');
  const dataNascimentoField = document.getElementById('dataNascimento');
  const celularField = document.getElementById('celular');
  const cursoField = document.getElementById('curso');
  const saveBtn = document.getElementById('saveBtn');
  const removeBtn = document.getElementById('removeBtn');
  const perfilForm = document.getElementById('perfilForm');

  // Carregar dados do usuário
  carregarPerfil();

  // Preview da foto
  input.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const MAX_DIM = 800;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = w / h;
          if (ratio > 1) { w = MAX_DIM; h = Math.round(MAX_DIM / ratio); }
          else { h = MAX_DIM; w = Math.round(MAX_DIM * ratio); }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const origType = file.type || 'image/jpeg';
        const outType = origType === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outType, 0.8);
        preview.src = dataUrl;
      };
      img.onerror = () => { preview.src = reader.result; };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // Salvar perfil
  perfilForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarPerfil();
  });

  removeBtn.addEventListener('click', () => {
    preview.src = 'imagens/Group (1).png';
  });

  // Carregar reservas
  carregarReservas();
});

async function carregarPerfil() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    Swal.fire({
      text: 'Faça login para acessar o perfil.',
      icon: 'warning'
    }).then(() => {
      window.location.href = 'TelaDeLogin.html';
    });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/${usuario.id}`);
    const user = await response.json();

    document.getElementById('nomePerfil').value = user.nome || '';
    document.getElementById('emailPerfil').value = user.email || '';
    document.getElementById('dataNascimento').value = user.data_nascimento ? user.data_nascimento.split('T')[0] : '';
    document.getElementById('celular').value = user.celular || '';
    document.getElementById('curso').value = user.curso || '';

    // Carregar foto do localStorage se existir
    const saved = localStorage.getItem('perfil:data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.image) document.getElementById('avatarPreview').src = data.image;
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
}

async function salvarPerfil() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) return;

  const nome = document.getElementById('nomePerfil').value;
  const senhaAtual = document.getElementById('senhaAtual').value;
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const dataNascimento = document.getElementById('dataNascimento').value;
  const celular = document.getElementById('celular').value;
  const curso = document.getElementById('curso').value;

  // Validações
  if (novaSenha && novaSenha !== confirmarSenha) {
    Swal.fire({
      text: 'Nova senha e confirmação não coincidem.',
      icon: 'error'
    });
    return;
  }

  if (novaSenha && !senhaAtual) {
    Swal.fire({
      text: 'Digite a senha atual para alterar.',
      icon: 'error'
    });
    return;
  }

  const updateData = {
    nome,
    data_nascimento: dataNascimento,
    celular,
    curso
  };

  if (novaSenha) {
    updateData.senha = novaSenha;
    updateData.senhaAtual = senhaAtual;
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      Swal.fire({
        text: 'Perfil atualizado com sucesso!',
        icon: 'success'
      });
      // Limpar campos de senha
      document.getElementById('senhaAtual').value = '';
      document.getElementById('novaSenha').value = '';
      document.getElementById('confirmarSenha').value = '';
      // Salvar foto no localStorage
      const data = { name: nome, image: document.getElementById('avatarPreview').src };
      localStorage.setItem('perfil:data', JSON.stringify(data));
    } else {
      const error = await response.json();
      Swal.fire({
        text: 'Erro: ' + error.erro,
        icon: 'error'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    Swal.fire({
      text: 'Erro ao conectar com o servidor.',
      icon: 'error'
    });
  }
}

// Função para logout
function logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('perfil:data');
    window.location.href = 'TelaDeLogin.html';
}

  if (!usuario) {
    reservasList.innerHTML = '<p>Faça login para ver suas reservas.</p>';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/reservas?usuario_id=${usuario.id}`);
    const data = await response.json();

    if (data.length > 0) {
      reservasList.innerHTML = '';
      data.forEach(reserva => {
        const statusClass = reserva.confirmado_email ? 'confirmada' : 'pendente';
        const statusText = reserva.confirmado_email ? 'Confirmada' : 'Pendente';

        reservasList.innerHTML += `
          <div class="reserva-item">
            <div class="reserva-info">
              <h3>${reserva.titulo_livro || 'Livro'}</h3>
              <p>Retirada: ${new Date(reserva.data_retirada).toLocaleDateString('pt-BR')}</p>
              <p>Devolução: ${new Date(reserva.data_devolucao).toLocaleDateString('pt-BR')}</p>
            </div>
            <span class="reserva-status ${statusClass}">${statusText}</span>
          </div>
        `;
      });
    } else {
      reservasList.innerHTML = '<p>Você não tem reservas ativas.</p>';
    }
  } catch (error) {
    console.error('Erro ao carregar reservas:', error);
    reservasList.innerHTML = '<p>Erro ao carregar reservas.</p>';
  }
}

const API_URL = 'http://localhost:3000';  // ✅ Porta 3000

const form = document.getElementById('formLogin');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dadosLogin = {
    email: document.getElementById('email').value.trim(),
    senha: document.getElementById('senha').value
  };

  console.log('📤 Enviando para:', `${API_URL}/usuarios/login`);
  console.log('📦 Dados:', dadosLogin);

  try {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosLogin)
    });

    const resultado = await response.json();
    console.log('📥 Resposta:', resultado);

    if (response.ok) {
      mensagemDiv.innerHTML = `<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ ${resultado.mensagem}</p>`;
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

      if (resultado.usuario.perfil === 'Aluno') {
        setTimeout(() => {
          window.location.href = 'Login.html';  // Redireciona para a página desejada
        }, 1000);
      }
      else if (resultado.usuario.perfil === 'Admin') {
        setTimeout(() => {
          window.location.href = 'TelaDoAdm.html';  // Redireciona para a página desejada
        }, 1000);
      }
    } else {
      mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${resultado.erro}</p>`;
    }

  } catch (error) {
    console.error('❌ ERRO COMPLETO:', error);
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao conectar com o servidor. Verifique se a API está rodando.</p>';
  }
});

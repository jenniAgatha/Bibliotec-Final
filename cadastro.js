const API_URL = 'http://localhost:3000';

const form = document.getElementById('formCadastro');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Impede o reload da página
  
  // Pega os valores dos campos
  const dadosUsuario = {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim(),
    senha: document.getElementById('senha').value,
    data_nascimento: document.getElementById('data_nascimento').value,
    celular: document.getElementById('celular').value.trim(),
    curso: document.getElementById('curso').value.trim()
  };

  console.log('📤 Enviando dados:', dadosUsuario);

  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosUsuario)
    });

    const resultado = await response.json();
    console.log('📥 Resposta da API:', resultado);

    if (response.ok) {
      // Sucesso! ✅
      mensagemDiv.innerHTML = `<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ ${resultado.mensagem}</p>`;
      form.reset();
      
      // Opcional: redirecionar após 2 segundos
      setTimeout(() => {
        // window.location.href = 'login.html'; // Descomente se tiver página de login
      }, 2000);
    } else {
      // Erro ❌
      mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${resultado.erro || 'Erro ao cadastrar'}</p>`;
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao conectar com o servidor. Verifique se a API está rodando.</p>';
  }
});
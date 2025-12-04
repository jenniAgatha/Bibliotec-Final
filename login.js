const API_URL = 'http://localhost:3000';

const form = document.getElementById('formLogin');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Impede o reload da página
  
  const dadosLogin = {
    email: document.getElementById('email').value.trim(),
    senha: document.getElementById('senha').value
  };

  console.log('📤 Tentando login com:', dadosLogin.email);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosLogin)
    });

    const resultado = await response.json();
    console.log('📥 Resposta da API:', resultado);

    if (response.ok) {
      // Login bem-sucedido! ✅
      mensagemDiv.innerHTML = `<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ ${resultado.mensagem}</p>`;
      
      // Salva os dados do usuário no localStorage
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
      
      // Redireciona após 1 segundo para a página principal
      setTimeout(() => {
        window.location.href = 'home.html'; // ⚠️ MUDE PARA SUA PÁGINA PRINCIPAL
      }, 1000);
      
    } else {
      // Erro ❌
      mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${resultado.erro}</p>`;
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao conectar com o servidor. Verifique se a API está rodando.</p>';
  }
});
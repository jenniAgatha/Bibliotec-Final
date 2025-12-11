const API_URL = 'http://localhost:3000';

const formCadastro = document.getElementById('formCadastro');
const formVerificacao = document.getElementById('formVerificacao');
const mensagemDiv = document.getElementById('mensagem');
const mensagemVerificacaoDiv = document.getElementById('mensagemVerificacao');

let dadosUsuarioTemp = {};

// ===== FUNÇÕES DE VALIDAÇÃO =====

function validarNome(nome) {
  const regexNome = /^[a-zA-ZÀ-ÿ\s]+$/;
  return regexNome.test(nome);
}

function validarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length < 10 || numeros.length > 11) return false;
  if (/^(\d)\1+$/.test(numeros)) return false;
  return true;
}

function validarDataNascimento(data) {
  const hoje = new Date();
  const dataNascimento = new Date(data);
  
  if (isNaN(dataNascimento.getTime())) {
    return { valido: false, mensagem: "Data inválida" };
  }
  
  if (dataNascimento > hoje) {
    return { valido: false, mensagem: "Data de nascimento não pode ser no futuro" };
  }
  
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mes = hoje.getMonth() - dataNascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }
  
  if (idade < 13) {
    return { valido: false, mensagem: "Você precisa ter pelo menos 13 anos" };
  }
  
  if (idade > 120) {
    return { valido: false, mensagem: "Data de nascimento inválida" };
  }
  
  return { valido: true };
}

// ===== MÁSCARAS =====

const inputNome = document.getElementById('nome');
inputNome.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
});

const inputCelular = document.getElementById('celular');
inputCelular.addEventListener('input', (e) => {
  let valor = e.target.value.replace(/\D/g, '');
  if (valor.length <= 11) {
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
  }
  e.target.value = valor;
});

const inputCodigo = document.getElementById('codigoVerificacao');
inputCodigo.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
});

// Define data máxima como hoje
document.getElementById('data_nascimento').max = new Date().toISOString().split('T')[0];

// ===== ETAPA 1: SOLICITAR CÓDIGO =====

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  mensagemDiv.innerHTML = '';
  
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const dataNascimento = document.getElementById('data_nascimento').value;
  const celular = document.getElementById('celular').value.trim();
  const curso = document.getElementById('curso').value.trim();
  
  // Validações
  if (!validarNome(nome)) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Nome deve conter apenas letras</p>';
    return;
  }
  
  if (nome.length < 3) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Nome deve ter pelo menos 3 caracteres</p>';
    return;
  }
  
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Email inválido</p>';
    return;
  }
  
  if (senha.length < 6) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Senha deve ter pelo menos 6 caracteres</p>';
    return;
  }
  
  const validacaoData = validarDataNascimento(dataNascimento);
  if (!validacaoData.valido) {
    mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${validacaoData.mensagem}</p>`;
    return;
  }
  
  if (!validarTelefone(celular)) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Número de telefone inválido</p>';
    return;
  }
  
  if (curso.length < 3) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Curso deve ter pelo menos 3 caracteres</p>';
    return;
  }
  
  dadosUsuarioTemp = {
    nome, email, senha, data_nascimento: dataNascimento, celular, curso
  };

  console.log('📤 Solicitando código de verificação...');
  mensagemDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">⏳ Enviando código...</p>';

  // Na parte do formCadastro.addEventListener('submit', ...
try {
  const response = await fetch(`${API_URL}/usuarios/solicitar-codigo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosUsuarioTemp)
  });

  const resultado = await response.json();
  console.log('📥 Resposta do servidor:', resultado);

  if (response.ok) {
    mensagemDiv.innerHTML = `<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ ${resultado.mensagem}</p>`;
    
    setTimeout(() => {
      formCadastro.style.display = 'none';
      formVerificacao.style.display = 'block';
    }, 2000);
  } else {
    // Erros específicos
    let mensagemErro = resultado.erro;
    
    if (response.status === 409) {
      // Email já cadastrado
      mensagemErro = `❌ ${resultado.erro}`;
    } else if (response.status === 500) {
      // Erro no envio de email
      mensagemErro = `❌ ${resultado.erro}`;
    } else if (response.status === 400) {
      // Validação de campos
      mensagemErro = `❌ ${resultado.erro}`;
    }
    
    mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">${mensagemErro}</p>`;
  }

} catch (error) {
  console.error('❌ Erro na requisição:', error);
  mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao conectar com o servidor. Verifique sua conexão com a internet e tente novamente.</p>';
}
});

// ===== ETAPA 2: VERIFICAR CÓDIGO =====

formVerificacao.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  mensagemVerificacaoDiv.innerHTML = '';
  
  const codigo = document.getElementById('codigoVerificacao').value.trim();
  
  if (codigo.length !== 5) {
    mensagemVerificacaoDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Código deve ter 5 dígitos</p>';
    return;
  }

  console.log('📤 Verificando código...');
  mensagemVerificacaoDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">⏳ Verificando...</p>';

  try {
    const response = await fetch(`${API_URL}/usuarios/verificar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dadosUsuarioTemp,
        codigo: codigo
      })
    });

    const resultado = await response.json();

    if (response.ok) {
      mensagemVerificacaoDiv.innerHTML = `<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ ${resultado.mensagem}</p>`;
      
      setTimeout(() => {
        window.location.href = 'Login.html';
      }, 2000);
    } else {
      mensagemVerificacaoDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${resultado.erro}</p>`;
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    mensagemVerificacaoDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao conectar com o servidor.</p>';
  }
});

// ===== BOTÃO REENVIAR CÓDIGO =====

document.getElementById('btnReenviarCodigo').addEventListener('click', async () => {
  console.log('📤 Reenviando código...');
  mensagemVerificacaoDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">⏳ Reenviando...</p>';
  
  try {
    const response = await fetch(`${API_URL}/usuarios/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosUsuarioTemp)
    });

    const resultado = await response.json();

    if (response.ok) {
      mensagemVerificacaoDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ Novo código enviado!</p>';
    } else {
      mensagemVerificacaoDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${resultado.erro}</p>`;
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    mensagemVerificacaoDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao reenviar código.</p>';
  }
});
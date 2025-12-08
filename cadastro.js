const API_URL = 'http://localhost:3000';

const form = document.getElementById('formCadastro');
const mensagemDiv = document.getElementById('mensagem');

// ===== FUNÇÕES DE VALIDAÇÃO =====

function validarNome(nome) {
  const regexNome = /^[a-zA-ZÀ-ÿ\s]+$/;
  return regexNome.test(nome);
}

function validarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length < 10 || numeros.length > 11) {
    return false;
  }
  
  if (/^(\d)\1+$/.test(numeros)) {
    return false;
  }
  
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
    return { valido: false, mensagem: "Você precisa ter pelo menos 13 anos para se cadastrar" };
  }
  
  if (idade > 120) {
    return { valido: false, mensagem: "Data de nascimento inválida" };
  }
  
  return { valido: true };
}

// ===== MÁSCARAS E BLOQUEIOS EM TEMPO REAL =====

// Bloqueia números no campo nome
const inputNome = document.getElementById('nome');
inputNome.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
});

// Máscara de telefone
const inputCelular = document.getElementById('celular');
inputCelular.addEventListener('input', (e) => {
  let valor = e.target.value.replace(/\D/g, '');

  // impede mais de 11 dígitos totais (2 DDD + 9 número)
  if (valor.length > 11) {
    valor = valor.slice(0, 11);
  }

  // aplica máscara
  if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
  }
  if (valor.length > 7) {
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
  }

  e.target.value = valor;
});


// ===== EVENTO DE SUBMIT =====

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  mensagemDiv.innerHTML = '';
  
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const dataNascimento = document.getElementById('data_nascimento').value;
  const celular = document.getElementById('celular').value.trim();
  const curso = document.getElementById('curso').value.trim();
  
  // ===== VALIDAÇÕES =====
  
  // Valida se o nome tem apenas letras
  if (!validarNome(nome)) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Nome deve conter apenas letras</p>';
    return;
  }
  
  // Valida nome (mínimo 3 caracteres)
  if (nome.length < 3) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Nome deve ter pelo menos 3 caracteres</p>';
    return;
  }
  
  // Valida email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Email inválido</p>';
    return;
  }
  
  // Valida senha (mínimo 6 caracteres)
  if (senha.length < 6) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Senha deve ter pelo menos 6 caracteres</p>';
    return;
  }
  
  // Valida data de nascimento
  const validacaoData = validarDataNascimento(dataNascimento);
  if (!validacaoData.valido) {
    mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${validacaoData.mensagem}</p>`;
    return;
  }
  
  // Valida telefone
  if (!validarTelefone(celular)) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Número de telefone inválido. Use formato: (11) 99999-9999</p>';
    return;
  }
  
  // Valida curso (mínimo 3 caracteres)
  if (curso.length < 3) {
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Curso deve ter pelo menos 3 caracteres</p>';
    return;
  }
  
  // ===== ENVIA PARA API =====
  
  const dadosUsuario = {
    nome: nome,
    email: email,
    senha: senha,
    data_nascimento: dataNascimento,
    celular: celular,
    curso: curso
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
      mensagemDiv.innerHTML = `<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold;">✅ ${resultado.mensagem}</p>`;
      form.reset();
      
      setTimeout(() => {
        window.location.href = 'TelaLogin.html';
      }, 2000);
    } else {
      mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ ${resultado.mensagem}Dados já existentes </p>`;
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold;">❌ Erro ao conectar com o servidor.</p>';
  }
});
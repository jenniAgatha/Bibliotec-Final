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

// ===== MÁSCARAS E BLOQUEIOS =====

const inputNome = document.getElementById('nome');
if (inputNome) {
  inputNome.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  });
}

const inputCelular = document.getElementById('celular');
if (inputCelular) {
  inputCelular.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '').slice(0, 11); // Limita a 11 dígitos
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
    e.target.value = valor;
  });
}

const inputCodigo = document.getElementById('codigoVerificacao');
if (inputCodigo) {
  inputCodigo.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
  });
}

// Define data máxima como hoje
const inputData = document.getElementById('data_nascimento');
if (inputData) {
  inputData.max = new Date().toISOString().split('T')[0];
}

// ===== ETAPA 1: SOLICITAR CÓDIGO =====

if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    mensagemDiv.innerHTML = '';

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('data_nascimento').value;
    const celular = document.getElementById('celular').value.trim();
    const curso = document.getElementById('curso').value;

    // ===== VALIDAÇÕES FRONTEND =====

    if (!validarNome(nome)) {
      mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Nome deve conter apenas letras</p>';
      return;
    }

    if (nome.length < 3) {
      mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Nome deve ter pelo menos 3 caracteres</p>';
      return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Email inválido. Verifique o formato.</p>';
      return;
    }

    if (senha.length < 6) {
      mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Senha deve ter pelo menos 6 caracteres</p>';
      return;
    }

    const validacaoData = validarDataNascimento(dataNascimento);
    if (!validacaoData.valido) {
      mensagemDiv.innerHTML = `<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ ${validacaoData.mensagem}</p>`;
      return;
    }

    if (!validarTelefone(celular)) {
      mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Número de telefone inválido</p>';
      return;
    }

    if (!curso || curso === '') {
      mensagemDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Selecione um curso</p>';
      return;
    }

    // Salva dados temporariamente
    dadosUsuarioTemp = {
      nome,
      email,
      senha,
      data_nascimento: dataNascimento,
      celular,
      curso
    };

    console.log('📤 Solicitando código de verificação...');
    mensagemDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">⏳ Enviando código para seu email...</p>';

    try {
      const response = await fetch(`${API_URL}/usuarios/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosUsuarioTemp)
      });

      const resultado = await response.json();
      console.log('📥 Resposta do servidor:', resultado);

      if (response.status === 200) {
        // SUCESSO ✅
        mensagemDiv.innerHTML = `
          <p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
            ✅ ${resultado.mensagem}
          </p>
        `;

        setTimeout(() => {
          formCadastro.style.display = 'none';
          formVerificacao.style.display = 'block';
        }, 2000);

      } else {
        // ERROS ❌
        formVerificacao.style.display = 'none'; // Garante que não mostra o form de verificação
        let mensagemErro = '';

        if (response.status === 409) {
          // Email já cadastrado
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ ${resultado.erro}
            </p>
            <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
              💡 Dica: Tente fazer login ou use outro email.
            </p>
          `;
        } else if (response.status === 500) {
          // Erro ao enviar email
          if (resultado.erro.includes('não foi possível enviar') ||
            resultado.erro.includes('Não foi possível enviar')) {
            mensagemErro = `
      <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
        ❌ Não conseguimos enviar o email
      </p>
      <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
        📧 O email <strong>${email}</strong> pode estar incorreto ou não existe<br>
        💡 Verifique se digitou corretamente e tente novamente
      </p>
    `;
          } else if (resultado.erro.includes('servidor de email')) {
            mensagemErro = `
      <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
        ❌ Servidor de email temporariamente indisponível
      </p>
      <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
        ⏳ Aguarde alguns minutos e tente novamente
      </p>
    `;
          } else {
            mensagemErro = `
      <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
        ❌ ${resultado.erro}
      </p>
    `;
          }
        } else if (response.status === 400) {
          // Validação de campos
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ ${resultado.erro}
            </p>
          `;
        } else {
          // Erro genérico
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ Erro inesperado. Tente novamente.
            </p>
          `;
        }

        mensagemDiv.innerHTML = mensagemErro;
      }

    } catch (error) {
      console.error('❌ Erro na requisição:', error);

      // Erro de conexão
      mensagemDiv.innerHTML = `
        <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
          ❌ Erro ao conectar com o servidor
        </p>
        <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
          📶 Verifique sua conexão com a internet<br>
          🔧 Certifique-se que o servidor está rodando
        </p>
      `;
    }
  });
}

// ===== ETAPA 2: VERIFICAR CÓDIGO =====

if (formVerificacao) {
  formVerificacao.addEventListener('submit', async (e) => {
    e.preventDefault();

    mensagemVerificacaoDiv.innerHTML = '';

    const codigo = document.getElementById('codigoVerificacao').value.trim();

    if (codigo.length !== 5) {
      mensagemVerificacaoDiv.innerHTML = '<p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">❌ Código deve ter 5 dígitos</p>';
      return;
    }

    console.log('📤 Verificando código...');
    mensagemVerificacaoDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">⏳ Verificando código...</p>';

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
      console.log('📥 Resposta:', resultado);

      if (response.ok) {
        // SUCESSO ✅
        mensagemVerificacaoDiv.innerHTML = `
          <p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
            ✅ ${resultado.mensagem}
          </p>
          <p style="color: #4CAF50; text-align: center; margin-top: 10px; font-size: 12px;">
            🎉 Redirecionando para o login...
          </p>
        `;

        setTimeout(() => {
          window.location.href = 'Login.html';
        }, 2000);

      } else {
        // ERRO ❌
        let mensagemErro = '';

        if (resultado.erro.includes('inválido') || resultado.erro.includes('expirado')) {
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ ${resultado.erro}
            </p>
            <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
              💡 Clique em "Reenviar Código" para receber um novo
            </p>
          `;
        } else {
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ ${resultado.erro}
            </p>
          `;
        }

        mensagemVerificacaoDiv.innerHTML = mensagemErro;
      }

    } catch (error) {
      console.error('❌ Erro:', error);
      mensagemVerificacaoDiv.innerHTML = `
        <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
          ❌ Erro ao conectar com o servidor
        </p>
        <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
          📶 Verifique sua conexão com a internet
        </p>
      `;
    }
  });
}

// ===== BOTÃO REENVIAR CÓDIGO =====

const btnReenviar = document.getElementById('btnReenviarCodigo');
if (btnReenviar) {
  btnReenviar.addEventListener('click', async () => {
    console.log('📤 Reenviando código...');
    mensagemVerificacaoDiv.innerHTML = '<p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">⏳ Reenviando código...</p>';

    try {
      const response = await fetch(`${API_URL}/usuarios/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosUsuarioTemp)
      });

      const resultado = await response.json();

      if (response.ok) {
        mensagemVerificacaoDiv.innerHTML = `
          <p style="color: #4CAF50; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
            ✅ Novo código enviado!
          </p>
          <p style="color: #4CAF50; text-align: center; margin-top: 10px; font-size: 12px;">
            📧 Verifique sua caixa de entrada e spam
          </p>
        `;
      } else {
        let mensagemErro = '';

        if (resultado.erro.includes('não foi possível enviar') ||
          resultado.erro.includes('Não foi possível enviar')) {
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ Não foi possível reenviar o código
            </p>
            <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
              📧 Verifique se o email está correto<br>
              💡 Tente novamente em alguns segundos
            </p>
          `;
        } else {
          mensagemErro = `
            <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
              ❌ ${resultado.erro}
            </p>
          `;
        }

        mensagemVerificacaoDiv.innerHTML = mensagemErro;
      }

    } catch (error) {
      console.error('❌ Erro:', error);
      mensagemVerificacaoDiv.innerHTML = `
        <p style="color: #f44336; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;">
          ❌ Erro ao conectar com o servidor
        </p>
        <p style="color: #ff9800; text-align: center; margin-top: 10px; font-size: 12px;">
          📶 Verifique sua conexão com a internet
        </p>
      `;
    }
  });
}

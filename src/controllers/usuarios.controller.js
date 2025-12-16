import { db } from "../config/db.js";
import  bcrypt from "bcrypt";
import { gerarCodigoVerificacao, enviarEmailVerificacao } from "../config/email.js";
import nodemailer from 'nodemailer';


export async function adicionarusuarios(req, res) {
   try {
    const { nome, email, senha, data_nascimento, celular, curso, perfil } = req.body;

    // 🔎 1. Verificar se email já existe
    const [emailExiste] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (emailExiste.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado!" });
    }

    // 🔎 2. Verificar se celular já existe
    const [celularExiste] = await db.execute(
      "SELECT id FROM usuarios WHERE celular = ?",
      [celular]
    );

    if (celularExiste.length > 0) {
      return res.status(400).json({ erro: "Celular já cadastrado!" });
    }

    // 🔐 3. Inserir o usuário se tudo estiver ok
    const params = [nome, email, senha, data_nascimento, celular, curso, perfil || 'Aluno'].map(p => p === undefined ? null : p);
    await db.execute(
      "INSERT INTO usuarios (nome, email, senha, data_nascimento, celular, curso, perfil) VALUES (?, ?, ?, ?, ?, ?, ?)",
      params
    );

    return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    return res.status(500).json({ erro: error.message });
  }
}

export async function listarUsuarios(req, res) {
    try {
        const [rows] = await db.execute("SELECT * FROM usuarios");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

export async function obterusuario(req, res) {
    try {
        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }  
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

export async function atualizarusuario(req, res) {
    try {
        const { nome, email, senha, senhaAtual, data_nascimento, celular, curso, perfil } = req.body;

        // Se está tentando alterar senha, verificar senha atual
        if (senha) {
            if (!senhaAtual) {
                return res.status(400).json({ erro: "Senha atual é obrigatória para alterar a senha" });
            }
            const [userRows] = await db.execute("SELECT senha FROM usuarios WHERE id = ?", [req.params.id]);
            if (userRows.length === 0) {
                return res.status(404).json({ erro: "Usuário não encontrado" });
            }
            const senhaValida = await bcrypt.compare(senhaAtual, userRows[0].senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: "Senha atual incorreta" });
            }
        }

        const hashedSenha = senha ? await bcrypt.hash(senha, 10) : undefined;
        const params = [nome, email, hashedSenha, data_nascimento, celular, curso, perfil, req.params.id].map(p => p === undefined ? null : p);
        await db.execute(
            "UPDATE usuarios SET nome = ?, email = ?, senha = ?, data_nascimento = ?, celular = ?, curso = ?, perfil = ? WHERE id = ?",
            params
        );
        res.json({ mensagem: "Usuário atualizado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

export async function deletarusuario(req, res) {
    try {
        await db.execute("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
        res.json({ mensagem: "Usuário deletado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }

}

export async function loginUsuario(req, res) {
    try {
        const { email, senha } = req.body;
        const [rows] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha inválida" });
        }
        res.json({ mensagem: "Login bem-sucedido ✅", usuario });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

export async function solicitarCodigoVerificacao(req, res) {
    console.log('📧 Solicitação de código recebida');
    
    try {
        const { nome, email, senha, data_nascimento, celular, curso } = req.body;

        // Validações de campos obrigatórios
        if (!nome || !email || !senha || !data_nascimento || !celular || !curso) {
            console.log('❌ Campos obrigatórios faltando');
            return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
        }

        // Valida formato do email
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            console.log('❌ Formato de email inválido');
            return res.status(400).json({ 
                erro: "Formato de email inválido. Verifique o email digitado." 
            });
        }

        // Verifica se o email já está cadastrado
        const [usuarioExiste] = await db.execute(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExiste.length > 0) {
            console.log('❌ Email já cadastrado:', email);
            return res.status(409).json({ 
                erro: "Este email já está cadastrado! Use outro email ou faça login." 
            });
        }

        // Gera código de 5 dígitos
        const codigo = gerarCodigoVerificacao();
        console.log('🔢 Código gerado:', codigo, 'para email:', email);
        
        // ⚠️ IMPORTANTE: Tenta enviar o email ANTES de salvar no banco
        console.log('📤 Tentando enviar email para:', email);
        const emailEnviado = await enviarEmailVerificacao(email, codigo, nome);

        // Se o email NÃO foi enviado, retorna erro IMEDIATAMENTE
        if (!emailEnviado) {
            console.error('❌ FALHA AO ENVIAR EMAIL - Email não será processado');
            return res.status(500).json({ 
                erro: "Não foi possível enviar o email. Verifique se o endereço de email está correto e tente novamente." 
            });
        }

        console.log('✅ Email enviado com sucesso! Salvando código no banco...');

        // Define expiração (10 minutos)
        const expiraEm = new Date();
        expiraEm.setMinutes(expiraEm.getMinutes() + 10);

        // ✅ Só salva no banco SE o email foi enviado com sucesso
        await db.execute(
            "INSERT INTO codigos_verificacao (email, codigo, expira_em) VALUES (?, ?, ?)",
            [email, codigo, expiraEm]
        );

        console.log('✅ Código salvo no banco com sucesso!');

        res.status(200).json({ 
            mensagem: "Código de verificação enviado para seu email! Verifique sua caixa de entrada e spam.",
            email: email
        });

    } catch (err) {
        console.error('❌ Erro completo na solicitação:', err);
        
        // Mensagens específicas para diferentes tipos de erro
        if (err.code === 'ENOTFOUND') {
            return res.status(500).json({ 
                erro: "Não foi possível conectar ao servidor de email. Tente novamente mais tarde." 
            });
        }
        
        if (err.message && err.message.includes('Invalid login')) {
            return res.status(500).json({ 
                erro: "Erro de configuração do servidor de email. Entre em contato com o suporte." 
            });
        }

        if (err.responseCode === 550 || err.responseCode === 553) {
            return res.status(400).json({ 
                erro: "Email não encontrado ou rejeitado pelo servidor. Verifique se o email está correto." 
            });
        }
        
        res.status(500).json({ 
            erro: "Erro ao processar solicitação. Tente novamente." 
        });
    }
}
// NOVA FUNÇÃO: Verifica código e cria usuário
export async function verificarCodigoECriarUsuario(req, res) {
    try {
        const { email, codigo, nome, senha, data_nascimento, celular, curso } = req.body;

        // Validações
        if (!email || !codigo || !nome || !senha || !data_nascimento || !celular || !curso) {
            return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
        }

        // Busca o código no banco
        const [codigosEncontrados] = await db.execute(
            "SELECT * FROM codigos_verificacao WHERE email = ? AND codigo = ? AND usado = FALSE ORDER BY criado_em DESC LIMIT 1",
            [email, codigo]
        );

        if (codigosEncontrados.length === 0) {
            return res.status(400).json({ erro: "Código inválido ou expirado" });
        }

        const codigoRegistro = codigosEncontrados[0];

        // Verifica se o código expirou
        const agora = new Date();
        const expiraEm = new Date(codigoRegistro.expira_em);

        if (agora > expiraEm) {
            return res.status(400).json({ erro: "Código expirado. Solicite um novo código." });
        }

        // Código válido! Agora cria o usuário
        const hashedSenha = await bcrypt.hash(senha, 10);

        const params = [nome, email, hashedSenha, data_nascimento, celular, curso].map(p => p === undefined ? null : p);
        await db.execute(
            "INSERT INTO usuarios (nome, email, senha, data_nascimento, celular, curso) VALUES (?, ?, ?, ?, ?, ?)",
            params
        );

        // Marca o código como usado
        await db.execute(
            "UPDATE codigos_verificacao SET usado = TRUE WHERE id = ?",
            [codigoRegistro.id]
        );

        res.json({ mensagem: "Usuário criado com sucesso! Faça login para continuar." });

    } catch (err) {
        console.error('❌ Erro:', err);
        res.status(500).json({ erro: err.message });
    }
}

// Função para gerar senha temporária
function gerarSenhaTemporaria() {
    return Math.random().toString(36).slice(-8); // 8 caracteres aleatórios
}

// Função para reset de senha
export async function resetSenha(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ erro: "Email é obrigatório" });
        }

        // Verifica se o usuário existe
        const [usuario] = await db.execute("SELECT id, nome FROM usuarios WHERE email = ?", [email]);
        if (usuario.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Gera senha temporária
        const senhaTemporaria = gerarSenhaTemporaria();
        const hashedSenha = await bcrypt.hash(senhaTemporaria, 10);

        // Atualiza a senha no banco
        await db.execute("UPDATE usuarios SET senha = ? WHERE email = ?", [hashedSenha, email]);

        // Envia email com a senha temporária
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'senaibibliotec@gmail.com',
                pass: 'lbyi aqqd hrfa dfsx'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'senaibibliotec@gmail.com',
            to: email,
            subject: 'Reset de Senha - Bibliotec',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Reset de Senha</h2>
                    <p>Olá ${usuario[0].nome},</p>
                    <p>Sua senha foi resetada. Use a senha temporária abaixo para fazer login:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
                        ${senhaTemporaria}
                    </div>
                    <p style="color: #666;">Recomendamos alterar a senha após o login.</p>
                    <p style="color: #666; font-size: 12px;">Se você não solicitou este reset, ignore este email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ mensagem: "Senha resetada com sucesso! Verifique seu email." });

    } catch (err) {
        console.error('❌ Erro ao resetar senha:', err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

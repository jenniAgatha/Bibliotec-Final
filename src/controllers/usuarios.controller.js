import { db } from "../config/db.js";
import  bcrypt from "bcrypt";
import { gerarCodigoVerificacao, enviarEmailVerificacao } from "../config/email.js";


export async function adicionarusuarios(req, res) {
   try {
    const { nome, email, senha, data_nascimento, celular, curso } = req.body;

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
    await db.execute(
      "INSERT INTO usuarios (nome, email, senha, data_nascimento, celular, curso) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, email, senha, data_nascimento, celular, curso]
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
        const { nome, email, senha,  data_nascimento, celular, curso } = req.body;
        await db.execute(
            "UPDATE usuarios SET nome = ?, email = ?, senha = ?, data_nascimento = ?, celular = ?, curso = ? WHERE id= ?",
            [nome, email, senha, data_nascimento, celular, curso, req.params.id]
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
    try {
        const { nome, email, senha, data_nascimento, celular, curso } = req.body;

        // Validações
        if (!nome || !email || !senha || !data_nascimento || !celular || !curso) {
            return res.status(400).json({ erro: "Campos obrigatórios" });
        }

        // Verifica se o email já está cadastrado
        const [usuarioExiste] = await db.execute(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExiste.length > 0) {
            return res.status(409).json({ erro: "Email já cadastrado" });
        }

        // Gera código de 5 dígitos
        const codigo = gerarCodigoVerificacao();
        
        // Define expiração (10 minutos a partir de agora)
        const expiraEm = new Date();
        expiraEm.setMinutes(expiraEm.getMinutes() + 10);

        // Salva código no banco
        await db.execute(
            "INSERT INTO codigos_verificacao (email, codigo, expira_em) VALUES (?, ?, ?)",
            [email, codigo, expiraEm]
        );

        // Envia email
        const emailEnviado = await enviarEmailVerificacao(email, codigo, nome);

        if (!emailEnviado) {
            return res.status(500).json({ erro: "Erro ao enviar email. Tente novamente." });
        }

        // Retorna sucesso (SEM salvar o usuário ainda)
        res.json({ 
            mensagem: "Código de verificação enviado para seu email!",
            email: email  // Retorna o email para o frontend usar depois
        });

    } catch (err) {
        console.error('❌ Erro:', err);
        res.status(500).json({ erro: err.message });
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

        await db.execute(
            "INSERT INTO usuarios (nome, email, senha, data_nascimento, celular, curso) VALUES (?, ?, ?, ?, ?, ?)",
            [nome, email, hashedSenha, data_nascimento, celular, curso]
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

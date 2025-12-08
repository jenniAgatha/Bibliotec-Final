import { db } from "../config/db.js";
import  bcrypt from "bcrypt";

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

// // export async function esqueceuSenha(req, res) {
//     try {
//         const { email } = req.body; 
//         const [rows] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
//         if (rows.length === 0) {
//             return res.status(404).json({ erro: "Usuário não encontrado" });
//         }
//         res.json({ mensagem: "Instruções para recuperação de senha enviadas para o email fornecido." });
//     } catch (err) {
//         res.status(500).json({ erro: err.message });
//     }
//         // Aqui você pode implementar a lógica para enviar um email de recuperação de senha
// // }
// export async function resetarSenha(req, res) {
//     try {
//         const { email, novaSenha } = req.body;  
//         const hashedSenha = await bcrypt.hash(novaSenha, 10);
//         const [result] = await db.execute(
//             "UPDATE usuarios SET senha = ? WHERE email = ?",
//             [hashedSenha, email]
//         );
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ erro: "Usuário não encontrado" });
//         }
//         res.json({ mensagem: "Senha atualizada com sucesso!" });
//     } catch (err) {
//         res.status(500).json({ erro: err.message });
//     } 
//         // Aqui você pode implementar a lógica para validar o token de reset e atualizar a senha
// // }
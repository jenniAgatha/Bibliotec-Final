import { db } from "../config/db.js";

export async function listarReservas(req, res) {
  try {
    const [rows] = await db.execute("SELECT * FROM reservas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Reserva não encontrada" });
  }
}

export async function criarReserva(req, res) {
  try {
    const { usuario_id, livro_id, data_retirada, data_devolucao, confirmado_email } = req.body;
    
    // Validação: campos obrigatórios
    if (!usuario_id || !livro_id || !data_retirada || !data_devolucao || confirmado_email === undefined) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    // Validação: verifica se o livro existe e quantos estão disponíveis
    const [livroExiste] = await db.execute(
      "SELECT id, ativo FROM livros WHERE id = ?",
      [livro_id]
    );

    if (livroExiste.length === 0) {
      return res.status(404).json({
        error: "Livro não encontrado! Verifique o ID do livro."
      });
    }

    // Verifica se há livros disponíveis (ativo > 0)
    if (livroExiste[0].ativo <= 0) {
      return res.status(400).json({
        error: "Este livro não está disponível para reserva. Estoque esgotado."
      });
    }

    // Validação: verifica se o usuário existe
    const [usuarioExiste] = await db.execute(
      "SELECT id FROM usuarios WHERE id = ?",
      [usuario_id]
    );

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado! Verifique o ID do usuário."
      });
    }

    // Insere a reserva
    await db.execute(
      "INSERT INTO reservas (usuario_id, livro_id, data_retirada, data_devolucao, confirmado_email) VALUES (?, ?, ?, ?, ?)",
      [usuario_id, livro_id, data_retirada, data_devolucao, confirmado_email]
    );

    // Diminui 1 no campo ativo (quantidade disponível)
    await db.execute(
      "UPDATE livros SET ativo = ativo - 1 WHERE id = ?",
      [livro_id]
    );
    
    res.status(201).json({ 
      message: "Reserva criada com sucesso",
      // livros_disponiveis: livroExiste[0].ativo - 1
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: "Sua reserva deu erro, tente novamente :/" });
  }
}

export async function deletarReserva(req, res) {
  try {
    await db.execute("DELETE FROM reservas WHERE id = ?", [req.params.id]);
    res.json({ message: "Reserva deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar a reserva" });
  }
  await db.execute(
    "UPDATE livros SET ativo = ativo + 1 WHERE id = ?",
    [livro_id]
  );

}
// export async function confirmarEmailReserva (req, res) {
//     try {
//         const { confirmado_email } = req.body;
//         await db.execute(
//             "UPDATE reservas SET confirmado_email = ? WHERE id = ?",
//             [confirmado_email, req.params.id]
//         );
//         res.json({ message: "Email de reserva confirmado com sucesso" });
//     } catch (error) {
//         res.status(500).json({ error: "Erro ao confirmar email da reserva" });
//     }
// }
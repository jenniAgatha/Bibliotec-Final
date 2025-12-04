
import { db } from "../config/db.js";

export async function adicionarlivros(req, res) {
  console.log('📝 Body recebido:', req.body); 
  try {
    const { 
      titulo, 
      autor, 
      genero, 
      editora, 
      ano_publicacao, 
      isbn, 
      idioma, 
      formato, 
      caminho_capa, 
      sinopse,
    } = req.body;

    // Validação básica (ajuste conforme necessário)
    if (!titulo || !autor || !sinopse) {
      return res.status(400).json({
        message: "Título, autor, sinopse e ativo são obrigatórios!",
      });
    }

    await db.execute(
      "INSERT INTO livros (titulo, autor, genero, editora, ano_publicacao, isbn, idioma, formato, caminho_capa, sinopse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [titulo, autor, genero, editora, ano_publicacao, isbn, idioma, formato, caminho_capa, sinopse]
    );

    res.status(201).json({ message: "Livro adicionado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  
  
}

export async function listarlivros(req, res) {
    
  console.log('🔍 Iniciando busca de livros...');
  
  try {
    console.log('📊 Executando query no banco...');
    const [rows] = await db.execute("SELECT * FROM livros");
    
    console.log('✅ Query executada! Total de livros:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ erro: error.message });
  }
}

export async function obterlivros(req, res) {
   console.log('🔍 Buscando livro com ID:', req.params.id);
  
  try {
    const [rows] = await db.execute("SELECT * FROM livros WHERE id = ?", [
      req.params.id,
    ]);

    console.log('📊 Resultado da query:', rows);
    console.log('📏 Quantidade de registros:', rows.length);

    if (rows.length === 0) {
      console.log('❌ Livro não encontrado!');
      return res.status(404).json({ message: "Livro não encontrado!" });
    }

    console.log('✅ Livro encontrado:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ erro: error.message });
  }
}

export async function atualizarlivros(req, res) {
  try {
    const { titulo, autor, genero, editora, ano_publicacao, isbn, idioma, formato, caminho_capa, sinopse } = req.body;

    await db.execute(
      "UPDATE livros SET titulo = ?, autor = ?, genero = ?, editora = ?, ano_publicacao = ?, isbn = ?, idioma = ?, formato = ?, caminho_capa = ?, sinopse = ? WHERE id = ?",
      [titulo, autor, genero, editora, ano_publicacao, isbn, idioma, formato, caminho_capa, sinopse, req.params.id]
    );

    res.json({ message: "Livro atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function deletarlivros(req, res) {
  try {
    await db.execute("DELETE FROM livros WHERE id = ?", [req.params.id]);
    res.json({ message: "Livro deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

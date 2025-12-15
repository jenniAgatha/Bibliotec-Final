import { db } from "../config/db.js";

export async function listarlivros(req, res) {
    console.log('📚 Listando todos os livros');
    
    try {
        const [rows] = await db.execute(`
            SELECT 
                id,
                titulo,
                autor,
                genero,
                ano_publicacao,
                editora,
                isbn,
                sinopse,
                caminho_capa
            FROM livros
            ORDER BY titulo ASC
        `);
        
        console.log('📖 Livros encontrados:', rows.length);
        
        res.status(200).json({
            total: rows.length,
            livros: rows
        });
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

export async function obterlivros(req, res) {
    console.log('🔍 Buscando livro ID:', req.params.id);
    
    try {
        const [rows] = await db.execute(
            "SELECT * FROM livros WHERE id = ?",
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado" });
        }
        
        console.log('✅ Livro encontrado:', rows[0].titulo);
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

export async function adicionarlivros(req, res) {
    console.log('📝 Criando novo livro');
    
    try {
        const { 
            titulo, 
            autor, 
            genero, 
            ano_publicacao, 
            editora, 
            isbn, 
            sinopse, 
            caminho_capa 
        } = req.body;
        
        // Validação dos campos obrigatórios
        if (!titulo || !autor) {
            return res.status(400).json({ 
                erro: "Título e autor são obrigatórios" 
            });
        }
        
        console.log('📚 Titulo:', titulo);
        console.log('✍️ Autor:', autor);
        
        // Verifica se já existe um livro com mesmo título e autor
        const [livroExiste] = await db.execute(
            "SELECT id FROM livros WHERE titulo = ? AND autor = ?",
            [titulo, autor]
        );
        
        if (livroExiste.length > 0) {
            return res.status(409).json({ 
                erro: "Livro já cadastrado" 
            });
        }
        
        // Insere o livro
        const [result] = await db.execute(
            `INSERT INTO livros 
            (titulo, autor, genero, ano_publicacao, editora, isbn, sinopse, caminho_capa) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [titulo, autor, genero, ano_publicacao, editora, isbn, sinopse, caminho_capa]
        );
        
        console.log('✅ Livro criado com ID:', result.insertId);
        
        res.status(201).json({ 
            mensagem: "Livro criado com sucesso",
            id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

export async function atualizarlivros(req, res) {
    console.log('✏️ Atualizando livro ID:', req.params.id);
    
    try {
        const { id } = req.params;
        const { 
            titulo, 
            autor, 
            genero = null, 
            ano_publicacao = null, 
            editora = null, 
            isbn = null, 
            sinopse= null, 
            caminho_capa = null 
        } = req.body;
        
        // Verifica se o livro existe
        const [livroExiste] = await db.execute(
            "SELECT id FROM livros WHERE id = ?",
            [id]
        );
        
        if (livroExiste.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado" });
        }
        
        // Atualiza o livro
        await db.execute(
            `UPDATE livros 
            SET titulo = ?, autor = ?, genero = ?, ano_publicacao = ?, 
                editora = ?, isbn = ?, sinopse = ?, caminho_capa = ?
            WHERE id = ?`,
            [titulo, autor, genero, ano_publicacao, editora, isbn, sinopse, caminho_capa, id]
        );
        
        console.log('✅ Livro atualizado com sucesso');
        
        res.status(200).json({ 
            mensagem: "Livro atualizado com sucesso" 
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

export async function deletarlivros(req, res) {
    console.log('🗑️ Deletando livro ID:', req.params.id);
    
    try {
        const { id } = req.params;
        
        // Verifica se o livro existe
        const [livroExiste] = await db.execute(
            "SELECT id FROM livros WHERE id = ?",
            [id]
        );
        
        if (livroExiste.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado" });
        }
        
        // Deleta favoritos relacionados primeiro
        await db.execute(
            "DELETE FROM favoritos WHERE livro_id = ?",
            [id]
        );
        
        // Deleta o livro
        await db.execute(
            "DELETE FROM livros WHERE id = ?",
            [id]
        );
        
        console.log('✅ Livro deletado com sucesso');
        
        res.status(200).json({ 
            mensagem: "Livro deletado com sucesso" 
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

export async function buscarLivrosPorGenero(req, res) {
    console.log('🔍 Buscando livros do gênero:', req.params.genero);
    
    try {
        const [rows] = await db.execute(
            "SELECT * FROM livros WHERE genero = ? ORDER BY titulo ASC",
            [req.params.genero]
        );
        
        console.log('📚 Livros encontrados:', rows.length);
        
        res.status(200).json({
            total: rows.length,
            genero: req.params.genero,
            livros: rows
        });
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}
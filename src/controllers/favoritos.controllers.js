
import { db } from "../config/db.js";

export async function listarFavoritos(req, res) {
   console.log('🔍 Buscando favoritos do usuário:', req.params.id);
    
    try {
        const [rows] = await db.execute(`
            SELECT 
                f.usuario_id,
                f.livro_id,
                l.titulo,
                l.autor,
                l.genero
            FROM favoritos f
            INNER JOIN livros l ON f.livro_id = l.id
            WHERE f.usuario_id = ?
        `, [req.params.id]);
        
        console.log('📚 Favoritos encontrados:', rows.length);
        
        res.status(200).json({
            total: rows.length,
            favoritos: rows
        });
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

export async function criarFavorito(req, res) {
    try {
        const { usuario_id, livro_id } = req.body;
        
        console.log('👤 usuario_id:', usuario_id);
        console.log('📚 livro_id:', livro_id);
        
        if (usuario_id === undefined || livro_id === undefined) {
            console.log('❌ Dados incompletos!');
            return res.status(400).json({ erro: "Dados incompletos" });
        }

        
        const [usuarioExiste] = await db.execute(
            "SELECT id FROM usuarios WHERE id = ?",
            [usuario_id]
        );

        if (usuarioExiste.length === 0) {
            console.log('❌ Usuário não encontrado');
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }


        const [livroExiste] = await db.execute(
            "SELECT id FROM livros WHERE id = ?",
            [livro_id]
        );

        console.log('📊 Livro encontrado:', livroExiste.length);

        if (livroExiste.length === 0) {
            console.log('❌ Livro não encontrado');
            return res.status(404).json({ erro: "Livro não encontrado" });
        }

        console.log('✅ Livro OK, verificando se já está favoritado...');

        const [jaFavoritado] = await db.execute(
            "SELECT id FROM favoritos WHERE usuario_id = ? AND livro_id = ?",
            [usuario_id, livro_id]
        );

        if (jaFavoritado.length > 0) {
            console.log('❌ Já está nos favoritos');
            return res.status(409).json({ erro: "Livro já está nos favoritos" });
        }

        console.log('✅ Inserindo favorito...');

        await db.execute(
            "INSERT INTO favoritos (usuario_id, livro_id) VALUES (?, ?)", 
            [usuario_id, livro_id]
        );
        
        console.log('✅ FAVORITO CRIADO COM SUCESSO!');
        res.status(201).json({ mensagem: "Favorito adicionado com sucesso" }); 
        
    } catch (err) {
        console.error('❌ ERRO CAPTURADO:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function deletarFavorito (req, res) {
    console.log('🗑️ Deletando favorito - Usuário:', req.body.usuario_id, 'Livro:', req.body.livro_id);
    
    try {
        const { usuario_id, livro_id } = req.body;

        if (!usuario_id || !livro_id) {
            return res.status(400).json({ erro: "usuario_id e livro_id são obrigatórios" });
        }

        // Verifica se o favorito existe
        const [favoritoExiste] = await db.execute(
            "SELECT id FROM favoritos WHERE usuario_id = ? AND livro_id = ?",
            [usuario_id, livro_id]
        );

        if (favoritoExiste.length === 0) {
            return res.status(404).json({ erro: "Favorito não encontrado" });
        }

        // Deleta o favorito
        await db.execute(
            "DELETE FROM favoritos WHERE usuario_id = ? AND livro_id = ?",
            [usuario_id, livro_id]
        );
        
        console.log('✅ Favorito deletado com sucesso');
        res.json({ mensagem: "Favorito removido com sucesso" });
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ erro: error.message });
    }
}

        

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import livrosRoutes from "./routes/livros.routes.js"
import usuariosRoutes from "./routes/usuarios.routes.js"
import reservasRoutes from "./routes/reservas.routes.js"
import favoritosRoutes from "./routes/favoritos.routes.js"
import { db } from "./config/db.js"
// ============================
//  Configuração do servidor
// ============================
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static('../'));

// Adiciona esse logger para debug (descomenta!)
// app.use((req, res, next) => {
//   console.log(new Date().toISOString(), req.method, req.url);
//   next();
// });

app.get("/", (req, res) => {
  res.send("API rodando com sucesso")
})

app.use("/livros", livrosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/favoritos",favoritosRoutes)

// ============================
//  Função de limpeza de códigos de verificação
// ============================
async function limparCodigosVerificacao() {
  try {
    const agora = new Date();
    const [resultado] = await db.execute(
      "DELETE FROM codigos_verificacao WHERE expira_em < ? OR usado = TRUE",
      [agora]
    );
    if (resultado.affectedRows > 0) {
      console.log(`🧹 ${resultado.affectedRows} códigos de verificação expirados ou usados foram deletados.`);
    }
  } catch (error) {
    console.error("❌ Erro ao limpar códigos de verificação:", error);
  }
}

// Executa limpeza a cada 1 hora (3600000 ms)
setInterval(limparCodigosVerificacao, 3600000);

// Executa limpeza inicial ao iniciar o servidor
limparCodigosVerificacao();

// ============================
//  Inicia o servidor
// ============================
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
console.log(`http://localhost:${PORT}`);
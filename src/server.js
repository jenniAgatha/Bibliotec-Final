import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import livrosRoutes from "./routes/livros.routes.js"
import usuariosRoutes from "./routes/usuarios.routes.js"
import reservasRoutes from "./routes/reservas.routes.js"
import favoritosRoutes from "./routes/favoritos.routes.js"
// ============================
//  Configuração do servidor
// ============================
const app = express();

app.use(cors());
app.use(bodyParser.json());

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
//  Inicia o servidor
// ============================
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
console.log(`http://localhost:${PORT}`);
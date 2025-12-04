import express from "express"
import{
    adicionarusuarios,
    listarUsuarios,
    obterusuario,
    atualizarusuario,
    deletarusuario,
    loginUsuario
} from"../controllers/usuarios.controller.js"
const router = express.Router();

router.post("/", adicionarusuarios);
router.get("/", listarUsuarios);
router.get("/:id", obterusuario);
router.put("/:id", atualizarusuario);
router.delete("/:id", deletarusuario);
router.post("/login", loginUsuario)

export default router;
import express from "express"
import{
    adicionarusuarios,
    listarUsuarios,
    obterusuario,
    atualizarusuario,
    deletarusuario,
    loginUsuario,
    solicitarCodigoVerificacao,
    verificarCodigoECriarUsuario,
    loginUsuario,
} from"../controllers/usuarios.controller.js"
const router = express.Router();

router.post("/", adicionarusuarios);
router.get("/", listarUsuarios);
router.get("/:id", obterusuario);
router.put("/:id", atualizarusuario);
router.delete("/:id", deletarusuario);
router.post("/login", loginUsuario);
router.post("/solicitar-codigo", solicitarCodigoVerificacao);
router.post("/verificar-codigo", verificarCodigoECriarUsuario);

export default router;
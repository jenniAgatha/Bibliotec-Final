import express from "express"
import{
    adicionarlivros,
    listarlivros,
    obterlivros,
    atualizarlivros,
    deletarlivros
} from"../controllers/livros.controllers.js"

const router = express.Router();

router.post("/", adicionarlivros);
router.get("/", listarlivros);
router.get("/:id", obterlivros);
router.put("/:id", atualizarlivros);
router.delete("/:id", deletarlivros);
export default router;
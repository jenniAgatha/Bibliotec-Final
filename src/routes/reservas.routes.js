
import express from "express"
import {
    listarReservas,
    criarReserva,
    deletarReserva,
    // confirmarEmailReserva

} from "../controllers/reservas.controllers.js";

const router = express.Router();

router.get("/", listarReservas);
router.post("/", criarReserva);
router.delete("/:id", deletarReserva);

// router.patch("/:id/confirmar-email", confirmarEmailReserva);

export default router;
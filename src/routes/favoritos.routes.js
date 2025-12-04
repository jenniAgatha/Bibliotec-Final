import express from 'express';

import {
    listarFavoritos,
    criarFavorito,
    deletarFavorito
} from '../controllers/favoritos.controllers.js';

const router = express.Router();

router.get('/:id', listarFavoritos);
router.post('/', criarFavorito);
router.delete('/', deletarFavorito);
export default router;


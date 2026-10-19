const express = require('express');
const router = express.Router();
const expedidosController = require('../controllers/expedidosController');
const recebidosController = require('../controllers/recebidosController');

router.get('/', (req, res) => {
  res.redirect('/expedidos');
});

// ROTAS: PROCESSOS - EXPEDIDOS
router.get('/expedidos', expedidosController.index);
router.post('/expedidos', expedidosController.store);
router.put('/expedidos/:id', expedidosController.update);
router.post('/expedidos/:id', expedidosController.update); // Suporte direto via POST para evitar 404 de edição
router.delete('/expedidos/:id', expedidosController.destroy);

// ROTAS: PROCESSOS - RECEBIDOS
router.get('/recebidos', recebidosController.index);
router.post('/recebidos', recebidosController.store);
router.put('/recebidos/:id', recebidosController.update);
router.post('/recebidos/:id', recebidosController.update); // Suporte direto via POST para evitar 404 de edição
router.delete('/recebidos/:id', recebidosController.destroy);

module.exports = router;
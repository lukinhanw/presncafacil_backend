const express = require('express');
const { verifyToken } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// Protege todas as rotas com autenticação
router.use(verifyToken);

// Rota para obter as estatísticas do dashboard
router.get('/stats', dashboardController.getStats);

module.exports = router; 
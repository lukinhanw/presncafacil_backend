const express = require('express');
const router = express.Router();
const termsController = require('../controllers/terms.controller');
const { verifyToken } = require('../middleware/auth');

// Rota para aceitar os termos
router.post('/accept', verifyToken, termsController.acceptTerms);

// Rota para verificar o status dos termos
router.get('/status', verifyToken, termsController.getTermsStatus);

module.exports = router; 
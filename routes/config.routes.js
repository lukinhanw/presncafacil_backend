const express = require('express');
const { body } = require('express-validator');
const configController = require('../controllers/config.controller');
const { verifyToken, hasRole } = require('../middleware/auth');

const router = express.Router();

// Validações
const configValidations = [
	body('titulo')
		.notEmpty().withMessage('Título é obrigatório')
		.trim(),
	body('logo')
		.optional()
		.custom((value) => {
			if (value && !value.startsWith('data:image')) {
				throw new Error('Formato de imagem inválido');
			}
			return true;
		})
];

// Rota pública para obter configurações
router.get('/', configController.getConfig);

// Rotas protegidas por autenticação e role ADMIN
router.use(verifyToken);
router.use(hasRole(['ADMIN_ROLE']));

// Atualizar configurações
router.put('/', configValidations, configController.updateConfig);

module.exports = router; 
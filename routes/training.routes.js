const express = require('express');
const { body } = require('express-validator');
const trainingController = require('../controllers/training.controller');
const { verifyToken, hasRole } = require('../middleware/auth');

const router = express.Router();

// Validações comuns para criação e atualização
const trainingValidations = [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('code').notEmpty().withMessage('Código é obrigatório'),
    body('duration')
        .notEmpty().withMessage('Duração é obrigatória')
        .matches(/^([0-9]{2}):([0-9]{2})$/).withMessage('Formato de duração inválido. Use HH:mm'),
    body('provider').notEmpty().withMessage('Fornecedor é obrigatório'),
    body('classification').notEmpty().withMessage('Classificação é obrigatória'),
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
    body('objective').notEmpty().withMessage('Objetivo é obrigatório')
];

// Rotas
router.get('/', verifyToken, trainingController.getTrainings);

router.post('/',
    verifyToken,
    hasRole(['ADMIN_ROLE']),
    trainingValidations,
    trainingController.createTraining
);

router.put('/:id',
    verifyToken,
    hasRole(['ADMIN_ROLE']),
    trainingValidations,
    trainingController.updateTraining
);

router.delete('/:id',
    verifyToken,
    hasRole(['ADMIN_ROLE']),
    trainingController.deleteTraining
);

module.exports = router; 
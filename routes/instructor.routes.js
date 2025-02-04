const express = require('express');
const { body } = require('express-validator');
const instructorController = require('../controllers/instructor.controller');
const { verifyToken: authMiddleware, hasRole } = require('../middleware/auth');

const router = express.Router();

// Middleware para verificar se é admin
const isAdmin = hasRole(['ADMIN_ROLE']);

// Validações comuns para criação e atualização
const instructorValidations = [
    body('name')
        .notEmpty().withMessage('Nome é obrigatório')
        .trim(),
    body('registration')
        .notEmpty().withMessage('Matrícula é obrigatória')
        .trim(),
    body('unit')
        .notEmpty().withMessage('Unidade é obrigatória')
        .trim(),
    body('position')
        .notEmpty().withMessage('Cargo é obrigatório')
        .trim(),
    body('email')
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido')
        .trim()
];

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas públicas (apenas autenticação necessária)
router.get('/', instructorController.findAll);
router.get('/:id', instructorController.findById);

// Rotas que requerem papel de ADMIN
router.use(isAdmin);

// Criar instrutor
router.post('/', instructorValidations, instructorController.create);

// Atualizar instrutor
router.put('/:id', instructorValidations, instructorController.update);

// Excluir instrutor
router.delete('/:id', instructorController.delete);

// Alterar status do instrutor
router.patch('/:id/toggle-status', instructorController.toggleStatus);

// Resetar senha do instrutor
router.post('/:id/reset-password', instructorController.resetPassword);

module.exports = router; 
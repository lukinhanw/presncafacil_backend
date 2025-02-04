const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { verifyToken: authMiddleware, hasRole } = require('../middleware/auth');

const router = express.Router();

// Middleware para verificar se é super admin
const isSuperAdmin = hasRole(['ADMIN_ROLE']);

// Validações comuns para criação e atualização
const adminValidations = [
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

// Todas as rotas requerem papel de ADMIN
router.use(isSuperAdmin);

// Listar todos os administradores
router.get('/', adminController.getAdmins);

// Buscar administrador por ID
router.get('/:id', adminController.findById);

// Criar administrador
router.post('/', adminValidations, adminController.create);

// Atualizar administrador
router.put('/:id', adminValidations, adminController.update);

// Excluir administrador
router.delete('/:id', adminController.delete);

// Resetar senha do administrador
router.post('/:id/reset-password', adminController.resetPassword);

// Alternar status do administrador
router.patch('/:id/toggle-status', adminController.toggleStatus);

module.exports = router; 
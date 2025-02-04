const express = require('express');
const { body } = require('express-validator');
const employeeController = require('../controllers/employee.controller');
const { verifyToken, hasRole } = require('../middleware/auth');

const router = express.Router();

// Validações comuns para criação e atualização
const employeeValidations = [
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
    body('cardNumber')
        .optional({ nullable: true })
        .isLength({ min: 14, max: 14 }).withMessage('O cartão NFC deve ter 14 caracteres')
        .trim()
];

// Rotas públicas
router.get('/registration/:registration', employeeController.getEmployeeByRegistration);
router.get('/card/:cardNumber', employeeController.getEmployeeByCardNumber);

// Rotas protegidas por autenticação
router.use(verifyToken);

// Listar colaboradores (com filtros)
router.get('/', employeeController.getEmployees);

// Buscar colaboradores (para autocomplete)
router.get('/search', employeeController.searchEmployees);

// Rotas que requerem papel de ADMIN
router.use(hasRole(['ADMIN_ROLE']));

// Criar colaborador
router.post('/', employeeValidations, employeeController.createEmployee);

// Atualizar colaborador
router.put('/:id', employeeValidations, employeeController.updateEmployee);

// Excluir colaborador
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router; 
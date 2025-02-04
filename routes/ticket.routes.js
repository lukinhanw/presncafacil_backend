const express = require('express');
const { body } = require('express-validator');
const ticketController = require('../controllers/ticket.controller');
const { verifyToken, hasRole } = require('../middleware/auth');
const uploadService = require('../services/upload.service');

const router = express.Router();

// Validações para criação de ticket
const ticketValidations = [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('description').notEmpty().withMessage('Descrição é obrigatória'),
    body('priority')
        .custom((value) => {
            const priority = value?.value || value;

            if (!priority) {
                throw new Error('Prioridade é obrigatória');
            }
            if (!['low', 'medium', 'high'].includes(priority)) {
                throw new Error('Prioridade inválida');
            }
            return true;
        }),
    body('category')
        .custom((value) => {
            const category = value?.value || value;

            if (!category) {
                throw new Error('Categoria é obrigatória');
            }
            if (!['technical', 'doubt', 'error', 'suggestion'].includes(category)) {
                throw new Error('Categoria inválida');
            }
            return true;
        })
];

// Validação para mensagens
const messageValidations = [
    body('message').notEmpty().withMessage('Mensagem é obrigatória')
];

// Validação para status
const statusValidations = [
    body('status')
        .custom((value) => {
            const status = value?.value || value;

            if (!status) {
                throw new Error('Status é obrigatório');
            }
            if (!['open', 'in-progress', 'closed'].includes(status)) {
                throw new Error('Status inválido');
            }
            return true;
        })
];

// Middleware para debug do body
const logRequestBody = (req, res, next) => {
    next();
};

// Rotas
router.get('/', 
    verifyToken, 
    ticketController.getTickets
);

router.get('/:id', 
    verifyToken, 
    ticketController.getTicketById
);

router.post('/',
    verifyToken,
    uploadService.getUploadMiddleware('tickets'),
    logRequestBody,
    ticketValidations,
    ticketController.createTicket
);

router.post('/:id/messages',
    verifyToken,
    uploadService.getUploadMiddleware('tickets'),
    messageValidations,
    ticketController.addMessage
);

router.patch('/:id/status',
    verifyToken,
    hasRole(['ADMIN_ROLE']),
    logRequestBody,
    statusValidations,
    ticketController.updateStatus
);

module.exports = router; 
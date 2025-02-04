const express = require('express');
const { body } = require('express-validator');
const classController = require('../controllers/class.controller');
const { verifyToken, hasRole } = require('../middleware/auth');

const router = express.Router();

// Validações comuns
const classValidations = [
    body('name').optional().notEmpty().withMessage('Nome é obrigatório quando informado'),
    body('date_start').notEmpty().withMessage('Data de início é obrigatória'),
    body('unit').notEmpty().withMessage('Unidade é obrigatória'),
    body('type').isIn(['Portfolio', 'External', 'DDS', 'Others']).withMessage('Tipo inválido'),
    body('instructor').notEmpty().withMessage('Instrutor é obrigatório'),
    body('instructor.id').notEmpty().withMessage('ID do instrutor é obrigatório')
];

// Validações para registro de presença
const attendeeValidations = [
    body('name').notEmpty().withMessage('Nome do participante é obrigatório'),
    body('registration').notEmpty().withMessage('Matrícula do participante é obrigatória'),
    body('unit').notEmpty().withMessage('Unidade do participante é obrigatória')
];

// Rotas de convite (públicas)
router.get('/:id/invite/:token', classController.validateInviteToken);
router.post('/:id/invite/:token/join', attendeeValidations, classController.joinClassByInvite);
router.get('/:id/participants/:registration/check', classController.checkParticipant);

// Rotas protegidas por autenticação
router.use(verifyToken);

// Rotas básicas
router.get('/', classController.getClasses);
router.get('/:id', classController.getClassById);
router.post('/', hasRole(['ADMIN_ROLE']), classValidations, classController.createClass);
router.put('/:id', hasRole(['ADMIN_ROLE']), classValidations, classController.updateClass);
router.delete('/:id', hasRole(['ADMIN_ROLE']), classController.deleteClass);

// Rotas para gerenciar participantes
router.post('/:id/attendees', attendeeValidations, classController.registerAttendance);
router.post('/:id/attendees/:attendeeId/early-leave', classController.registerEarlyLeave);
router.delete('/:id/attendees/:attendeeId', classController.removeAttendee);

// Rotas para gerenciar status da aula
router.post('/:id/finish', hasRole(['ADMIN_ROLE']), classController.finishClass);

// Rotas para convites (protegidas)
router.post('/:id/invite', hasRole(['ADMIN_ROLE']), classController.generateInviteLink);

module.exports = router; 
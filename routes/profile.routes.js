const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profile.controller');
const { verifyToken: authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validações para atualização do perfil
const updateProfileValidations = [
    body('name')
        .optional()
        .notEmpty().withMessage('Nome é obrigatório')
        .trim(),
    body('email')
        .optional()
        .isEmail().withMessage('Email inválido')
        .trim(),
    body('position')
        .optional()
        .notEmpty().withMessage('Cargo é obrigatório')
        .trim(),
    body('unit')
        .optional()
        .notEmpty().withMessage('Unidade é obrigatória')
        .trim()
];

// Validações para alteração de senha
const changePasswordValidations = [
    body('currentPassword')
        .notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword')
        .notEmpty().withMessage('Nova senha é obrigatória')
        .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres')
];

// Validações para atualização de avatar
const updateAvatarValidations = [
    body('avatar')
        .notEmpty().withMessage('Imagem é obrigatória')
        .isString().withMessage('Formato de imagem inválido')
        .custom((value) => {
            if (!value.startsWith('data:image')) {
                throw new Error('Formato de imagem inválido');
            }
            return true;
        })
];

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Obter perfil do usuário
router.get('/', profileController.getProfile);

// Atualizar perfil do usuário
router.put('/', updateProfileValidations, profileController.updateProfile);

// Alterar senha
router.post('/change-password', changePasswordValidations, profileController.changePassword);

// Atualizar avatar
router.post('/avatar', updateAvatarValidations, profileController.updateAvatar);

module.exports = router; 
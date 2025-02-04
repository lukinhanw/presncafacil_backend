const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .not()
        .isEmpty()
        .withMessage('Senha é obrigatória')
], authController.login);

module.exports = router; 
const { validationResult } = require('express-validator');
const profileService = require('../services/profile.service');

class ProfileController {
    async getProfile(req, res) {
        try {
            const profile = await profileService.getProfile(req.user.id);
            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const profile = await profileService.updateProfile(req.user.id, req.body);
            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: profile
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const profile = await profileService.changePassword(req.user.id, req.body);
            
            res.json({
                success: true,
                message: 'Senha alterada com sucesso',
                data: profile
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateAvatar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const profile = await profileService.updateAvatar(req.user.id, req.body.avatar);
            res.json({
                success: true,
                message: 'Foto de perfil atualizada com sucesso',
                data: profile
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ProfileController(); 
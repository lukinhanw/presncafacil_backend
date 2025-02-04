const { validationResult } = require('express-validator');
const adminService = require('../services/admin.service');

class AdminController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const admin = await adminService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Administrador criado com sucesso',
                data: admin
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const admin = await adminService.update(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Administrador atualizado com sucesso',
                data: admin
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            await adminService.delete(req.params.id);
            res.json({
                success: true,
                message: 'Administrador removido com sucesso'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async findAll(req, res) {
        try {
            const admins = await adminService.findAll(req.query);
            res.json({
                success: true,
                data: admins || []
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const admin = await adminService.findById(req.params.id);
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrador não encontrado'
                });
            }
            res.json({
                success: true,
                data: admin
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const admin = await adminService.resetPassword(req.params.id);
            res.json({
                success: true,
                message: 'Senha do administrador resetada com sucesso',
                data: admin
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async toggleStatus(req, res) {
        try {
            const admin = await adminService.toggleStatus(req.params.id);
            res.json({
                success: true,
                message: `Administrador ${admin.is_active ? 'ativado' : 'desativado'} com sucesso`,
                data: admin
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAdmins(req, res) {
        try {
            const filters = {
                search: req.query.search,
                units: req.query.units,
                positions: req.query.positions
            };

            const admins = await adminService.getAdmins(filters);
            res.json({
                success: true,
                data: admins || []
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AdminController(); 
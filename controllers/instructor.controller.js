const { validationResult } = require('express-validator');
const instructorService = require('../services/instructor.service');

class InstructorController {
    async create(req, res) {
        try {
            const instructor = await instructorService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Instrutor criado com sucesso',
                data: instructor
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
            const instructor = await instructorService.update(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Instrutor atualizado com sucesso',
                data: instructor
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
            await instructorService.delete(req.params.id);
            res.json({
                success: true,
                message: 'Instrutor desativado com sucesso'
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
            const instructors = await instructorService.findAll(req.query);
            res.json({
                success: true,
                data: instructors || []
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
            const instructor = await instructorService.findById(req.params.id);
            if (!instructor) {
                return res.status(404).json({
                    success: false,
                    message: 'Instrutor não encontrado'
                });
            }
            res.json({
                success: true,
                data: instructor
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
            const instructor = await instructorService.toggleInstructorStatus(req.params.id);
            res.json({
                success: true,
                message: `Instrutor ${instructor.isActive ? 'ativado' : 'desativado'} com sucesso`,
                data: instructor
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
            const instructor = await instructorService.resetPassword(req.params.id);
            res.json({
                success: true,
                message: 'Senha do instrutor resetada com sucesso',
                data: instructor
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new InstructorController(); 
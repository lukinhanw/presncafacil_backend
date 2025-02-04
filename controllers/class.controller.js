const classService = require('../services/class.service');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Class = require('../models/class.model');
const ClassParticipant = require('../models/classParticipant.model');

class ClassController {
    async getClasses(req, res, next) {
        try {
            const filters = {
                search: req.query.search,
                types: req.query.types,
                units: req.query.units,
                userRole: req.user.role,
                userId: req.user.id
            };
            
            const classes = await classService.getClasses(filters);
            res.json(classes);
        } catch (error) {
            console.error('Erro ao buscar aulas:', error);
            next(error);
        }
    }

    async getClassById(req, res, next) {
        try {
            const classData = await classService.getClassById(req.params.id);
            res.json(classData);
        } catch (error) {
            console.error('Erro ao buscar aula:', error);
            next(error);
        }
    }

    async createClass(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const classData = await classService.createClass(req.body);
            res.status(201).json(classData);
        } catch (error) {
            console.error('Erro ao criar aula:', error);
            next(error);
        }
    }

    async updateClass(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const classData = await classService.updateClass(req.params.id, req.body);
            res.json(classData);
        } catch (error) {
            console.error('Erro ao atualizar aula:', error);
            next(error);
        }
    }

    async deleteClass(req, res, next) {
        try {
            await classService.deleteClass(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar aula:', error);
            next(error);
        }
    }

    // Novos métodos para gerenciar participantes
    async registerAttendance(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const classData = await classService.registerAttendance(req.params.id, req.body);
            res.json(classData);
        } catch (error) {
            console.error('Erro ao registrar presença:', error);
            next(error);
        }
    }

    async registerEarlyLeave(req, res, next) {
        try {
            const classData = await classService.registerEarlyLeave(req.params.id, req.params.attendeeId);
            res.json(classData);
        } catch (error) {
            console.error('Erro ao registrar saída antecipada:', error);
            next(error);
        }
    }

    async removeAttendee(req, res, next) {
        try {
            const classData = await classService.removeAttendee(req.params.id, req.params.attendeeId);
            res.json(classData);
        } catch (error) {
            console.error('Erro ao remover participante:', error);
            next(error);
        }
    }

    async finishClass(req, res, next) {
        try {
            const classData = await classService.finishClass(req.params.id);
            res.json(classData);
        } catch (error) {
            console.error('Erro ao finalizar aula:', error);
            next(error);
        }
    }

    async generateInviteLink(req, res, next) {
        try {
            const { expiresInMinutes } = req.body;
            const inviteData = await classService.generateInviteLink(req.params.id, expiresInMinutes);
            res.json(inviteData);
        } catch (error) {
            console.error('Erro ao gerar link de convite:', error);
            next(error);
        }
    }

    async validateInviteToken(req, res, next) {
        try {
            const { id, token } = req.params;
            const result = await classService.validateInviteToken(id, token);
            res.json(result);
        } catch (error) {
            console.error('Erro ao validar token:', error);
            next(error);
        }
    }

    async joinClassByInvite(req, res, next) {
        try {
            const { id, token } = req.params;
            const { name, registration, unit, position } = req.body;

            // Validações manuais já que não podemos usar express-validator com FormData
            if (!name) {
                return res.status(400).json({ error: 'Nome do participante é obrigatório' });
            }
            if (!registration) {
                return res.status(400).json({ error: 'Matrícula do participante é obrigatória' });
            }
            if (!unit) {
                return res.status(400).json({ error: 'Unidade do participante é obrigatória' });
            }

            // Se a foto vier como arquivo
            let photoData = null;
            if (req.file) {
                photoData = req.file.buffer.toString('base64');
            } else if (req.body.photo) {
                photoData = req.body.photo;
            }

            const result = await classService.joinClassByInvite(id, token, {
                name,
                registration,
                unit,
                position,
                photo: photoData
            });
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Erro ao registrar presença por convite:', error);
            res.status(400).json({ error: error.message || 'Erro ao registrar presença por convite' });
        }
    }

    async checkParticipant(req, res, next) {
        try {
            const { id, registration } = req.params;
            
            if (!id || !registration) {
                return res.status(400).json({ 
                    error: 'ID da aula e matrícula são obrigatórios' 
                });
            }

            const result = await classService.checkParticipant(id, registration);
            res.json(result);
        } catch (error) {
            console.error('Erro ao verificar participante:', error);
            res.status(error.message === 'Aula não encontrada' ? 404 : 500).json({
                error: error.message || 'Erro ao verificar participante'
            });
        }
    }
}

module.exports = new ClassController(); 
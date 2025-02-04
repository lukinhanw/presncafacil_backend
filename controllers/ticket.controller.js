const { validationResult } = require('express-validator');
const ticketService = require('../services/ticket.service');

class TicketController {
    async getTickets(req, res) {
        try {
            const isInstructor = req.user.roles.includes('INSTRUCTOR_ROLE');
            const isAdmin = req.user.roles.includes('ADMIN_ROLE');

            const filters = {
                ...req.query,
                userId: req.user.id,
                userType: isInstructor ? 'instructor' : 'user',
                isAdmin: isAdmin
            };

            const tickets = await ticketService.getTickets(filters);
            res.json(tickets);
        } catch (error) {
            console.error('Erro ao buscar tickets:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async getTicketById(req, res) {
        try {
            const ticket = await ticketService.getTicketById(req.params.id);
            
            // Verificar se o usuário tem acesso ao ticket
            const isAdmin = req.user.roles.includes('ADMIN_ROLE');
            const isOwner = (
                (ticket.creator_type === 'user' && ticket.creator.id === req.user.id) ||
                (ticket.creator_type === 'instructor' && ticket.creator.id === req.user.id)
            );

            if (!isAdmin && !isOwner) {
                return res.status(403).json({ message: 'Acesso negado' });
            }

            res.json(ticket);
        } catch (error) {
            console.error('Erro ao buscar ticket:', error);
            res.status(404).json({ message: error.message });
        }
    }

    async createTicket(req, res) {
        try {
            // Extrair valores dos objetos do select se necessário
            const ticketData = {
                ...req.body,
                priority: req.body.priority?.value || req.body.priority,
                category: req.body.category?.value || req.body.category
            };

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Erro de validação',
                    errors: errors.array()
                });
            }

            const ticket = await ticketService.createTicket({
                ...ticketData,
                userId: req.user.id,
                userType: req.user.roles.includes('INSTRUCTOR_ROLE') ? 'instructor' : 'user',
                attachments: req.files
            });
            res.status(201).json(ticket);
        } catch (error) {
            console.error('Erro ao criar ticket:', error);
            res.status(400).json({ message: error.message });
        }
    }

    async addMessage(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Erro de validação',
                    errors: errors.array()
                });
            }

            const ticket = await ticketService.getTicketById(req.params.id);
            
            // Verificar se o usuário tem acesso ao ticket
            const isAdmin = req.user.roles.includes('ADMIN_ROLE');
            const isOwner = (
                (ticket.creator_type === 'user' && ticket.creator.id === req.user.id) ||
                (ticket.creator_type === 'instructor' && ticket.creator.id === req.user.id)
            );

            if (!isAdmin && !isOwner) {
                return res.status(403).json({ message: 'Acesso negado' });
            }

            const updatedTicket = await ticketService.addMessage(req.params.id, {
                ...req.body,
                userId: req.user.id,
                attachments: req.files,
                isSupport: req.user.roles.includes('ADMIN_ROLE')
            });
            res.json(updatedTicket);
        } catch (error) {
            console.error('Erro ao adicionar mensagem:', error);
            res.status(400).json({ message: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            // Extrair valor do objeto do select se necessário
            const statusData = {
                ...req.body,
                status: req.body.status?.value || req.body.status
            };

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Erro de validação',
                    errors: errors.array()
                });
            }

            // Apenas administradores podem atualizar o status
            if (!req.user.roles.includes('ADMIN_ROLE')) {
                return res.status(403).json({ message: 'Acesso negado' });
            }

            const ticket = await ticketService.updateTicketStatus(
                req.params.id,
                statusData.status
            );
            res.json(ticket);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new TicketController(); 
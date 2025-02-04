const { Op } = require('sequelize');
const Ticket = require('../models/ticket.model');
const TicketMessage = require('../models/ticketMessage.model');
const User = require('../models/user.model');
const Instructor = require('../models/instructor.model');
const uploadService = require('./upload.service');
const path = require('path');
const crypto = require('crypto');

class TicketService {
    formatTicketResponse(ticket) {
        const plainTicket = ticket.get({ plain: true });
        
        // Formatar datas ISO
        plainTicket.created_at = plainTicket.created_at?.toISOString();
        plainTicket.updated_at = plainTicket.updated_at?.toISOString();
        
        // Formatar criador
        if (plainTicket.creator_type === 'user' && plainTicket.userCreator) {
            plainTicket.creator = plainTicket.userCreator;
        } else if (plainTicket.creator_type === 'instructor' && plainTicket.instructorCreator) {
            plainTicket.creator = plainTicket.instructorCreator;
        }
        
        // Remover campos desnecessários
        delete plainTicket.userCreator;
        delete plainTicket.instructorCreator;
        
        if (plainTicket.messages) {
            plainTicket.messages = plainTicket.messages.map(message => {
                const attachments = Array.isArray(message.attachments) ? message.attachments : [];
                return {
                    ...message,
                    created_at: message.created_at?.toISOString(),
                    updated_at: message.updated_at?.toISOString(),
                    attachments: attachments
                };
            });
        }
        
        return plainTicket;
    }

    async getTickets(filters = {}) {
        const where = {};

        // Se não for admin, só mostra os tickets do próprio usuário
        if (!filters.isAdmin) {
            where.creator_id = filters.userId;
            where.creator_type = filters.userType;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.category) {
            where.category = filters.category;
        }

        if (filters.priority) {
            where.priority = filters.priority;
        }

        const tickets = await Ticket.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'userCreator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Instructor,
                    as: 'instructorCreator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: TicketMessage,
                    as: 'messages',
                    include: [
                        {
                            model: User,
                            as: 'userSender',
                            attributes: ['id', 'name'],
                            required: false
                        },
                        {
                            model: Instructor,
                            as: 'instructorSender',
                            attributes: ['id', 'name'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['updated_at', 'DESC']]
        });

        return tickets.map(ticket => this.formatTicketResponse(ticket));
    }

    async getTicketById(id) {
        const ticket = await Ticket.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'userCreator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Instructor,
                    as: 'instructorCreator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: TicketMessage,
                    as: 'messages',
                    include: [
                        {
                            model: User,
                            as: 'userSender',
                            attributes: ['id', 'name'],
                            required: false
                        },
                        {
                            model: Instructor,
                            as: 'instructorSender',
                            attributes: ['id', 'name'],
                            required: false
                        }
                    ],
                    order: [['created_at', 'ASC']]
                }
            ]
        });

        if (!ticket) {
            throw new Error('Ticket não encontrado');
        }

        return this.formatTicketResponse(ticket);
    }

    async createTicket(data) {
        const ticket = await Ticket.create({
            title: data.title,
            description: data.description,
            priority: data.priority,
            category: data.category,
            creator_id: data.userId,
            creator_type: data.userType
        });

        // Processar anexos
        let attachments = [];
        if (data.attachments && data.attachments.length > 0) {
            attachments = await Promise.all(
                data.attachments.map(async file => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const fileName = `ticket_${ticket.id}_${uniqueSuffix}${path.extname(file.originalname)}`;
                    
                    await uploadService.saveBase64Image(file.buffer.toString('base64'), `ticket_${ticket.id}`);
                    
                    return {
                        name: file.originalname,
                        url: `/api/uploads/${fileName}`
                    };
                })
            );
        }

        // Criar primeira mensagem com a descrição
        await TicketMessage.create({
            message: data.description,
            sender_id: data.userId,
            sender_type: data.userType || 'user',
            ticket_id: ticket.id,
            is_support: false,
            attachments: attachments || []
        });

        return this.getTicketById(ticket.id);
    }

    async addMessage(ticketId, data) {
        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
            throw new Error('Ticket não encontrado');
        }

        // Processar anexos
        let attachments = [];
        if (data.attachments && data.attachments.length > 0) {
            attachments = await Promise.all(
                data.attachments.map(async file => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const fileName = `ticket_${ticketId}_${uniqueSuffix}${path.extname(file.originalname)}`;
                    
                    await uploadService.saveBase64Image(file.buffer.toString('base64'), `ticket_${ticketId}`);
                    
                    return {
                        name: file.originalname,
                        url: `/api/uploads/${fileName}`
                    };
                })
            );
        }

        await TicketMessage.create({
            message: data.message,
            sender_id: data.userId,
            sender_type: data.userType || 'user',
            ticket_id: ticketId,
            is_support: data.isSupport,
            attachments: attachments || []
        });

        // Atualizar o timestamp do ticket
        await ticket.update({ updated_at: new Date() });

        return this.getTicketById(ticketId);
    }

    async updateTicketStatus(ticketId, status) {
        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
            throw new Error('Ticket não encontrado');
        }

        if (!['open', 'in-progress', 'closed'].includes(status)) {
            throw new Error('Status inválido');
        }

        await ticket.update({ status });
        return this.getTicketById(ticketId);
    }
}

module.exports = new TicketService(); 
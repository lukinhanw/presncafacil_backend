const { Op } = require('sequelize');
const crypto = require('crypto');
const Class = require('../models/class.model');
const Instructor = require('../models/instructor.model');
const ClassParticipant = require('../models/classParticipant.model');
const ClassInvite = require('../models/classInvite.model');
const uploadService = require('./upload.service');

// URL base para os arquivos estáticos
const API_URL = process.env.API_URL || 'http://localhost:5000';

class ClassService {
    // Método auxiliar para formatar o tipo
    formatType(type) {
        switch (type) {
            case 'Portfolio': return 'Portfólio';
            case 'External': return 'Externo';
            case 'DDS': return 'DDS';
            case 'Others': return 'Outros';
            default: return type;
        }
    }

    getCodeByType(type) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        switch (type) {
            case 'DDS':
                return `DDS${year}${month}${day}${random}`;
            case 'External':
                return `EXT${year}${month}${day}${random}`;
            case 'Others':
                return `OUT${year}${month}${day}${random}`;
            default:
                return `${year}${month}${day}${random}`;
        }
    }

    async getClasses(filters = {}) {
        const where = {
            status: 'scheduled',
            date_end: null
        };

        // Se for instrutor, filtra apenas as aulas dele
        if (filters.userRole === 'INSTRUCTOR_ROLE') {
            where.instructor_id = filters.userId;
        }
        // Se for admin, não aplica filtro adicional (verá todas as aulas)

        // Filtro por texto (busca em nome, código)
        if (filters.search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filters.search}%` } },
                { code: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        // Filtro por tipos
        if (filters.types && filters.types !== '') {
            try {
                let typesArray;
                // Se já for um array, usa direto
                if (Array.isArray(filters.types)) {
                    typesArray = filters.types;
                } else {
                    // Tenta fazer o parse apenas se for uma string não vazia
                    typesArray = JSON.parse(filters.types);
                }
                
                if (Array.isArray(typesArray) && typesArray.length > 0 && !typesArray.every(type => type === null)) {
                    where.type = { [Op.in]: typesArray.filter(type => type !== null) };
                }
            } catch (error) {
                console.error('Erro ao processar filtro de tipos:', error);
            }
        }

        // Filtro por unidades
        if (filters.units && filters.units !== '') {
            try {
                let unitsArray;
                // Se já for um array, usa direto
                if (Array.isArray(filters.units)) {
                    unitsArray = filters.units;
                } else {
                    // Tenta fazer o parse apenas se for uma string não vazia
                    unitsArray = JSON.parse(filters.units);
                }
                
                if (Array.isArray(unitsArray) && unitsArray.length > 0 && !unitsArray.every(unit => unit === null)) {
                    where.unit = { [Op.in]: unitsArray.filter(unit => unit !== null) };
                }
            } catch (error) {
                console.error('Erro ao processar filtro de unidades:', error);
            }
        }

        try {
            const classes = await Class.findAll({
                where,
                include: [
                    {
                        model: Instructor,
                        as: 'instructor',
                        attributes: ['id', 'name', 'registration', 'unit', 'position']
                    },
                    {
                        model: ClassParticipant,
                        as: 'participants',
                        attributes: ['id', 'name', 'registration', 'unit', 'position', 'photo', 'type', 'timestamp', 'early_leave', 'early_leave_time']
                    }
                ],
                order: [['date_start', 'DESC']]
            });

            // Formatar os dados para o formato esperado pelo frontend
            return classes.map(classItem => ({
                id: classItem.id,
                type: this.formatType(classItem.type),
                originalType: classItem.type,
                date_start: classItem.date_start,
                date_end: classItem.date_end,
                presents: classItem.participants?.length || 0,
                status: classItem.status,
                unit: classItem.unit,
                training: {
                    name: classItem.name,
                    code: classItem.code,
                    duration: classItem.duration,
                    provider: classItem.provider,
                    content: classItem.content,
                    classification: classItem.classification,
                    objective: classItem.objective
                },
                instructor: classItem.instructor ? {
                    id: classItem.instructor.id,
                    name: classItem.instructor.name,
                    registration: classItem.instructor.registration,
                    unit: classItem.instructor.unit,
                    position: classItem.instructor.position
                } : null,
                attendees: classItem.participants?.map(p => ({
                    id: p.id,
                    name: p.name,
                    registration: p.registration,
                    unit: p.unit,
                    position: p.position,
                    photo: p.photo ? `${API_URL}/api/uploads/${p.photo}` : null,
                    type: p.type,
                    timestamp: p.timestamp,
                    early_leave: p.early_leave,
                    early_leave_time: p.early_leave_time
                })) || []
            }));
        } catch (error) {
            console.error('Erro ao buscar aulas:', error);
            throw error;
        }
    }

    async getClassById(id) {
        try {
            const classData = await Class.findByPk(id, {
                include: [
                    {
                        model: Instructor,
                        as: 'instructor',
                        attributes: ['id', 'name', 'registration', 'unit', 'position']
                    },
                    {
                        model: ClassParticipant,
                        as: 'participants',
                        attributes: ['id', 'name', 'registration', 'unit', 'position', 'photo', 'type', 'timestamp', 'early_leave', 'early_leave_time']
                    }
                ]
            });
            
            if (!classData) {
                throw new Error('Aula não encontrada');
            }

            // Formatar os dados para o formato esperado pelo frontend
            return {
                id: classData.id,
                type: this.formatType(classData.type),
                originalType: classData.type,
                date_start: classData.date_start,
                date_end: classData.date_end,
                presents: classData.presents,
                status: classData.status,
                unit: classData.unit,
                training: {
                    name: classData.name,
                    code: classData.code,
                    duration: classData.duration,
                    provider: classData.provider,
                    content: classData.content,
                    classification: classData.classification,
                    objective: classData.objective
                },
                instructor: classData.instructor ? {
                    id: classData.instructor.id,
                    name: classData.instructor.name,
                    registration: classData.instructor.registration,
                    unit: classData.instructor.unit,
                    position: classData.instructor.position
                } : null,
                attendees: classData.participants?.map(p => ({
                    id: p.id,
                    name: p.name,
                    registration: p.registration,
                    unit: p.unit,
                    position: p.position,
                    photo: p.photo ? `${p.photo}` : null,
                    type: p.type,
                    timestamp: p.timestamp,
                    early_leave: p.early_leave,
                    early_leave_time: p.early_leave_time
                })) || []
            };
        } catch (error) {
            console.error('Erro ao buscar aula:', error);
            throw error;
        }
    }

    async createClass(data) {
        try {
            // Validações específicas por tipo
            if (data.type === 'Portfolio') {
                if (!data.training) {
                    throw new Error('Dados do treinamento são obrigatórios para tipo Portfolio');
                }
            } else {
                if (!data.name) {
                    throw new Error('Nome é obrigatório');
                }
            }

            // Validações comuns
            if (!data.date_start) {
                throw new Error('Data de início é obrigatória');
            }
            if (!data.unit) {
                throw new Error('Unidade é obrigatória');
            }
            if (!data.instructor || !data.instructor.id) {
                throw new Error('Instrutor é obrigatório');
            }

            // Preparar os dados para criação
            const classData = {
                type: data.type,
                date_start: data.date_start,
                presents: 0,
                status: 'scheduled',
                unit: data.unit,
                instructor_id: data.instructor.id,
                name: data.type === 'Portfolio' ? data.training.name : data.name,
                code: data.type === 'Portfolio' ? data.training.code : this.getCodeByType(data.type),
                duration: data.type === 'Portfolio' ? data.training.duration : 
                         data.type === 'DDS' ? '00:40' : (data.duration || ''),
                provider: data.type === 'Portfolio' ? data.training.provider : (data.provider || ''),
                content: data.type === 'Portfolio' ? data.training.content : (data.content || ''),
                classification: data.type === 'Portfolio' ? data.training.classification : (data.classification || ''),
                objective: data.type === 'Portfolio' ? data.training.objective : (data.objective || '')
            };

            const newClass = await Class.create(classData);
            return this.getClassById(newClass.id);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(err => err.message).join(', ');
                throw new Error(`Erro de validação: ${messages}`);
            }
            if (error.name === 'SequelizeDatabaseError') {
                throw new Error(`Erro ao criar aula: ${error.message}`);
            }
            throw error;
        }
    }

    async updateClass(id, data) {
        try {
            const classToUpdate = await Class.findByPk(id);
            if (!classToUpdate) {
                throw new Error('Aula não encontrada');
            }

            // Não permitir atualização de aulas finalizadas
            if (classToUpdate.status === 'completed') {
                throw new Error('Não é possível atualizar uma aula finalizada');
            }

            await classToUpdate.update(data);
            return this.getClassById(id);
        } catch (error) {
            console.error('Erro ao atualizar aula:', error);
            throw error;
        }
    }

    async deleteClass(id) {
        try {
            const classToDelete = await Class.findByPk(id);
            if (!classToDelete) {
                throw new Error('Aula não encontrada');
            }

            // Não permitir exclusão de aulas finalizadas
            if (classToDelete.status === 'completed') {
                throw new Error('Não é possível excluir uma aula finalizada');
            }

            await classToDelete.destroy();
        } catch (error) {
            console.error('Erro ao excluir aula:', error);
            throw error;
        }
    }

    async registerAttendance(classId, attendeeData) {
        try {
            const classInstance = await Class.findByPk(classId);
            if (!classInstance) {
                throw new Error('Aula não encontrada');
            }

            if (classInstance.status !== 'scheduled') {
                throw new Error('Não é possível registrar presença em uma aula finalizada');
            }

            // Verifica se o participante já está registrado
            const existingAttendee = await ClassParticipant.findOne({
                where: {
                    class_id: classId,
                    registration: attendeeData.registration
                }
            });

            if (existingAttendee) {
                throw new Error('Participante já registrado nesta aula');
            }

            // Se houver foto, salva usando o serviço de upload
            let photoFileName = null;
            if (attendeeData.photo) {
                photoFileName = await uploadService.saveBase64Image(
                    attendeeData.photo,
                    `class_${classId}_${attendeeData.registration}`
                );
            }

            // Cria o novo participante
            const newParticipant = await ClassParticipant.create({
                class_id: classId,
                name: attendeeData.name,
                registration: attendeeData.registration,
                unit: attendeeData.unit,
                position: attendeeData.position,
                photo: photoFileName,
                type: attendeeData.type || 'Manual'
            });

            // Atualiza o contador de presentes na aula
            const participantsCount = await ClassParticipant.count({
                where: { class_id: classId }
            });
            await classInstance.update({ presents: participantsCount });

            return newParticipant;
        } catch (error) {
            // Se houver erro e a foto foi salva, remove o arquivo
            if (error.photoFileName) {
                try {
                    await uploadService.deleteFile(error.photoFileName);
                } catch (deleteError) {
                    console.error('Erro ao deletar arquivo após falha:', deleteError);
                }
            }
            throw error;
        }
    }

    async registerEarlyLeave(classId, participantId) {
        try {
            const participant = await ClassParticipant.findOne({
                where: {
                    class_id: classId,
                    id: participantId
                }
            });

            if (!participant) {
                throw new Error('Participante não encontrado nesta aula');
            }

            if (participant.early_leave) {
                throw new Error('Saída antecipada já registrada para este participante');
            }

            // Registra a saída antecipada
            await participant.update({
                early_leave: true,
                early_leave_time: new Date()
            });

            return this.getClassById(classId);
        } catch (error) {
            console.error('Erro ao registrar saída antecipada:', error);
            throw error;
        }
    }

    async removeAttendee(classId, participantId) {
        try {
            const classInstance = await Class.findByPk(classId);
            if (!classInstance) {
                throw new Error('Aula não encontrada');
            }

            if (classInstance.status === 'completed') {
                throw new Error('Não é possível remover participantes de uma aula finalizada');
            }

            const participant = await ClassParticipant.findOne({
                where: {
                    class_id: classId,
                    id: participantId
                }
            });

            if (!participant) {
                throw new Error('Participante não encontrado nesta aula');
            }

            // Se o participante tinha foto, remove o arquivo
            if (participant.photo) {
                try {
                    await uploadService.deleteFile(participant.photo);
                } catch (deleteError) {
                    console.error('Erro ao deletar foto do participante:', deleteError);
                }
            }

            // Remove o participante
            await participant.destroy();

            // Atualiza o contador de presentes na aula
            const participantsCount = await ClassParticipant.count({
                where: { class_id: classId }
            });
            await classInstance.update({ presents: participantsCount });

            return this.getClassById(classId);
        } catch (error) {
            console.error('Erro ao remover participante:', error);
            throw error;
        }
    }

    async finishClass(classId) {
        try {
            const classData = await Class.findByPk(classId);
            if (!classData) {
                throw new Error('Aula não encontrada');
            }

            if (classData.status === 'completed') {
                throw new Error('Aula já finalizada');
            }

            if (classData.status === 'cancelled') {
                throw new Error('Não é possível finalizar uma aula cancelada');
            }

            // Finaliza a aula
            await classData.update({
                status: 'completed',
                date_end: new Date()
            });

            return this.getClassById(classId);
        } catch (error) {
            console.error('Erro ao finalizar aula:', error);
            throw error;
        }
    }

    async generateInviteLink(classId, expiresInMinutes = 60) {
        try {
            const classData = await Class.findByPk(classId);
            if (!classData) {
                throw new Error('Aula não encontrada');
            }

            // Gera um token único
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

            // Cria um novo registro de convite
            await ClassInvite.create({
                class_id: classId,
                token,
                expires_at: expiresAt,
                is_active: true
            });

            // Retorna a URL formatada
            return {
                token,
                url: `/api/classes/${classId}/invite/${token}`,
                expiresAt
            };
        } catch (error) {
            console.error('Erro ao gerar link de convite:', error);
            throw error;
        }
    }

    async validateInviteToken(classId, token) {
        try {
            const classData = await Class.findOne({
                where: {
                    id: classId,
                    status: 'scheduled'
                },
                include: [
                    {
                        model: Instructor,
                        as: 'instructor',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!classData) {
                return {
                    valid: false,
                    message: 'Aula não encontrada ou já finalizada'
                };
            }

            // Busca o convite ativo
            const invite = await ClassInvite.findOne({
                where: {
                    class_id: classId,
                    token: token,
                    is_active: true,
                    expires_at: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!invite) {
                return {
                    valid: false,
                    message: 'Link de convite inválido ou expirado'
                };
            }

            return {
                valid: true,
                classData: {
                    id: classData.id,
                    name: classData.name,
                    unit: classData.unit,
                    date_start: classData.date_start,
                    instructor: classData.instructor
                }
            };
        } catch (error) {
            console.error('Erro ao validar token:', error);
            throw error;
        }
    }

    async checkParticipant(classId, registration) {
        try {
            // Primeiro verifica se a aula existe
            const classData = await Class.findByPk(classId);
            if (!classData) {
                throw new Error('Aula não encontrada');
            }

            // Busca o participante
            const participant = await ClassParticipant.findOne({
                where: {
                    class_id: classId,
                    registration: registration
                }
            });

            return {
                isRegistered: !!participant,
                participant: participant ? {
                    id: participant.id,
                    name: participant.name,
                    registration: participant.registration,
                    unit: participant.unit,
                    position: participant.position,
                    type: participant.type,
                    timestamp: participant.timestamp
                } : null
            };
        } catch (error) {
            console.error('Erro ao verificar participante:', error);
            throw error;
        }
    }

    async joinClassByInvite(classId, token, attendeeData) {
        try {
            // Valida o token primeiro
            const validationResult = await this.validateInviteToken(classId, token);
            if (!validationResult.valid) {
                throw new Error(validationResult.message);
            }

            // Verifica se o participante já está registrado
            const existingParticipant = await ClassParticipant.findOne({
                where: {
                    class_id: classId,
                    registration: attendeeData.registration
                }
            });

            if (existingParticipant) {
                throw new Error('Você já está inscrito nesta aula');
            }

            // Se houver foto, salva usando o serviço de upload
            let photoFileName = null;
            if (attendeeData.photo) {
                photoFileName = await uploadService.saveBase64Image(
                    attendeeData.photo,
                    `class_${classId}_${attendeeData.registration}`
                );
            }

            // Registra a presença
            const participant = await ClassParticipant.create({
                class_id: classId,
                name: attendeeData.name,
                registration: attendeeData.registration,
                unit: attendeeData.unit,
                position: attendeeData.position || 'Não informado',
                photo: photoFileName,
                type: 'Convite'
            });

            // Atualiza o contador de presentes
            await Class.increment('presents', { where: { id: classId } });

            return participant;
        } catch (error) {
            // Se houver erro e a foto foi salva, remove o arquivo
            if (error.photoFileName) {
                try {
                    await uploadService.deleteFile(error.photoFileName);
                } catch (deleteError) {
                    console.error('Erro ao deletar arquivo após falha:', deleteError);
                }
            }
            throw error;
        }
    }
}

module.exports = new ClassService(); 
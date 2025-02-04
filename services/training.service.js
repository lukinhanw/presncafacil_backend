const Training = require('../models/training.model');
const { Op } = require('sequelize');

class TrainingService {
    async getTrainings(filters = {}) {
        try {
            const where = {};

            if (filters.search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { code: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.providers?.length > 0) {
                where.provider = { [Op.in]: filters.providers };
            }

            if (filters.classifications?.length > 0) {
                where.classification = { [Op.in]: filters.classifications };
            }

            return await Training.findAll({ where });
        } catch (error) {
            console.error('Erro ao buscar treinamentos:', error);
            throw error;
        }
    }

    async createTraining(data) {
        try {
            // Verifica se já existe um treinamento com o mesmo código
            const existingTraining = await Training.findOne({
                where: { code: data.code }
            });

            if (existingTraining) {
                const error = new Error('Código de treinamento já existe');
                error.statusCode = 400;
                throw error;
            }

            return await Training.create(data);
        } catch (error) {
            console.error('Erro ao criar treinamento:', error);
            throw error;
        }
    }

    async updateTraining(id, data) {
        try {
            const training = await Training.findByPk(id);
            if (!training) {
                const error = new Error('Treinamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            // Verifica se o novo código já existe em outro treinamento
            if (data.code && data.code !== training.code) {
                const existingTraining = await Training.findOne({
                    where: { code: data.code }
                });

                if (existingTraining) {
                    const error = new Error('Código de treinamento já existe');
                    error.statusCode = 400;
                    throw error;
                }
            }

            return await training.update(data);
        } catch (error) {
            console.error('Erro ao atualizar treinamento:', error);
            throw error;
        }
    }

    async deleteTraining(id) {
        try {
            const training = await Training.findByPk(id);
            if (!training) {
                const error = new Error('Treinamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await training.destroy();
        } catch (error) {
            console.error('Erro ao deletar treinamento:', error);
            throw error;
        }
    }
}

module.exports = new TrainingService(); 
const trainingService = require('../services/training.service');
const { validationResult } = require('express-validator');

class TrainingController {
    async getTrainings(req, res, next) {
        try {
            const filters = {
                search: req.query.search,
                providers: req.query.providers ? JSON.parse(req.query.providers) : [],
                classifications: req.query.classifications ? JSON.parse(req.query.classifications) : []
            };
            
            const trainings = await trainingService.getTrainings(filters);
            res.json(trainings);
        } catch (error) {
            console.error('Erro ao buscar treinamentos:', error);
            next(error);
        }
    }

    async createTraining(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const training = await trainingService.createTraining(req.body);
            res.status(201).json(training);
        } catch (error) {
            console.error('Erro ao criar treinamento:', error);
            next(error);
        }
    }

    async updateTraining(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const training = await trainingService.updateTraining(req.params.id, req.body);
            res.json(training);
        } catch (error) {
            console.error('Erro ao atualizar treinamento:', error);
            next(error);
        }
    }

    async deleteTraining(req, res, next) {
        try {
            await trainingService.deleteTraining(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar treinamento:', error);
            next(error);
        }
    }
}

module.exports = new TrainingController(); 
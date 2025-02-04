const termsService = require('../services/terms.service');

class TermsController {
    async acceptTerms(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.roles.includes('INSTRUCTOR_ROLE') ? 'instructor' : 'admin';
            
            await termsService.acceptTerms(userId, userType);
            res.json({ message: 'Termos aceitos com sucesso' });
        } catch (error) {
            console.error('Erro ao aceitar termos:', error);
            next(error);
        }
    }

    async getTermsStatus(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.roles.includes('INSTRUCTOR_ROLE') ? 'instructor' : 'admin';
            
            const status = await termsService.getTermsStatus(userId, userType);
            res.json(status);
        } catch (error) {
            console.error('Erro ao buscar status dos termos:', error);
            next(error);
        }
    }
}

module.exports = new TermsController(); 
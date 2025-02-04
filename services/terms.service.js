const User = require('../models/user.model');
const Instructor = require('../models/instructor.model');

class TermsService {
    async acceptTerms(userId, userType) {
        try {
            let user;
            
            if (userType === 'instructor') {
                user = await Instructor.findByPk(userId);
            } else {
                user = await User.findByPk(userId);
            }

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            await user.update({ terms: 1 });

            return { success: true };
        } catch (error) {
            console.error('Erro ao aceitar termos:', error);
            throw error;
        }
    }

    async getTermsStatus(userId, userType) {
        try {
            let user;
            
            if (userType === 'instructor') {
                user = await Instructor.findByPk(userId);
            } else {
                user = await User.findByPk(userId);
            }

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            return {
                terms: user.terms,
                hasAccepted: user.terms === 1
            };
        } catch (error) {
            console.error('Erro ao buscar status dos termos:', error);
            throw error;
        }
    }
}

module.exports = new TermsService(); 
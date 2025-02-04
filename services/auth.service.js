const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Instructor = require('../models/instructor.model');

class AuthService {
    async login(email, password) {
        // Busca o usuário pelo email em ambas as tabelas
        const user = await User.findOne({
            where: { email }
        });

        const instructor = await Instructor.findOne({
            where: { email }
        });

        // Se não encontrou em nenhuma tabela
        if (!user && !instructor) {
            throw new Error('Credenciais inválidas');
        }

        // Tenta autenticar como usuário
        if (user) {
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Credenciais inválidas');
            }

            const token = this.generateToken(user);
            const userJson = user.toJSON();
            delete userJson.password;

            return {
                user: {
                    ...userJson,
                    terms: userJson.terms || 0
                },
                token
            };
        }

        // Tenta autenticar como instrutor
        if (instructor) {
            const isPasswordValid = await instructor.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Credenciais inválidas');
            }

            // Converte o instrutor para o formato de usuário
            const instructorJson = instructor.toJSON();
            delete instructorJson.password;

            const userData = {
                ...instructorJson,
                roles: ['INSTRUCTOR_ROLE'],
                terms: instructorJson.terms || 0
            };

            const token = this.generateToken(userData);

            return {
                user: userData,
                token
            };
        }
    }

    generateToken(user) {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const userData = user.toJSON ? user.toJSON() : user;
        
        // Garante que roles seja um array
        const roles = Array.isArray(userData.roles) ? userData.roles : 
                     (typeof userData.roles === 'string' ? JSON.parse(userData.roles) : 
                     [userData.roles]).filter(Boolean);

        const token = jwt.sign(
            {
                id: userData.id,
                email: userData.email,
                roles: roles,
                terms: userData.terms || 0
            },
            secret,
            { expiresIn: '24h' }
        );

        return token;
    }
}

module.exports = new AuthService(); 
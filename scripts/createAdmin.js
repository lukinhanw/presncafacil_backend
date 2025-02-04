require('dotenv').config();
const User = require('../models/user.model');
const sequelize = require('../config/database');

const createAdminUser = async () => {
    try {
        // Conecta ao banco de dados
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados');

        // Sincroniza o modelo (cria a tabela se não existir)
        await sequelize.sync();

        // Cria o usuário administrador
        const adminUser = await User.create({
            name: 'Administrador',
            email: 'admin@example.com',
            password: '102030',
            roles: ['ADMIN_ROLE'],
            position: 'Administrador do Sistema',
            unit: 'Matriz',
            registration: 'ADM001'
        });

        console.log('Usuário administrador criado com sucesso:', adminUser.toJSON());
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar usuário administrador:', error);
        process.exit(1);
    }
};

createAdminUser(); 
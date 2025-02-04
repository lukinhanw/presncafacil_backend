const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Training = sequelize.define('Training', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Nome é obrigatório' },
            notEmpty: { msg: 'Nome é obrigatório' }
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Código é obrigatório' }
        }
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Duração é obrigatória' },
            is: {
                args: /^([0-9]{2}):([0-9]{2})$/,
                msg: 'Formato de duração inválido. Use HH:mm'
            }
        }
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Fornecedor é obrigatório' }
        }
    },
    classification: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Classificação é obrigatória' }
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Conteúdo é obrigatório' }
        }
    },
    objective: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Objetivo é obrigatório' }
        }
    }
}, {
    tableName: 'trainings',
    underscored: true
});

module.exports = Training;
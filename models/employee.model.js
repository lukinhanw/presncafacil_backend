const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
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
    registration: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Matrícula é obrigatória' },
            notEmpty: { msg: 'Matrícula é obrigatória' }
        }
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Unidade é obrigatória' },
            notEmpty: { msg: 'Unidade é obrigatória' }
        }
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Cargo é obrigatório' },
            notEmpty: { msg: 'Cargo é obrigatório' }
        }
    },
    cardNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            len: {
                args: [14, 14],
                msg: 'O cartão NFC deve ter 14 caracteres'
            }
        }
    },
    lastCardRead: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'employees',
    underscored: true
});

module.exports = Employee; 
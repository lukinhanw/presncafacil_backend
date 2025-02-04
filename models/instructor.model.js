const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Instructor = sequelize.define('Instructor', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Email é obrigatório' },
            isEmail: { msg: 'Email inválido' }
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Senha é obrigatória' }
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    terms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'instructors',
    underscored: true,
    hooks: {
        beforeSave: async (instructor) => {
            if (instructor.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                instructor.password = await bcrypt.hash(instructor.password, salt);
            }
        }
    }
});

// Método para comparar senhas
Instructor.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Instructor; 
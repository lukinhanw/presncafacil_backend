const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Senha é obrigatória' }
        }
    },
    roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ['ADMIN_ROLE'],
        get() {
            const value = this.getDataValue('roles');
            if (!value) return ['ADMIN_ROLE'];
            return Array.isArray(value) ? value : 
                   (typeof value === 'string' ? JSON.parse(value) : [value]).filter(Boolean);
        },
        set(value) {
            const roles = Array.isArray(value) ? value : 
                         (typeof value === 'string' ? JSON.parse(value) : [value]).filter(Boolean);
            this.setDataValue('roles', roles);
        },
        validate: {
            isValidRole(value) {
                const roles = Array.isArray(value) ? value : 
                            (typeof value === 'string' ? JSON.parse(value) : [value]).filter(Boolean);
                
                if (!Array.isArray(roles)) {
                    throw new Error('Roles deve ser um array');
                }
                
                const validRoles = ['ADMIN_ROLE', 'INSTRUCTOR_ROLE'];
                if (!roles.every(role => validRoles.includes(role))) {
                    throw new Error('Role inválida');
                }
            }
        }
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Cargo é obrigatório' }
        }
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Unidade é obrigatória' }
        }
    },
    registration: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Matrícula é obrigatória' }
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        get() {
            const value = this.getDataValue('is_active');
            // Garante que o valor seja sempre booleano
            return value === null || value === undefined ? true : !!value;
        },
        set(value) {
            // Garante que o valor seja sempre booleano
            this.setDataValue('is_active', !!value);
        }
    },
    terms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'users',
    underscored: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Método para comparar senhas
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User; 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Instructor = require('./instructor.model');

const Ticket = sequelize.define('ticket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'open',
        validate: {
            isIn: [['open', 'in-progress', 'closed']]
        }
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['low', 'medium', 'high']]
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['technical', 'doubt', 'error', 'suggestion']]
        }
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    creator_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['user', 'instructor']]
        }
    }
}, {
    tableName: 'tickets',
    timestamps: true,
    underscored: true
});

// Relacionamentos polimórficos
Ticket.belongsTo(User, {
    foreignKey: 'creator_id',
    constraints: false,
    as: 'userCreator'
});

Ticket.belongsTo(Instructor, {
    foreignKey: 'creator_id',
    constraints: false,
    as: 'instructorCreator'
});

module.exports = Ticket; 
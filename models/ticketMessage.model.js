const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Instructor = require('./instructor.model');
const Ticket = require('./ticket.model');

const TicketMessage = sequelize.define('ticket_message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_support: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_type: {
        type: DataTypes.ENUM('user', 'instructor'),
        allowNull: false
    },
    ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tickets',
            key: 'id'
        }
    },
    attachments: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
            const value = this.getDataValue('attachments');
            return value || [];
        }
    }
}, {
    tableName: 'ticket_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Relacionamentos polimórficos
TicketMessage.belongsTo(User, { 
    foreignKey: 'sender_id', 
    constraints: false,
    as: 'userSender'
});

TicketMessage.belongsTo(Instructor, { 
    foreignKey: 'sender_id', 
    constraints: false,
    as: 'instructorSender'
});

TicketMessage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Ticket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });

module.exports = TicketMessage; 
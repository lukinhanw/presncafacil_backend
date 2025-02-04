const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Class = require('./class.model');

const ClassParticipant = sequelize.define('class_participant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'classes',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    registration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Manual'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    early_leave: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    early_leave_time: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'class_participants',
    timestamps: true,
    underscored: true
});

// Relacionamento com a tabela de classes
ClassParticipant.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(ClassParticipant, { foreignKey: 'class_id', as: 'participants' });

module.exports = ClassParticipant; 
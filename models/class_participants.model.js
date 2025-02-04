const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Class = require('./class.model');

const ClassParticipants = sequelize.define('class_participants', {
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
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    early_leave: {
        type: DataTypes.BOOLEAN,
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

// Relacionamentos
ClassParticipants.belongsTo(Class, {
    foreignKey: 'class_id',
    as: 'class'
});

Class.hasMany(ClassParticipants, {
    foreignKey: 'class_id',
    as: 'class_participants'
});

module.exports = ClassParticipants; 
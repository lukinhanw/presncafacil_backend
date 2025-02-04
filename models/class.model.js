const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Instructor = require('./instructor.model');

const Class = sequelize.define('classes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('Portfolio', 'External', 'DDS', 'Others'),
        allowNull: false
    },
    instructor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'instructors',
            key: 'id'
        }
    },
    date_start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_end: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    classification: {
        type: DataTypes.STRING,
        allowNull: true
    },
    objective: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'classes',
    timestamps: true,
    underscored: true
});

// Relacionamentos
Class.belongsTo(Instructor, { 
    foreignKey: 'instructor_id', 
    as: 'instructor' 
});

module.exports = Class; 
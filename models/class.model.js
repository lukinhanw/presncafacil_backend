const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Instructor = require('./instructor.model');

const Class = sequelize.define('class', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Portfolio', 'External', 'DDS', 'Others']]
        }
    },
    date_start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_end: {
        type: DataTypes.DATE,
        allowNull: true
    },
    presents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'scheduled',
        validate: {
            isIn: [['scheduled', 'completed', 'cancelled']]
        }
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
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
    },
    instructor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'instructors',
            key: 'id'
        }
    }
}, {
    tableName: 'classes',
    timestamps: true,
    underscored: true
});

// Relacionamento com a tabela de instrutores
Class.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'instructor' });

module.exports = Class; 
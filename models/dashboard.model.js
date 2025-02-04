const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DashboardStats = sequelize.define('dashboard_stats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_classes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_attendees: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_training_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    completion_rate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    tableName: 'dashboard_stats',
    timestamps: true,
    underscored: true
});

module.exports = DashboardStats; 
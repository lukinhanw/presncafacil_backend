const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Lista de Presença Digital'
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'configs',
    timestamps: true,
    underscored: true
});

module.exports = Config; 
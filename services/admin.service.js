const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const sequelize = require('../config/database');

class AdminService {
    async getAdmins(filters = {}) {
        const where = sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`);
        const conditions = [];

        if (filters.search) {
            conditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { registration: { [Op.like]: `%${filters.search}%` } }
                ]
            });
        }

        if (filters.units) {
            const unitArray = typeof filters.units === 'string' ? 
                filters.units.split(',') : filters.units;
            
            if (unitArray.length > 0) {
                conditions.push({ unit: { [Op.in]: unitArray } });
            }
        }

        if (filters.positions) {
            const positionArray = typeof filters.positions === 'string' ? 
                filters.positions.split(',') : filters.positions;
            
            if (positionArray.length > 0) {
                conditions.push({ position: { [Op.in]: positionArray } });
            }
        }

        const admins = await User.findAll({ 
            where: {
                [Op.and]: [where, ...conditions]
            },
            order: [['name', 'ASC']]
        });

        // Converte is_active para isActive em cada registro
        return admins.map(admin => {
            const data = admin.toJSON();
            data.isActive = data.is_active;
            delete data.is_active;
            return data;
        });
    }

    async create(adminData) {
        const transaction = await sequelize.transaction();

        try {
            const existingUser = await User.findOne({
                where: { 
                    [Op.or]: [
                        { registration: adminData.registration },
                        { email: adminData.email }
                    ]
                }
            });

            if (existingUser) {
                throw new Error('Já existe um usuário com esta matrícula ou email');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password || adminData.registration, salt);

            const admin = await User.create({
                ...adminData,
                password: hashedPassword,
                roles: ['ADMIN_ROLE'],
                is_active: true
            }, { transaction });

            await transaction.commit();
            const data = admin.toJSON();
            data.isActive = data.is_active;
            delete data.is_active;
            return data;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async update(id, adminData) {
        const transaction = await sequelize.transaction();

        try {
            const admin = await User.findByPk(id);
            if (!admin) {
                throw new Error('Administrador não encontrado');
            }

            const hasAdminRole = await User.findOne({
                where: {
                    id,
                    [Op.and]: [
                        sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`)
                    ]
                }
            });

            if (!hasAdminRole) {
                throw new Error('Usuário não é um administrador');
            }

            const updatedAdmin = await admin.update({
                ...adminData,
                roles: ['ADMIN_ROLE']
            }, { transaction });

            await transaction.commit();
            const data = updatedAdmin.toJSON();
            data.isActive = data.is_active;
            delete data.is_active;
            return data;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async delete(id) {
        const transaction = await sequelize.transaction();

        try {
            const admin = await User.findOne({
                where: {
                    id,
                    [Op.and]: [
                        sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`)
                    ]
                }
            });

            if (!admin) {
                throw new Error('Administrador não encontrado');
            }

            await admin.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async findAll(query = {}) {
        const where = {
            [Op.and]: [
                sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`),
                query
            ]
        };

        const admins = await User.findAll({
            where,
            order: [['name', 'ASC']]
        });
        
        // Converte is_active para isActive em cada registro
        return admins.map(admin => {
            const data = admin.toJSON();
            data.isActive = data.is_active;
            delete data.is_active;
            return data;
        });
    }

    async findById(id) {
        const admin = await User.findOne({
            where: { 
                id,
                [Op.and]: [
                    sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`)
                ]
            }
        });
        
        if (admin) {
            const data = admin.toJSON();
            data.isActive = data.is_active;
            delete data.is_active;
            return data;
        }
        return null;
    }

    async resetPassword(id) {
        const transaction = await sequelize.transaction();

        try {
            const admin = await User.findOne({
                where: {
                    id,
                    [Op.and]: [
                        sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`)
                    ]
                }
            });

            if (!admin) {
                throw new Error('Administrador não encontrado');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(admin.registration, salt);

            await admin.update({ 
                password: hashedPassword 
            }, { transaction });

            await transaction.commit();

            const data = admin.toJSON();
            data.isActive = data.is_active;
            delete data.password;
            delete data.is_active;
            return data;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async toggleStatus(id) {
        const transaction = await sequelize.transaction();

        try {
            // Modificando a consulta para garantir que todos os campos sejam carregados
            const admin = await User.findOne({
                where: {
                    id,
                    [Op.and]: [
                        sequelize.literal(`JSON_CONTAINS(roles, '"ADMIN_ROLE"')`)
                    ]
                },
                attributes: ['id', 'name', 'email', 'roles', 'is_active', 'position', 'unit', 'registration']
            });

            if (!admin) {
                throw new Error('Administrador não encontrado');
            }

            // Forçando o valor booleano atual
            const currentStatus = !!admin.is_active;
            const novoStatus = !currentStatus;

            const updatedAdmin = await admin.update({ 
                is_active: novoStatus 
            }, { transaction });

            await transaction.commit();

            const data = updatedAdmin.toJSON();
            data.isActive = !!data.is_active; // Forçando valor booleano
            delete data.is_active;

            return data;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}

module.exports = new AdminService(); 
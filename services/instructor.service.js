const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const Instructor = require('../models/instructor.model');
const User = require('../models/user.model');
const Class = require('../models/class.model');
const sequelize = require('../config/database');

class InstructorService {
    async getInstructors(filters = {}) {
        const where = {};

        if (filters.search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filters.search}%` } },
                { registration: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        if (filters.units) {
            const unitArray = typeof filters.units === 'string' ? 
                filters.units.split(',') : filters.units;
            
            if (unitArray.length > 0) {
                where.unit = { [Op.in]: unitArray };
            }
        }

        if (filters.positions) {
            const positionArray = typeof filters.positions === 'string' ? 
                filters.positions.split(',') : filters.positions;
            
            if (positionArray.length > 0) {
                where.position = { [Op.in]: positionArray };
            }
        }

        const instructors = await Instructor.findAll({ where });
        return instructors;
    }

    async create(instructorData) {
        const transaction = await sequelize.transaction();

        try {
            const existingInstructor = await Instructor.findOne({
                where: { registration: instructorData.registration }
            });

            const existingUser = await User.findOne({
                where: { registration: instructorData.registration }
            });

            if (existingInstructor || existingUser) {
                throw new Error('Já existe um instrutor ou usuário com esta matrícula');
            }

            const existingEmail = await User.findOne({
                where: { email: instructorData.email }
            });

            if (existingEmail) {
                throw new Error('Já existe um usuário com este email');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(instructorData.registration, salt);

            const instructor = await Instructor.create({
                ...instructorData,
                password: hashedPassword
            }, { transaction });

            const userData = {
                name: instructorData.name,
                email: instructorData.email,
                password: instructorData.registration,
                roles: ['INSTRUCTOR_ROLE'],
                position: instructorData.position,
                unit: instructorData.unit,
                registration: instructorData.registration
            };

            await User.create(userData, { transaction });
            await transaction.commit();
            
            return instructor;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async update(id, instructorData) {
        const transaction = await sequelize.transaction();

        try {
            const instructor = await Instructor.findByPk(id);
            if (!instructor) {
                throw new Error('Instrutor não encontrado');
            }

            await instructor.update(instructorData, { transaction });

            const user = await User.findOne({ 
                where: { registration: instructor.registration },
                transaction 
            });

            if (user) {
                await user.update({
                    name: instructorData.name,
                    email: instructorData.email,
                    position: instructorData.position,
                    unit: instructorData.unit
                }, { transaction });
            }

            await transaction.commit();
            return instructor;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async delete(id) {
        const transaction = await sequelize.transaction();

        try {
            const instructor = await Instructor.findByPk(id);
            if (!instructor) {
                throw new Error('Instrutor não encontrado');
            }

            const classesCount = await Class.count({
                where: { instructor_id: id }
            });

            if (classesCount > 0) {
                throw new Error(`Não é possível excluir o instrutor pois existem ${classesCount} aulas associadas a ele. Considere desativar o instrutor em vez de excluí-lo.`);
            }

            const user = await User.findOne({ 
                where: { registration: instructor.registration },
                transaction 
            });

            if (user) {
                await user.destroy({ transaction });
            }

            await instructor.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async searchInstructors(query) {
        if (!query || query.length < 2) return [];

        return await Instructor.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { registration: { [Op.like]: `%${query}%` } }
                ],
                isActive: true
            },
            limit: 10
        });
    }

    async getInstructorById(id) {
        const instructor = await Instructor.findByPk(id);
        if (!instructor) {
            throw new Error('Instrutor não encontrado');
        }
        return instructor;
    }

    async toggleInstructorStatus(id) {
        const transaction = await sequelize.transaction();

        try {
            const instructor = await Instructor.findByPk(id);
            if (!instructor) {
                throw new Error('Instrutor não encontrado');
            }

            const newStatus = !instructor.isActive;
            
            await instructor.update({ 
                isActive: newStatus 
            }, { transaction });

            const user = await User.findOne({ 
                where: { registration: instructor.registration },
                transaction 
            });

            if (user) {
                await user.update({ 
                    isActive: newStatus 
                }, { transaction });
            }

            await transaction.commit();
            return instructor;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async findAll(query = {}) {
        const instructors = await Instructor.findAll({
            where: { ...query },
            order: [['name', 'ASC']]
        });
        
        return instructors;
    }

    async findById(id) {
        const instructor = await Instructor.findOne({
            where: { id }
        });
        
        return instructor;
    }

    async resetPassword(id) {
        const transaction = await sequelize.transaction();

        try {
            const instructor = await Instructor.findByPk(id);
            if (!instructor) {
                throw new Error('Instrutor não encontrado');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(instructor.registration, salt);

            await instructor.update({ 
                password: hashedPassword 
            }, { transaction });

            const user = await User.findOne({ 
                where: { registration: instructor.registration },
                transaction 
            });

            if (user) {
                await user.update({ 
                    password: instructor.registration
                }, { transaction });
            }

            await transaction.commit();

            const instructorData = instructor.toJSON();
            delete instructorData.password;
            return instructorData;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new InstructorService(); 
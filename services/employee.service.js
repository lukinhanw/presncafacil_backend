const { Op } = require('sequelize');
const Employee = require('../models/employee.model');

class EmployeeService {
    async getEmployees(filters = {}) {
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

        return await Employee.findAll({ where });
    }

    async createEmployee(data) {
        const existingRegistration = await Employee.findOne({
            where: { registration: data.registration }
        });

        if (existingRegistration) {
            throw new Error('Matrícula já cadastrada');
        }

        if (data.cardNumber) {
            const existingCard = await Employee.findOne({
                where: { cardNumber: data.cardNumber }
            });

            if (existingCard) {
                throw new Error('Número do cartão já cadastrado');
            }
        }

        return await Employee.create(data);
    }

    async updateEmployee(id, data) {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            throw new Error('Colaborador não encontrado');
        }

        const existingRegistration = await Employee.findOne({
            where: {
                registration: data.registration,
                id: { [Op.ne]: id }
            }
        });

        if (existingRegistration) {
            throw new Error('Matrícula já cadastrada');
        }

        if (data.cardNumber) {
            const existingCard = await Employee.findOne({
                where: {
                    cardNumber: data.cardNumber,
                    id: { [Op.ne]: id }
                }
            });

            if (existingCard) {
                throw new Error('Número do cartão já cadastrado');
            }
        }

        await employee.update(data);
        return employee;
    }

    async deleteEmployee(id) {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            throw new Error('Colaborador não encontrado');
        }

        await employee.destroy();
    }

    async searchEmployees(query) {
        if (!query || query.length < 2) return [];

        return await Employee.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { registration: { [Op.like]: `%${query}%` } }
                ]
            },
            limit: 10
        });
    }

    async getEmployeeById(id) {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            throw new Error('Colaborador não encontrado');
        }
        return employee;
    }

    async getEmployeeByRegistration(registration) {
        try {
            const employee = await Employee.findOne({
                where: { registration }
            });

            if (!employee) {
                const error = new Error('Funcionário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            return employee;
        } catch (error) {
            console.error('Erro ao buscar funcionário por matrícula:', error);
            throw error;
        }
    }

    async getEmployeeByCardNumber(cardNumber) {
        const employee = await Employee.findOne({
            where: { cardNumber }
        });
        if (!employee) {
            throw new Error('Cartão não cadastrado');
        }

        await employee.update({ lastCardRead: new Date() });
        return employee;
    }
}

module.exports = new EmployeeService(); 
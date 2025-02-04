const { validationResult } = require('express-validator');
const employeeService = require('../services/employee.service');

class EmployeeController {
    async getEmployees(req, res, next) {
        try {
            const filters = {
                search: req.query.search,
                units: req.query.units,
                positions: req.query.positions
            };

            const employees = await employeeService.getEmployees(filters);
            res.json(employees);
        } catch (error) {
            next(error);
        }
    }

    async createEmployee(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const employee = await employeeService.createEmployee(req.body);
            res.status(201).json(employee);
        } catch (error) {
            next(error);
        }
    }

    async updateEmployee(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const employee = await employeeService.updateEmployee(req.params.id, req.body);
            res.json(employee);
        } catch (error) {
            next(error);
        }
    }

    async deleteEmployee(req, res, next) {
        try {
            await employeeService.deleteEmployee(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async searchEmployees(req, res, next) {
        try {
            const employees = await employeeService.searchEmployees(req.query.q);
            res.json(employees);
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeByCardNumber(req, res, next) {
        try {
            const employee = await employeeService.getEmployeeByCardNumber(req.params.cardNumber);
            res.json(employee);
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeByRegistration(req, res, next) {
        try {
            const employee = await employeeService.getEmployeeByRegistration(req.params.registration);
            res.json(employee);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EmployeeController(); 
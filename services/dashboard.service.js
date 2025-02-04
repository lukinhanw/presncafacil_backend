const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Class = require('../models/class.model');
const ClassParticipants = require('../models/class_participants.model');

class DashboardService {
    async getStats() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Estatísticas de hoje
            const [todayStats, yesterdayStats] = await Promise.all([
                this.getDayStats(today, tomorrow),
                this.getDayStats(yesterday, today)
            ]);

            // Calcula as variações
            const classesChange = todayStats.totalClasses - yesterdayStats.totalClasses;
            const attendeesChange = todayStats.totalAttendees - yesterdayStats.totalAttendees;
            const hoursChange = todayStats.totalHours - yesterdayStats.totalHours;
            const rateChange = todayStats.completionRate - yesterdayStats.completionRate;

            return {
                classes: {
                    value: todayStats.totalClasses,
                    change: classesChange >= 0 ? `+${classesChange}` : `${classesChange}`
                },
                attendees: {
                    value: todayStats.totalAttendees,
                    change: attendeesChange >= 0 ? `+${attendeesChange}` : `${attendeesChange}`
                },
                trainingHours: {
                    value: `${todayStats.totalHours}h`,
                    change: hoursChange >= 0 ? `+${hoursChange}h` : `${hoursChange}h`
                },
                completionRate: {
                    value: `${Math.round(todayStats.completionRate)}%`,
                    change: rateChange >= 0 ? `+${Math.round(rateChange)}%` : `${Math.round(rateChange)}%`
                }
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            throw error;
        }
    }

    async getDayStats(startDate, endDate) {
        // Total de aulas
        const totalClasses = await Class.count({
            where: {
                date_start: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            }
        });

        // Total de participantes
        const totalAttendees = await ClassParticipants.count({
            include: [{
                model: Class,
                as: 'class',
                where: {
                    date_start: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                },
                required: true
            }]
        });

        // Total de horas de treinamento
        const hoursResult = await Class.findOne({
            where: {
                date_start: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                },
                status: 'completed'
            },
            attributes: [
                [sequelize.fn('COALESCE',
                    sequelize.fn('SUM', 
                        sequelize.literal('TIMESTAMPDIFF(HOUR, date_start, date_end)')
                    ), 0
                ), 'total_hours']
            ],
            raw: true
        });

        const totalHours = parseInt(hoursResult.total_hours) || 0;

        // Taxa de conclusão
        const completedClasses = await Class.count({
            where: {
                date_start: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                },
                status: 'completed'
            }
        });

        const completionRate = totalClasses > 0 ? 
            (completedClasses / totalClasses) * 100 : 0;

        return {
            totalClasses,
            totalAttendees,
            totalHours,
            completionRate
        };
    }
}

module.exports = new DashboardService(); 
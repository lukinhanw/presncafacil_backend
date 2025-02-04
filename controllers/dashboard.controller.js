const dashboardService = require('../services/dashboard.service');

class DashboardController {
    async getStats(req, res) {
        try {
            const stats = await dashboardService.getStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new DashboardController(); 
const { validationResult } = require('express-validator');
const configService = require('../services/config.service');

class ConfigController {
	async getConfig(req, res) {
		try {
			const config = await configService.getConfig();
			res.json({
				success: true,
				data: config
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				message: error.message
			});
		}
	}

	async updateConfig(req, res) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					errors: errors.array()
				});
			}

			const config = await configService.updateConfig(req.body, req.body.logo);
			res.json({
				success: true,
				message: 'Configurações atualizadas com sucesso',
				data: config
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				message: error.message
			});
		}
	}
}

module.exports = new ConfigController(); 
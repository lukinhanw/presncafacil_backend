const Config = require('../models/config.model');
const uploadService = require('./upload.service');

class ConfigService {
	async getConfig() {
		try {
			let config = await Config.findOne();
			
			if (!config) {
				config = await Config.create({
					titulo: 'Lista de Presença Digital'
				});
			}

			// Adiciona a URL completa do logo se existir
			if (config.logo) {
				config.logo = `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/${config.logo}`;
			}
			
			return config;
		} catch (error) {
			console.error('Erro ao buscar configurações:', error);
			throw error;
		}
	}

	async updateConfig(dados, logoFile) {
		try {
			let config = await Config.findOne();
			if (!config) {
				config = await Config.create({
					titulo: 'Lista de Presença Digital'
				});
			}

			// Se enviou novo logo, salva e deleta o anterior
			if (logoFile) {
				if (config.logo) {
					await uploadService.deleteFile(config.logo);
				}
				
				const fileName = await uploadService.saveBase64Image(
					logoFile,
					'logo'
				);
				dados.logo = fileName;
			}

			// Atualiza os dados
			await config.update({
				titulo: dados.titulo,
				logo: dados.logo || config.logo
			});

			// Retorna os dados atualizados com a URL completa do logo
			const updatedConfig = await this.getConfig();
			return updatedConfig;
		} catch (error) {
			console.error('Erro ao atualizar configurações:', error);
			throw error;
		}
	}
}

module.exports = new ConfigService(); 
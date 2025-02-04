const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const sequelize = require('../config/database');
const uploadService = require('./upload.service');

class ProfileService {
    async getProfile(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const data = user.toJSON();
        delete data.password;
        data.isActive = data.is_active;
        delete data.is_active;

        // Adiciona a URL completa da foto se existir
        if (data.avatar) {
            data.avatar = `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/${data.avatar}`;
        }

        return data;
    }

    async updateProfile(userId, profileData) {
        const transaction = await sequelize.transaction();

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Verifica se o email já está em uso por outro usuário
            if (profileData.email) {
                const existingUser = await User.findOne({
                    where: {
                        email: profileData.email,
                        id: { [Op.ne]: userId }
                    }
                });

                if (existingUser) {
                    throw new Error('Este email já está em uso');
                }
            }

            // Remove campos que não devem ser atualizados pelo usuário
            delete profileData.roles;
            delete profileData.is_active;
            delete profileData.registration;

            // Se houver nova senha, faz o hash
            if (profileData.password) {
                const salt = await bcrypt.genSalt(10);
                profileData.password = await bcrypt.hash(profileData.password, salt);
            }

            // Se houver nova foto
            if (profileData.avatar) {
                // Se já existir uma foto, remove
                if (user.avatar) {
                    await uploadService.deleteFile(user.avatar);
                }

                // Salva a nova foto
                const fileName = await uploadService.saveBase64Image(
                    profileData.avatar,
                    `profile_${userId}`
                );
                profileData.avatar = fileName;
            }

            await user.update(profileData, { transaction });
            await transaction.commit();

            const data = user.toJSON();
            delete data.password;
            data.isActive = data.is_active;
            delete data.is_active;

            // Adiciona a URL completa da foto se existir
            if (data.avatar) {
                data.avatar = `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/${data.avatar}`;
            }

            return data;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async changePassword(userId, { currentPassword, newPassword }) {
        const transaction = await sequelize.transaction();

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Verifica se a senha atual está correta
            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                throw new Error('Senha atual incorreta');
            }

            // Define a nova senha (o hook beforeSave fará o hash)
            user.password = newPassword;
            await user.save({ transaction });
            
            await transaction.commit();

            const data = user.toJSON();
            delete data.password;
            data.isActive = data.is_active;
            delete data.is_active;

            // Adiciona a URL completa da foto se existir
            if (data.avatar) {
                data.avatar = `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/${data.avatar}`;
            }

            return data;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async updateAvatar(userId, avatarBase64) {
        const transaction = await sequelize.transaction();

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Se já existir uma foto, remove
            if (user.avatar) {
                await uploadService.deleteFile(user.avatar);
            }

            // Salva a nova foto
            const fileName = await uploadService.saveBase64Image(
                avatarBase64,
                `profile_${userId}`
            );

            await user.update({ avatar: fileName }, { transaction });
            await transaction.commit();

            const data = user.toJSON();
            delete data.password;
            data.isActive = data.is_active;
            delete data.is_active;

            // Adiciona a URL completa da foto
            data.avatar = `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/${fileName}`;

            return data;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new ProfileService(); 
-- Adicionar coluna para armazenar participantes
ALTER TABLE classes ADD COLUMN attendees JSON DEFAULT NULL;

-- Adicionar colunas para o sistema de convite
ALTER TABLE classes ADD COLUMN invite_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE classes ADD COLUMN invite_expires_at DATETIME DEFAULT NULL; 
-- Criar a tabela class_participants
CREATE TABLE IF NOT EXISTS class_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    registration VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    photo VARCHAR(255),
    type VARCHAR(255) NOT NULL DEFAULT 'Manual',
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    early_leave BOOLEAN NOT NULL DEFAULT FALSE,
    early_leave_time DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX idx_class_participants_class_id ON class_participants(class_id);
CREATE INDEX idx_class_participants_registration ON class_participants(registration); 
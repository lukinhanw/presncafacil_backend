-- Modificar a coluna training_name para permitir NULL
ALTER TABLE classes MODIFY COLUMN training_name VARCHAR(255) NULL;

-- Modificar a coluna training_code para permitir NULL
ALTER TABLE classes MODIFY COLUMN training_code VARCHAR(20) NULL; 
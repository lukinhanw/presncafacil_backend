-- Primeiro, vamos copiar os dados dos campos training_name e training_code para name e code onde necessário
UPDATE classes 
SET name = COALESCE(training_name, name),
    code = COALESCE(training_code, code)
WHERE training_name IS NOT NULL OR training_code IS NOT NULL;

-- Agora podemos remover as colunas redundantes
ALTER TABLE classes 
DROP COLUMN training_name,
DROP COLUMN training_code; 
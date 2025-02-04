const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
    console.error('Erro detalhado:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code
    });

    // Erros de validação do Sequelize
    if (err instanceof ValidationError) {
        return res.status(400).json({
            message: 'Erro de validação',
            errors: err.errors.map(error => ({
                field: error.path,
                message: error.message
            }))
        });
    }

    // Erros de unicidade do Sequelize
    if (err instanceof UniqueConstraintError) {
        return res.status(400).json({
            message: 'Dados duplicados',
            error: `${err.errors[0].path} já está em uso`
        });
    }

    // Erros de banco de dados
    if (err instanceof DatabaseError) {
        return res.status(500).json({
            message: 'Erro no banco de dados',
            error: err.message
        });
    }

    // Erros de autenticação
    if (err.message === 'Credenciais inválidas') {
        return res.status(401).json({
            message: err.message
        });
    }

    // Erros personalizados
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    // Erro padrão
    res.status(500).json({
        message: 'Erro interno do servidor',
        error: err.message
    });
};

module.exports = errorHandler; 
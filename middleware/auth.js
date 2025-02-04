const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        const [scheme, token] = parts;
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Garante que roles seja um array
        decoded.roles = Array.isArray(decoded.roles) ? decoded.roles : 
                       (typeof decoded.roles === 'string' ? JSON.parse(decoded.roles) : 
                       [decoded.roles]).filter(Boolean);
        
        // Adiciona o role principal ao decoded
        decoded.role = decoded.roles[0];
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        return res.status(401).json({ message: 'Falha na autenticação' });
    }
};

const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Garante que roles seja um array
        const userRoles = Array.isArray(req.user.roles) ? req.user.roles : 
                         (typeof req.user.roles === 'string' ? JSON.parse(req.user.roles) : 
                         [req.user.roles]).filter(Boolean);

        const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
        if (!hasRequiredRole) {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }

        next();
    };
};

module.exports = { verifyToken, hasRole }; 
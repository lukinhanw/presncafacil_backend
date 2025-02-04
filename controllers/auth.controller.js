const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

class AuthController {
  async login(req, res, next) {
    try {
      // Verifica se há erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController(); 
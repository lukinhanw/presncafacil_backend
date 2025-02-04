const express = require('express');
const router = express.Router();

// Rota de teste
router.get('/home', (req, res) => {
    console.log('Rota de teste acessada com sucesso!');
    res.json({ message: 'Rota de teste funcionando!' });
});

module.exports = router; 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const trainingRoutes = require('./routes/training.routes');
const employeeRoutes = require('./routes/employee.routes');
const instructorRoutes = require('./routes/instructor.routes');
const classRoutes = require('./routes/class.routes');
const ticketRoutes = require('./routes/ticket.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const termsRoutes = require('./routes/terms.routes');
const configRoutes = require('./routes/config.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Sincroniza o banco de dados
sequelize.sync()
    .then(() => console.log('Banco de dados sincronizado'))
    .catch(err => console.error('Erro ao sincronizar banco de dados:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/config', configRoutes);

// Rota para ler um arquivo de imagem na pasta uploads
app.use('/api/uploads', express.static('uploads'));

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 
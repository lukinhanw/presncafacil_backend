# Presença Fácil - Backend

## Visão Geral
API REST desenvolvida com Node.js e Express para o sistema de gerenciamento de presenças. Utiliza PostgreSQL como banco de dados e JWT para autenticação.

## Estrutura do Projeto
Pasta backend

```
src/
├── config/         # Configurações (banco de dados, auth, etc)
│   ├── database.js # Configuração do Sequelize
│   └── auth.js     # Configuração JWT e autenticação
├── controllers/    # Controladores da aplicação
│   ├── authController.js
│   ├── userController.js
│   ├── classController.js
│   └── termsController.js
├── middlewares/    # Middlewares personalizados
│   ├── auth.js     # Validação de JWT
│   ├── roles.js    # Verificação de permissões
│   └── error.js    # Tratamento de erros
├── models/         # Modelos do Sequelize
│   ├── User.js
│   ├── Instructor.js
│   ├── Class.js
│   └── Attendance.js
├── routes/         # Definição das rotas
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── terms.routes.js
├── services/       # Lógica de negócio
│   ├── authService.js
│   ├── userService.js
│   └── termsService.js
```

## Principais Características

### Banco de Dados
- PostgreSQL com Sequelize ORM
- Migrations para versionamento do banco
- Seeds para dados iniciais
- Relacionamentos complexos entre entidades
- Backup automático diário

### Autenticação e Autorização
- JWT (JSON Web Token) com refresh token
- Middleware de autenticação
- Sistema de roles (ADMIN, INSTRUCTOR)
- Verificação de termos de uso
- Blacklist de tokens revogados

Obs: O "users" são os ADMIN

### Endpoints Principais

#### Autenticação
```
POST   /api/auth/login          # Login com email/matrícula e senha
POST   /api/auth/refresh-token  # Renovar token de acesso
POST   /api/auth/logout         # Logout e invalidação de token
POST   /api/auth/reset-password # Solicitar reset de senha
```

#### Usuários
```
GET    /api/users              # Listar usuários (com paginação)
POST   /api/users              # Criar novo usuário
GET    /api/users/:id          # Detalhes do usuário
PUT    /api/users/:id          # Atualizar usuário
DELETE /api/users/:id          # Remover usuário
PATCH  /api/users/:id/status   # Ativar/desativar usuário
```

#### Termos de Uso
```
POST   /api/terms/accept       # Aceitar termos de uso
GET    /api/terms/status       # Verificar status dos termos
PUT    /api/terms/update       # Atualizar versão dos termos
```

#### Aulas
```
GET    /api/classes            # Listar aulas (com filtros)
POST   /api/classes            # Criar nova aula
GET    /api/classes/:id        # Detalhes da aula
PUT    /api/classes/:id        # Atualizar aula
DELETE /api/classes/:id        # Remover aula
POST   /api/classes/:id/start  # Iniciar aula
POST   /api/classes/:id/end    # Finalizar aula
```

#### Presenças
```
POST   /api/attendance/register          # Registrar presença
PUT    /api/attendance/update            # Atualizar registro
DELETE /api/attendance/remove            # Remover registro
GET    /api/attendance/report/:classId   # Relatório de presenças
```

### Middlewares
- `authMiddleware`: Validação de token JWT
- `roleMiddleware`: Verificação de roles
- `errorHandler`: Tratamento global de erros
- `requestLogger`: Log de requisições
- `rateLimiter`: Limite de requisições por IP
- `cors`: Configuração de CORS
- `validator`: Validação de dados com Joi

### Modelos Principais
- `User`: Usuários do sistema (alunos)
- `Instructor`: Instrutores e professores
- `Class`: Aulas e treinamentos
- `Attendance`: Registro de presenças
- `Terms`: Controle de termos de uso
- `Tickets`: Tickets de suporte

## Padrões de Código
- Arquitetura em camadas (MVC)
- Tratamento consistente de erros
- Validação de dados com Joi
- Logs estruturados com Winston
- Documentação com JSDoc
- ESLint + Prettier para padronização
- Commits semânticos

## Segurança
- Sanitização de inputs
- Rate limiting por IP
- CORS configurado
- Helmet para headers HTTP
- Senhas hasheadas com bcrypt
- Proteção contra XSS e CSRF
- Validação de dados em todas as rotas
- Logs de auditoria

## Scripts Disponíveis
```bash
# Instalação
npm install        # Instala dependências
npm run setup     # Configura ambiente inicial

# Desenvolvimento
npm run dev       # Inicia servidor com hot-reload
npm run lint      # Executa ESLint
npm run format    # Formata código com Prettier

# Banco de Dados
npm run migrate   # Executa migrations
npm run migrate:undo  # Reverte última migration
npm run seed      # Executa seeds
npm run seed:undo # Reverte seeds

# Testes
npm run test      # Executa testes
npm run test:watch # Executa testes em watch mode
npm run test:coverage # Relatório de cobertura

# Produção
npm run build    # Prepara para produção
npm run start    # Inicia em produção
npm run cluster  # Inicia em modo cluster
```

## Testes
- Jest para testes unitários
- Supertest para testes de integração
- Coverage report
- Testes automatizados em CI/CD
- Testes de carga com k6
- Mocks e fixtures padronizados

## Documentação API
- Swagger UI em `/api-docs`
- Postman Collection disponível
- Exemplos de requisições e respostas
- Documentação de erros
- Guia de contribuição
- Changelog mantido

### Tabelas Principais

#### 1. Classes (Aulas)
Armazena informações sobre as aulas.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| type | Tipo da aula (Portfolio, External, DDS, Others) |
| instructor_id | ID do instrutor |
| date_start | Data/hora de início |
| date_end | Data/hora de término |
| status | Status (scheduled, completed, cancelled) |
| name | Nome da aula |

#### 2. Class_Invites (Convites)
Gerencia os convites para aulas.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| class_id | ID da aula |
| token | Token do convite |
| expires_at | Data de validade do convite |


#### 3. Class_Participants (Participantes)
Registra informações dos participantes das aulas.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| class_id | ID da aula |
| name | Nome do participante |
| registration | Matrícula do participante |
| unit | Unidade do participante |

#### 4. Employees (Funcionários)
Mantém dados dos funcionários.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| name | Nome do funcionário |
| registration | Matrícula |
| unit | Unidade |
| position | Cargo |

#### 5. Instructors (Instrutores)
Armazena informações dos instrutores.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| name | Nome do instrutor |
| registration | Matrícula |
| unit | Unidade |
| position | Cargo |

#### 6. Trainings (Treinamentos)
Contém dados sobre treinamentos.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| name | Nome do treinamento |
| code | Código do treinamento |
| duration | Duração |
| provider | Provedor |

#### 7. Users (Usuários)
Gerencia informações dos usuários do sistema.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| name | Nome do usuário |
| email | E-mail |
| password | Senha |
| roles | Permissões do usuário |

#### 8. Tickets (Tickets de Suporte)
Gerencia os tickets de suporte do sistema.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| title | Título do ticket |
| description | Descrição detalhada |
| status | Status (open, in-progress, closed) |
| priority | Prioridade (low, medium, high) |
| category | Categoria (technical, doubt, error, suggestion) |
| creator_id | ID do criador (pode ser user_id ou instructor_id) |
| creator_type | Tipo do criador ('user' ou 'instructor') |
| created_at | Data de criação |
| updated_at | Data de atualização |

#### 9. Ticket_Messages (Mensagens dos Tickets)
Armazena as mensagens trocadas em cada ticket.

| Campo | Descrição |
|-------|-----------|
| id | ID único |
| message | Conteúdo da mensagem |
| is_support | Flag se é mensagem do suporte |
| user_id | ID do usuário que enviou |
| ticket_id | ID do ticket relacionado |
| attachments | Anexos em formato JSON |
| created_at | Data de criação |
| updated_at | Data de atualização |
require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const memorandoRoutes = require('./src/routes/memorandoRoutes');
const authController = require('./src/controllers/authController');
const authMiddleware = require('./src/middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de Sessão (Duração exata de 12 horas)
app.use(session({
  secret: 'chave_secreta_memorandos_scp',
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 12 // 12 horas
  }
}));

// Disponibiliza o usuário logado para todas as views EJS
app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  next();
});

// Rota raiz redireciona para expedidos
app.get('/', (req, res) => {
  res.redirect('/expedidos');
});

// Rotas públicas de Autenticação
app.get('/login', authController.exibirLogin);
app.post('/login', authController.processarLogin);
app.get('/cadastro', authController.exibirCadastro);
app.post('/cadastro', authController.processarCadastro);
app.get('/logout', authController.logout);

// Rotas Administrativas (Protegidas - Apenas Admin)
app.get('/admin/usuarios', authMiddleware.verificarSessao, authMiddleware.verificarAdmin, authController.gerenciarUsuarios);
app.post('/admin/usuarios/:id/status', authMiddleware.verificarSessao, authMiddleware.verificarAdmin, authController.atualizarStatus);
app.post('/admin/usuarios/:id/role', authMiddleware.verificarSessao, authMiddleware.verificarAdmin, authController.atualizarRole);
app.delete('/admin/usuarios/:id', authMiddleware.verificarSessao, authMiddleware.verificarAdmin, authController.excluir);

// Rotas protegidas do Sistema de Memorandos (Exigem login)
app.use('/', authMiddleware.verificarSessao, memorandoRoutes);

// Tratamento de Erro 404
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
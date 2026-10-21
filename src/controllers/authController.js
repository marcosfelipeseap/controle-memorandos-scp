const authService = require('../services/authService');

const authController = {
  exibirLogin(req, res) {
    res.render('login', { erro: req.query.erro || null, sucesso: req.query.sucesso || null });
  },

  exibirCadastro(req, res) {
    res.render('cadastro', { erro: req.query.erro || null, sucesso: req.query.sucesso || null });
  },

  async processarLogin(req, res) {
    try {
      const { username, senha } = req.body;
      const usuario = await authService.login(username, senha);
      
      req.session.usuario = usuario;
      res.redirect('/expedidos');
    } catch (error) {
      res.redirect('/login?erro=' + encodeURIComponent(error.message));
    }
  },

  async processarCadastro(req, res) {
    try {
      await authService.cadastrar(req.body);
      res.redirect('/login?sucesso=' + encodeURIComponent('Cadastro realizado com sucesso! Aguarde a aprovação de um Administrador para aceder.'));
    } catch (error) {
      res.redirect('/cadastro?erro=' + encodeURIComponent(error.message));
    }
  },

  logout(req, res) {
    // Para o cookie-session, a sessão é destruída definindo-a como nula
    req.session = null;
    res.redirect('/login');
  },

  async gerenciarUsuarios(req, res) {
    try {
      const usuarios = await authService.listarUsuarios();
      res.render('admin_usuarios', {
        abaAtiva: 'usuarios',
        usuarioLogado: req.session.usuario,
        usuarios,
        sucesso: req.query.sucesso || null,
        erro: req.query.erro || null
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_approved } = req.body;
      await authService.alterarStatusAprovacao(id, is_approved === 'true');
      res.redirect('/admin/usuarios?sucesso=' + encodeURIComponent('Status do utilizador atualizado!'));
    } catch (error) {
      res.redirect('/admin/usuarios?erro=' + encodeURIComponent(error.message));
    }
  },

  async atualizarRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      await authService.alterarRole(id, role);
      res.redirect('/admin/usuarios?sucesso=' + encodeURIComponent('Cargo do utilizador alterado com sucesso!'));
    } catch (error) {
      res.redirect('/admin/usuarios?erro=' + encodeURIComponent(error.message));
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;
      await authService.excluir(id);
      res.redirect('/admin/usuarios?sucesso=' + encodeURIComponent('Utilizador excluído com sucesso!'));
    } catch (error) {
      res.redirect('/admin/usuarios?erro=' + encodeURIComponent(error.message));
    }
  }
};

module.exports = authController;
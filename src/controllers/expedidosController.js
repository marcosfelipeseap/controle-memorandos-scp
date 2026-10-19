const expedidosService = require('../services/expedidosService');

const expedidosController = {
  async index(req, res) {
    try {
      const filtros = {
        busca: req.query.busca || '',
        status: req.query.status || '',
        oficina: req.query.oficina || '',
      };

      const [memorandos, resumo] = await Promise.all([
        expedidosService.listarTodos(filtros),
        expedidosService.obterResumo(),
      ]);

      res.render('expedidos', {
        abaAtiva: 'expedidos',
        memorandos,
        resumo,
        filtros,
        sucesso: req.query.sucesso || null,
        erro: req.query.erro || null,
      });
    } catch (error) {
      res.render('expedidos', {
        abaAtiva: 'expedidos',
        memorandos: [],
        resumo: { total: 0, abertos: 0, concluidos: 0 },
        filtros: { busca: '', status: '', oficina: '' },
        sucesso: null,
        erro: error.message,
      });
    }
  },

  async store(req, res) {
    try {
      await expedidosService.criar(req.body);
      res.redirect('/expedidos?sucesso=' + encodeURIComponent('Memorando expedido cadastrado com sucesso!'));
    } catch (error) {
      res.redirect('/expedidos?erro=' + encodeURIComponent(error.message));
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      await expedidosService.atualizar(id, req.body);
      res.redirect('/expedidos?sucesso=' + encodeURIComponent('Memorando expedido atualizado com sucesso!'));
    } catch (error) {
      res.redirect('/expedidos?erro=' + encodeURIComponent(error.message));
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;
      await expedidosService.excluir(id);
      res.redirect('/expedidos?sucesso=' + encodeURIComponent('Memorando expedido excluído com sucesso!'));
    } catch (error) {
      res.redirect('/expedidos?erro=' + encodeURIComponent(error.message));
    }
  }
};

module.exports = expedidosController;
const supabase = require('../config/supabase');

// Transforma "12.34" ou "1234" em "%1%2%3%4%" para achar qualquer formatação de pontuação
function criarPadraoBuscaSei(termo) {
  const apenasDigitos = termo.replace(/\D/g, '');
  if (apenasDigitos.length >= 2) {
    return '%' + apenasDigitos.split('').join('%') + '%';
  }
  return null;
}

const expedidosService = {
  async listarTodos(filtros = {}) {
    let query = supabase
      .schema('memorando')
      .from('expedidos')
      .select('*')
      .order('expedido_em', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (filtros.busca) {
      const b = filtros.busca.trim();
      const padraoSei = criarPadraoBuscaSei(b);

      if (padraoSei) {
        query = query.or(
          `numero_processo_sei.ilike.${padraoSei},numero_processo_sei.ilike.%${b}%,numero_doc.ilike.${padraoSei},numero_doc.ilike.%${b}%,assunto.ilike.%${b}%,destinatario.ilike.%${b}%,remetente.ilike.%${b}%`
        );
      } else {
        query = query.or(
          `numero_processo_sei.ilike.%${b}%,numero_doc.ilike.%${b}%,assunto.ilike.%${b}%,destinatario.ilike.%${b}%,remetente.ilike.%${b}%`
        );
      }
    }

    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros.oficina) {
      query = query.ilike('oficina', `%${filtros.oficina.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Erro ao listar expedidos: ${error.message}`);
    return data;
  },

  async obterResumo() {
    const { data, error } = await supabase.schema('memorando').from('expedidos').select('status');
    if (error) throw new Error(`Erro ao obter resumo: ${error.message}`);

    return {
      total: data.length,
      abertos: data.filter((i) => i.status === 'ABERTO').length,
      concluidos: data.filter((i) => i.status === 'CONCLUÍDO').length,
    };
  },

  async criar(dados) {
    const payload = {
      numero_processo_sei: dados.numero_processo_sei?.trim(),
      link: dados.link?.trim() || null,
      expedido_em: dados.expedido_em || null,
      tipo: dados.tipo?.trim() || null,
      numero_doc: dados.numero_doc?.trim() || null,
      remetente: dados.remetente?.trim() || null,
      destinatario: dados.destinatario?.trim() || null,
      assunto: dados.assunto?.trim() || null,
      oficina: dados.oficina?.trim() || null,
      despachado_em: dados.despachado_em || null,
      status: (dados.status || 'ABERTO').toUpperCase(),
    };

    const { data, error } = await supabase
      .schema('memorando')
      .from('expedidos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Já existe um processo expedido cadastrado com os números do SEI "${payload.numero_processo_sei}" (mesmo com pontuação diferente).`);
      }
      throw new Error(`Erro ao cadastrar memorando expedido: ${error.message}`);
    }
    return data;
  },

  async atualizar(id, dados) {
    const payload = {
      numero_processo_sei: dados.numero_processo_sei?.trim(),
      link: dados.link?.trim() || null,
      expedido_em: dados.expedido_em || null,
      tipo: dados.tipo?.trim() || null,
      numero_doc: dados.numero_doc?.trim() || null,
      remetente: dados.remetente?.trim() || null,
      destinatario: dados.destinatario?.trim() || null,
      assunto: dados.assunto?.trim() || null,
      oficina: dados.oficina?.trim() || null,
      despachado_em: dados.despachado_em || null,
      status: (dados.status || 'ABERTO').toUpperCase(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .schema('memorando')
      .from('expedidos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Outro registro já utiliza os números do Processo SEI "${payload.numero_processo_sei}".`);
      }
      throw new Error(`Erro ao atualizar memorando expedido: ${error.message}`);
    }
    return data;
  },

  async excluir(id) {
    const { error } = await supabase.schema('memorando').from('expedidos').delete().eq('id', id);
    if (error) throw new Error(`Erro ao excluir memorando expedido: ${error.message}`);
    return true;
  }
};

module.exports = expedidosService;
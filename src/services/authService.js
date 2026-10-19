const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const SALTS_ROUNDS = 10;

const authService = {
  async cadastrar({ nome, username, senha }) {
    const cleanUsername = username.trim().toLowerCase();

    const { data: existente } = await supabase
      .schema('memorando')
      .from('usuarios')
      .select('id')
      .eq('username', cleanUsername)
      .single();

    if (existente) {
      throw new Error('Este nome de usuário já está em uso.');
    }

    const senhaCriptografada = await bcrypt.hash(senha, SALTS_ROUNDS);

    const { data, error } = await supabase
      .schema('memorando')
      .from('usuarios')
      .insert([{
        nome: nome.trim(),
        username: cleanUsername,
        senha: senhaCriptografada,
        role: 'servidor',
        is_approved: false 
      }])
      .select()
      .single();

    if (error) throw new Error(`Erro ao cadastrar: ${error.message}`);
    return data;
  },

  async login(username, senha) {
    const cleanUsername = username.trim().toLowerCase();

    const { data: usuario, error } = await supabase
      .schema('memorando')
      .from('usuarios')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (error || !usuario) {
      throw new Error('Usuário ou senha incorretos.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Usuário ou senha incorretos.');
    }

    if (!usuario.is_approved) {
      throw new Error('Sua conta aguarda autorização de um Administrador.');
    }

    return usuario;
  },

  async listarUsuarios() {
    // Correção aplicada aqui: .from() chamado com o schema configurado corretamente
    const { data, error } = await supabase
      .schema('memorando')
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao listar usuários: ${error.message}`);
    return data;
  },

  async alterarStatusAprovacao(id, is_approved) {
    const { error } = await supabase
      .schema('memorando')
      .from('usuarios')
      .update({ is_approved })
      .eq('id', id);

    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
    return true;
  },

  async alterarRole(id, role) {
    const { error } = await supabase
      .schema('memorando')
      .from('usuarios')
      .update({ role })
      .eq('id', id);

    if (error) throw new Error(`Erro ao alterar cargo: ${error.message}`);
    return true;
  },

  async excluirUsuario(id) {
    const { error } = await supabase
      .schema('memorando')
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao excluir usuário: ${error.message}`);
    return true;
  }
};

module.exports = authService;
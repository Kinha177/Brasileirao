// ARQUIVO: src/components/JogadoresView.tsx

import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase'; // <<< REMOVIDO
import { Jogador, Clube } from '../types';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

const API_URL = 'http://localhost:3001'; // <<< ADICIONADO

export default function JogadoresView() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCpf, setEditingCpf] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cpf_jogador: '',
    nome_jogador: '',
    posicao: '',
    data_nascimento: '',
    nacionalidade: '',
    id_clube: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // --- ALTERADO (Promise.all com fetch) ---
      const [jogadoresRes, clubesRes] = await Promise.all([
        fetch(`${API_URL}/jogadores`),
        fetch(`${API_URL}/clubes`),
      ]);

      if (!jogadoresRes.ok) throw new Error('Falha ao carregar jogadores');
      if (!clubesRes.ok) throw new Error('Falha ao carregar clubes');

      const [jogadoresData, clubesData] = await Promise.all([
        jogadoresRes.json(),
        clubesRes.json(),
      ]);
      // ---------------

      setJogadores(jogadoresData || []);
      setClubes(clubesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        id_clube: formData.id_clube || null,
      };

      // --- ALTERADO (CREATE / UPDATE) ---
      let url = `${API_URL}/jogadores`;
      let method = 'POST'; // CREATE

      if (editingCpf) {
        url = `${API_URL}/jogadores/${editingCpf}`; // UPDATE
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar jogador');
      }
      // ---------------

      resetForm();
      loadData(); // Recarrega jogadores E clubes (embora só jogadores seja necessário)
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
    }
  };

  const handleEdit = (jogador: Jogador) => {
    setFormData({
      cpf_jogador: jogador.cpf_jogador,
      nome_jogador: jogador.nome_jogador,
      posicao: jogador.posicao,
      // O MySQL retorna data como 'YYYY-MM-DD[...]', o input type="date" aceita 'YYYY-MM-DD'
      data_nascimento: jogador.data_nascimento.split('T')[0],
      nacionalidade: jogador.nacionalidade,
      id_clube: jogador.id_clube || '',
    });
    setEditingCpf(jogador.cpf_jogador);
    setShowForm(true);
  };

  const handleDelete = async (cpf: string) => {
    if (!confirm('Deseja realmente excluir este jogador?')) return;
    try {
      // --- ALTERADO (DELETE) ---
      const response = await fetch(`${API_URL}/jogadores/${cpf}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir jogador');
      }
      // ---------------

      loadData(); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao excluir jogador:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      cpf_jogador: '',
      nome_jogador: '',
      posicao: '',
      data_nascimento: '',
      nacionalidade: '',
      id_clube: '',
    });
    setEditingCpf(null);
    setShowForm(false);
  };

  // Função HELPER - Não precisa de mudança
  const getClubeNome = (id_clube: string | null) => {
    const clube = clubes.find((c) => c.id_clube === id_clube);
    return clube?.nome_clube || 'Sem clube';
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Carregando...</div>;
  }

  //
  // O RESTANTE DO SEU CÓDIGO (JSX) PERMANECE EXATAMENTE IGUAL
  // ... (todo o HTML/JSX do formulário e da tabela) ...
  //

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Jogadores</h2>
            <p className="text-sm text-slate-500">Gerencie os atletas do campeonato</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Jogador</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingCpf ? 'Editar Jogador' : 'Novo Jogador'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF *</label>
              <input
                type="text"
                required
                disabled={!!editingCpf} // Correto: Não pode editar Primary Key
                value={formData.cpf_jogador}
                onChange={(e) => setFormData({ ...formData, cpf_jogador: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
              <input
                type="text"
                required
                value={formData.nome_jogador}
                onChange={(e) => setFormData({ ...formData, nome_jogador: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Posição *</label>
              <select
                required
                value={formData.posicao}
                onChange={(e) => setFormData({ ...formData, posicao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro">Zagueiro</option>
                <option value="Lateral">Lateral</option>
                <option value="Volante">Volante</option>
                <option value="Meia">Meia</option>
                <option value="Atacante">Atacante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                required
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nacionalidade *
              </label>
              <input
                type="text"
                required
                value={formData.nacionalidade}
                onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Clube</label>
              <select
                value={formData.id_clube}
                onChange={(e) => setFormData({ ...formData, id_clube: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Sem clube</option>
                {clubes.map((clube) => (
                  <option key={clube.id_clube} value={clube.id_clube}>
                    {clube.nome_clube}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                {editingCpf ? 'Atualizar' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Posição</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Clube</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                Nacionalidade
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                Nascimento
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {jogadores.map((jogador) => (
              <tr key={jogador.cpf_jogador} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 font-medium">{jogador.nome_jogador}</td>
                <td className="py-3 px-4 text-slate-600">{jogador.posicao}</td>
                <td className="py-3 px-4 text-slate-600">{getClubeNome(jogador.id_clube)}</td>
                <td className="py-3 px-4 text-slate-600">{jogador.nacionalidade}</td>
                <td className="py-3 px-4 text-slate-600">
                  {/* Adicionando + 'T00:00:00' para corrigir fuso horário se a data vier só como YYYY-MM-DD */}
                  {new Date(jogador.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleEdit(jogador)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all mr-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(jogador.cpf_jogador)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jogadores.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum jogador cadastrado. Clique em "Novo Jogador" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
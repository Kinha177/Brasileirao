// ARQUIVO: src/components/PartidasView.tsx

import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase'; // <<< REMOVIDO
import { Partida, Clube, Temporada } from '../types'; // (Você pode precisar adicionar 'Estadio' aos seus types)
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:3001'; // <<< ADICIONADO

export default function PartidasView() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    data_hora: '',
    gols_casa: '0',
    gols_visitante: '0',
    temporada: '',
    numero_rodada: '',
    id_clube_casa: '',
    id_clube_visitante: '',
    id_estadio: '',
    finalizada: false,
  });
  const [estadios, setEstadios] = useState<any[]>([]); // (Considerar criar um type 'Estadio')

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // --- ALTERADO (Promise.all com fetch) ---
      const [partidasRes, clubesRes, temporadasRes, estadiosRes] = await Promise.all([
        fetch(`${API_URL}/partidas`),
        fetch(`${API_URL}/clubes`),
        fetch(`${API_URL}/temporadas`),
        fetch(`${API_URL}/estadios`),
      ]);

      if (!partidasRes.ok) throw new Error('Falha ao carregar partidas');
      if (!clubesRes.ok) throw new Error('Falha ao carregar clubes');
      if (!temporadasRes.ok) throw new Error('Falha ao carregar temporadas');
      if (!estadiosRes.ok) throw new Error('Falha ao carregar estadios');

      const [partidasData, clubesData, temporadasData, estadiosData] = await Promise.all([
        partidasRes.json(),
        clubesRes.json(),
        temporadasRes.json(),
        estadiosRes.json(),
      ]);
      // ---------------

      setPartidas(partidasData || []);
      setClubes(clubesData || []);
      setTemporadas(temporadasData || []);
      setEstadios(estadiosData || []);
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
        gols_casa: parseInt(formData.gols_casa),
        gols_visitante: parseInt(formData.gols_visitante),
        temporada: parseInt(formData.temporada),
        numero_rodada: parseInt(formData.numero_rodada),
      };

      // --- ALTERADO (CREATE / UPDATE) ---
      let url = `${API_URL}/partidas`;
      let method = 'POST';

      if (editingId) {
        url = `${API_URL}/partidas/${editingId}`;
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
        throw new Error(errorData.error || 'Falha ao salvar partida');
      }
      // ---------------

      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar partida:', error);
    }
  };

  const handleEdit = (partida: Partida) => {
    setFormData({
      // Formata a data ISO (ex: 2025-11-13T18:30:00.000Z) para o input datetime-local (ex: 2025-11-13T18:30)
      data_hora: partida.data_hora.slice(0, 16),
      gols_casa: partida.gols_casa.toString(),
      gols_visitante: partida.gols_visitante.toString(),
      temporada: partida.temporada.toString(),
      numero_rodada: partida.numero_rodada.toString(),
      id_clube_casa: partida.id_clube_casa,
      id_clube_visitante: partida.id_clube_visitante,
      id_estadio: partida.id_estadio,
      finalizada: partida.finalizada,
    });
    setEditingId(partida.id_partida);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta partida?')) return;
    try {
      // --- ALTERADO (DELETE) ---
      const response = await fetch(`${API_URL}/partidas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir partida');
      }
      // ---------------

      loadData();
    } catch (error) {
      console.error('Erro ao excluir partida:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      data_hora: '',
      gols_casa: '0',
      gols_visitante: '0',
      temporada: '',
      numero_rodada: '',
      id_clube_casa: '',
      id_clube_visitante: '',
      id_estadio: '',
      finalizada: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Funções HELPER (Não precisam de mudança)
  const getClubeNome = (id: string) => {
    return clubes.find((c) => c.id_clube === id)?.nome_clube || '-';
  };

  const getEstadioNome = (id: string) => {
    return estadios.find((e) => e.id_estadio === id)?.nome_estadio || '-';
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
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Partidas</h2>
            <p className="text-sm text-slate-500">Gerencie os jogos do campeonato</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Partida</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Editar Partida' : 'Nova Partida'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temporada *</label>
              <select
                required
                value={formData.temporada}
                onChange={(e) => setFormData({ ...formData, temporada: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {temporadas.map((temp) => (
                  <option key={temp.ano} value={temp.ano}>
                    {temp.ano}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rodada *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.numero_rodada}
                onChange={(e) => setFormData({ ...formData, numero_rodada: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.data_hora}
                onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estádio *</label>
              <select
                required
                value={formData.id_estadio}
                onChange={(e) => setFormData({ ...formData, id_estadio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {estadios.map((estadio) => (
                  <option key={estadio.id_estadio} value={estadio.id_estadio}>
                    {estadio.nome_estadio}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clube Casa *
              </label>
              <select
                required
                value={formData.id_clube_casa}
                onChange={(e) => setFormData({ ...formData, id_clube_casa: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {clubes.map((clube) => (
                  <option key={clube.id_clube} value={clube.id_clube}>
                    {clube.nome_clube}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clube Visitante *
              </label>
              <select
                required
                value={formData.id_clube_visitante}
                onChange={(e) => setFormData({ ...formData, id_clube_visitante: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {clubes.map((clube) => (
                  <option key={clube.id_clube} value={clube.id_clube}>
                    {clube.nome_clube}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gols Casa</label>
              <input
                type="number"
                min="0"
                value={formData.gols_casa}
                onChange={(e) => setFormData({ ...formData, gols_casa: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gols Visitante
              </label>
              <input
                type="number"
                min="0"
                value={formData.gols_visitante}
                onChange={(e) => setFormData({ ...formData, gols_visitante: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.finalizada}
                  onChange={(e) => setFormData({ ...formData, finalizada: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-slate-700">Partida Finalizada</span>
              </label>
            </div>
            <div className="col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Data</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rodada</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Casa</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                Placar
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                Visitante
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estádio</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {partidas.map((partida) => (
              <tr key={partida.id_partida} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-600">
                  {new Date(partida.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="py-3 px-4 text-slate-600">{partida.numero_rodada}ª</td>
                <td className="py-3 px-4 text-slate-800 font-medium">
                  {getClubeNome(partida.id_clube_casa)}
                </td>
                <td className="py-3 px-4 text-center text-slate-800 font-bold">
                  {partida.gols_casa} x {partida.gols_visitante}
                </td>
                <td className="py-3 px-4 text-slate-800 font-medium">
                  {getClubeNome(partida.id_clube_visitante)}
                </td>
                <td className="py-3 px-4 text-slate-600">{getEstadioNome(partida.id_estadio)}</td>
                <td className="py-3 px-4 text-center">
                  {partida.finalizada ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Finalizada
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      Agendada
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleEdit(partida)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all mr-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(partida.id_partida)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {partidas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhuma partida cadastrada. Clique em "Nova Partida" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
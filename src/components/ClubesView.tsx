// ARQUIVO: src/components/ClubesView.tsx

import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase'; // <<< REMOVIDO
import { Clube } from '../types';
import { Plus, Edit2, Trash2, ShirtIcon } from 'lucide-react';

const API_URL = 'http://localhost:3001'; // <<< ADICIONADO

export default function ClubesView() {
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Note: Este ID será o id_clube
  const [formData, setFormData] = useState({
    nome_clube: '',
    cidade_clube: '',
    estado_clube: '',
    ano_fundacao: '',
    tecnico_clube: '',
  });

  useEffect(() => {
    loadClubes();
  }, []);

  const loadClubes = async () => {
    try {
      // --- ALTERADO (READ) ---
      const response = await fetch(`${API_URL}/clubes`);
      if (!response.ok) throw new Error('Falha ao carregar clubes');
      const data = await response.json();
      // ---------------

      setClubes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clubes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        ano_fundacao: formData.ano_fundacao ? parseInt(formData.ano_fundacao) : null,
      };

      // --- ALTERADO (CREATE / UPDATE) ---
      let url = `${API_URL}/clubes`;
      let method = 'POST'; // CREATE

      if (editingId) {
        url = `${API_URL}/clubes/${editingId}`; // UPDATE
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
        throw new Error(errorData.error || 'Falha ao salvar clube');
      }
      // ---------------

      resetForm();
      loadClubes();
    } catch (error) {
      console.error('Erro ao salvar clube:', error);
    }
  };

  const handleEdit = (clube: Clube) => {
    setFormData({
      nome_clube: clube.nome_clube,
      cidade_clube: clube.cidade_clube,
      estado_clube: clube.estado_clube,
      ano_fundacao: clube.ano_fundacao?.toString() || '',
      tecnico_clube: clube.tecnico_clube || '',
    });
    setEditingId(clube.id_clube); // Armazena o ID para o handleSubmit
    setShowForm(true);
  };

  const handleDelete = async (id: string) => { // 'id' aqui é o id_clube
    if (!confirm('Deseja realmente excluir este clube?')) return;
    try {
      // --- ALTERADO (DELETE) ---
      const response = await fetch(`${API_URL}/clubes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir clube');
      }
      // ---------------

      loadClubes();
    } catch (error) {
      console.error('Erro ao excluir clube:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_clube: '',
      cidade_clube: '',
      estado_clube: '',
      ano_fundacao: '',
      tecnico_clube: '',
    });
    setEditingId(null);
    setShowForm(false);
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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
            <ShirtIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Clubes</h2>
            <p className="text-sm text-slate-500">Gerencie os times do campeonato</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Clube</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Editar Clube' : 'Novo Clube'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Clube *
              </label>
              <input
                type="text"
                required
                value={formData.nome_clube}
                onChange={(e) => setFormData({ ...formData, nome_clube: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={formData.cidade_clube}
                onChange={(e) => setFormData({ ...formData, cidade_clube: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
              <input
                type="text"
                required
                value={formData.estado_clube}
                onChange={(e) => setFormData({ ...formData, estado_clube: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ano de Fundação
              </label>
              <input
                type="number"
                value={formData.ano_fundacao}
                onChange={(e) => setFormData({ ...formData, ano_fundacao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Técnico</label>
              <input
                type="text"
                value={formData.tecnico_clube}
                onChange={(e) => setFormData({ ...formData, tecnico_clube: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Clube</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cidade</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                Fundação
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Técnico</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clubes.map((clube) => (
              <tr key={clube.id_clube} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 font-medium">{clube.nome_clube}</td>
                <td className="py-3 px-4 text-slate-600">{clube.cidade_clube}</td>
                <td className="py-3 px-4 text-slate-600">{clube.estado_clube}</td>
                <td className="py-3 px-4 text-slate-600">{clube.ano_fundacao || '-'}</td>
                <td className="py-3 px-4 text-slate-600">{clube.tecnico_clube || '-'}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleEdit(clube)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all mr-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(clube.id_clube)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clubes.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum clube cadastrado. Clique em "Novo Clube" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
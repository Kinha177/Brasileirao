// ARQUIVO: src/components/EstadiosView.tsx

import { useState, useEffect } from 'react';
import { Estadio } from '../types'; // Certifique-se que 'Estadio' está em src/types
import { Plus, Edit2, Trash2, Landmark } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function EstadiosView() {
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome_estadio: '',
    cidade_estadio: '',
    capacidade_estadio: '',
  });

  useEffect(() => {
    loadEstadios();
  }, []);

  const loadEstadios = async () => {
    try {
      const response = await fetch(`${API_URL}/estadios`);
      if (!response.ok) throw new Error('Falha ao carregar estádios');
      const data = await response.json();
      setEstadios(data || []);
    } catch (error) {
      console.error('Erro ao carregar estádios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        capacidade_estadio: formData.capacidade_estadio ? parseInt(formData.capacidade_estadio) : null,
      };

      let url = `${API_URL}/estadios`;
      let method = 'POST';

      if (editingId) {
        url = `${API_URL}/estadios/${editingId}`;
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
        throw new Error(errorData.error || 'Falha ao salvar estádio');
      }

      resetForm();
      loadEstadios();
    } catch (error) {
      console.error('Erro ao salvar estádio:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const handleEdit = (estadio: Estadio) => {
    setFormData({
      nome_estadio: estadio.nome_estadio,
      cidade_estadio: estadio.cidade_estadio,
      capacidade_estadio: estadio.capacidade_estadio?.toString() || '',
    });
    setEditingId(estadio.id_estadio);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este estádio? \nIsso só será possível se ele não estiver sendo usado em nenhuma partida.')) return;
    try {
      const response = await fetch(`${API_URL}/estadios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir estádio');
      }
      
      loadEstadios();
    } catch (error) {
      console.error('Erro ao excluir estádio:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_estadio: '',
      cidade_estadio: '',
      capacidade_estadio: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2 rounded-lg">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Estádios</h2>
            <p className="text-sm text-slate-500">Gerencie os locais dos jogos</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Estádio</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Editar Estádio' : 'Novo Estádio'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Estádio *
              </label>
              <input
                type="text"
                required
                value={formData.nome_estadio}
                onChange={(e) => setFormData({ ...formData, nome_estadio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={formData.cidade_estadio}
                onChange={(e) => setFormData({ ...formData, cidade_estadio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade</label>
              <input
                type="number"
                value={formData.capacidade_estadio}
                onChange={(e) => setFormData({ ...formData, capacidade_estadio: e.target.value })}
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cidade</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                Capacidade
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {estadios.map((estadio) => (
              <tr key={estadio.id_estadio} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 font-medium">{estadio.nome_estadio}</td>
                <td className="py-3 px-4 text-slate-600">{estadio.cidade_estadio}</td>
                <td className="py-3 px-4 text-slate-600">
                  {estadio.capacidade_estadio?.toLocaleString('pt-BR') || '-'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleEdit(estadio)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all mr-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(estadio.id_estadio)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {estadios.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum estádio cadastrado. Clique em "Novo Estádio" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
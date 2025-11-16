// ARQUIVO: src/components/TemporadasView.tsx

import { useState, useEffect } from 'react';
import { Temporada } from '../types';
import { Plus, Trash2, CalendarCheck } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function TemporadasView() {
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAno, setNewAno] = useState('');

  useEffect(() => {
    loadTemporadas();
  }, []);

  const loadTemporadas = async () => {
    try {
      const response = await fetch(`${API_URL}/temporadas`);
      if (!response.ok) throw new Error('Falha ao carregar temporadas');
      const data = await response.json();
      setTemporadas(data || []);
    } catch (error) {
      console.error('Erro ao carregar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(parseInt(newAno)) || newAno.length !== 4) {
      alert('Por favor, insira um ano válido (ex: 2025).');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/temporadas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ano: parseInt(newAno) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar temporada');
      }

      setNewAno('');
      setShowForm(false);
      loadTemporadas();
    } catch (error) {
      console.error('Erro ao salvar temporada:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const handleDelete = async (ano: number) => {
    if (!confirm(`Deseja realmente excluir a temporada ${ano}? \nIsso só será possível se ela não estiver sendo usada por nenhuma partida.`)) return;
    try {
      const response = await fetch(`${API_URL}/temporadas/${ano}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir temporada');
      }

      loadTemporadas();
    } catch (error) {
      console.error('Erro ao excluir temporada:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg">
            <CalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Temporadas</h2>
            <p className="text-sm text-slate-500">Adicione ou remova temporadas (anos)</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Temporada</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nova Temporada</h3>
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ano da Temporada (ex: 2025) *
              </label>
              <input
                type="number"
                placeholder="2025"
                required
                value={newAno}
                onChange={(e) => setNewAno(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3 items-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Ano</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {temporadas.map((temp) => (
              <tr key={temp.ano} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 font-medium">{temp.ano}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(temp.ano)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {temporadas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhuma temporada cadastrada. Clique em "Nova Temporada" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
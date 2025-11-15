// ARQUIVO: src/components/EstatisticasView.tsx

import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase'; // <<< REMOVIDO
import { Partida, Jogador, Clube, Estatistica } from '../types';
import { BarChart3 } from 'lucide-react';

const API_URL = 'http://localhost:3001'; // <<< ADICIONADO

export default function EstatisticasView() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartida, setSelectedPartida] = useState<string>('');
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);
  const [formData, setFormData] = useState({
    cpf_jogador: '',
    gols_marcados: '0',
    assistencias: '0',
    cartoes_amarelos: '0',
    cartoes_vermelhos: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPartida) {
      loadEstatisticas(selectedPartida);
    } else {
      setEstatisticas([]); // Limpa estatísticas se nenhuma partida for selecionada
    }
  }, [selectedPartida]);

  const loadData = async () => {
    try {
      // --- ALTERADO (Promise.all com fetch) ---
      const [partidasRes, jogadoresRes, clubesRes] = await Promise.all([
        // O backend deve filtrar por finalizada=true e ordenar
        fetch(`${API_URL}/partidas?finalizada=true`),
        fetch(`${API_URL}/jogadores`),
        fetch(`${API_URL}/clubes`),
      ]);

      if (!partidasRes.ok) throw new Error('Falha ao carregar partidas');
      if (!jogadoresRes.ok) throw new Error('Falha ao carregar jogadores');
      if (!clubesRes.ok) throw new Error('Falha ao carregar clubes');

      const [partidasData, jogadoresData, clubesData] = await Promise.all([
        partidasRes.json(),
        jogadoresRes.json(),
        clubesRes.json(),
      ]);
      // ---------------

      setPartidas(partidasData || []);
      setJogadores(jogadoresData || []);
      setClubes(clubesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async (idPartida: string) => {
    try {
      // --- ALTERADO (GET Estatisticas por partida) ---
      const response = await fetch(`${API_URL}/estatisticas?id_partida=${idPartida}`);
      if (!response.ok) throw new Error('Falha ao carregar estatísticas');
      const data = await response.json();
      // ---------------

      setEstatisticas(data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartida || !formData.cpf_jogador) {
        alert("Selecione uma partida e um jogador.");
        return;
    };

    try {
      const dataToSave = {
        id_partida: selectedPartida,
        cpf_jogador: formData.cpf_jogador,
        gols_marcados: parseInt(formData.gols_marcados),
        assistencias: parseInt(formData.assistencias),
        cartoes_amarelos: parseInt(formData.cartoes_amarelos),
        cartoes_vermelhos: parseInt(formData.cartoes_vermelhos),
      };

      // --- ALTERADO (UPSERT -> POST) ---
      // O Supabase fazia um "UPSERT". Aqui, fazemos um POST
      // e o backend deve ter a lógica de "INSERT ... ON DUPLICATE KEY UPDATE"
      const response = await fetch(`${API_URL}/estatisticas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar estatística');
      }
      // ---------------

      resetForm();
      loadEstatisticas(selectedPartida);
    } catch (error) {
      console.error('Erro ao salvar estatística:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      cpf_jogador: '',
      gols_marcados: '0',
      assistencias: '0',
      cartoes_amarelos: '0',
      cartoes_vermelhos: '0',
    });
  };

  //
  // Funções de HElPER (getClubeNome, getJogadorNome, getJogadoresDaPartida)
  // NÃO PRECISAM DE MUDANÇA, pois operam sobre o estado local
  //
  const getClubeNome = (id: string) => {
    return clubes.find((c) => c.id_clube === id)?.nome_clube || '-';
  };

  const getJogadorNome = (cpf: string) => {
    return jogadores.find((j) => j.cpf_jogador === cpf)?.nome_jogador || '-';
  };

  const getJogadoresDaPartida = () => {
    if (!selectedPartida) return [];
    const partida = partidas.find((p) => p.id_partida === selectedPartida);
    if (!partida) return [];

    return jogadores.filter(
      (j) => j.id_clube === partida.id_clube_casa || j.id_clube === partida.id_clube_visitante
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Carregando...</div>;
  }

  const selectedPartidaData = partidas.find((p) => p.id_partida === selectedPartida);

  //
  // O RESTANTE DO SEU CÓDIGO (JSX) PERMANECE EXATAMENTE IGUAL
  // ... (todo o HTML/JSX dos selects, formulário e tabela) ...
  //

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Estatísticas de Partidas</h2>
          <p className="text-sm text-slate-500">Registre os eventos das partidas finalizadas</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecione uma Partida Finalizada
        </label>
        <select
          value={selectedPartida}
          onChange={(e) => setSelectedPartida(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Escolha uma partida...</option>
          {partidas.map((partida) => (
            <option key={partida.id_partida} value={partida.id_partida}>
              {getClubeNome(partida.id_clube_casa)} {partida.gols_casa} x {partida.gols_visitante}{' '}
              {getClubeNome(partida.id_clube_visitante)} - Rodada {partida.numero_rodada} (
              {new Date(partida.data_hora).toLocaleDateString('pt-BR')})
            </option>
          ))}
        </select>
      </div>

      {selectedPartida && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Adicionar Estatística do Jogador
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jogador *</label>
                <select
                  required
                  value={formData.cpf_jogador}
                  onChange={(e) => setFormData({ ...formData, cpf_jogador: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {getJogadoresDaPartida().map((jogador) => (
                    <option key={jogador.cpf_jogador} value={jogador.cpf_jogador}>
                      {jogador.nome_jogador} (
                      {clubes.find((c) => c.id_clube === jogador.id_clube)?.nome_clube})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gols</label>
                <input
                  type="number"
                  min="0"
                  value={formData.gols_marcados}
                  onChange={(e) => setFormData({ ...formData, gols_marcados: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assistências
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.assistencias}
                  onChange={(e) => setFormData({ ...formData, assistencias: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cartões Amarelos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cartoes_amarelos}
                  onChange={(e) => setFormData({ ...formData, cartoes_amarelos: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cartões Vermelhos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cartoes_vermelhos}
                  onChange={(e) => setFormData({ ...formData, cartoes_vermelhos: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>

          {selectedPartidaData && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {getClubeNome(selectedPartidaData.id_clube_casa)}{' '}
                  <span className="text-2xl text-green-600 mx-3">
                    {selectedPartidaData.gols_casa} x {selectedPartidaData.gols_visitante}
                  </span>{' '}
                  {getClubeNome(selectedPartidaData.id_clube_visitante)}
                </h3>
                <p className="text-sm text-slate-500">
                  Rodada {selectedPartidaData.numero_rodada} -{' '}
                  {new Date(selectedPartidaData.data_hora).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Estatísticas Registradas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Jogador
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                      Gols
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                      Assistências
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                      Amarelos
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                      Vermelhos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estatisticas.map((stat) => (
                    <tr
                      key={`${stat.id_partida}-${stat.cpf_jogador}`}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {getJogadorNome(stat.cpf_jogador)}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700">
                        {stat.gols_marcados}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700">{stat.assistencias}</td>
                      <td className="py-3 px-4 text-center text-yellow-600">
                        {stat.cartoes_amarelos}
                      </td>
                      <td className="py-3 px-4 text-center text-red-600">
                        {stat.cartoes_vermelhos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {estatisticas.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma estatística registrada para esta partida.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedPartida && partidas.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Nenhuma partida finalizada. Finalize partidas para registrar estatísticas.
        </div>
      )}
    </div>
  );
}
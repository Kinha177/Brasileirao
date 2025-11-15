// ARQUIVO: src/components/ClassificacaoView.tsx

import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase'; // <<< REMOVIDO
import { Classificacao, Artilheiro, Temporada } from '../types';
import { Trophy, Target } from 'lucide-react';

const API_URL = 'http://localhost:3001'; // <<< ADICIONADO (Porta do seu backend)

export default function ClassificacaoView() {
  const [classificacao, setClassificacao] = useState<Classificacao[]>([]);
  const [artilharia, setArtilharia] = useState<Artilheiro[]>([]);
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [selectedTemporada, setSelectedTemporada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classificacao' | 'artilharia'>('classificacao');

  useEffect(() => {
    loadTemporadas();
  }, []);

  useEffect(() => {
    if (selectedTemporada) {
      loadClassificacao(selectedTemporada);
      loadArtilharia(selectedTemporada);
    }
  }, [selectedTemporada]);

  const loadTemporadas = async () => {
    try {
      // --- ALTERADO ---
      const response = await fetch(`${API_URL}/temporadas`);
      if (!response.ok) throw new Error('Falha ao carregar temporadas');
      const data = await response.json();
      // ---------------

      setTemporadas(data || []);
      if (data && data.length > 0) {
        setSelectedTemporada(data[0].ano);
      }
    } catch (error) {
      console.error('Erro ao carregar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassificacao = async (temporada: number) => {
    try {
      // --- ALTERADO ---
      // Usamos query params para passar a temporada
      const response = await fetch(`${API_URL}/classificacao?temporada=${temporada}`);
      if (!response.ok) throw new Error('Falha ao carregar classificação');
      const data = await response.json();
      // ---------------

      setClassificacao(data || []);
    } catch (error) {
      console.error('Erro ao carregar classificação:', error);
    }
  };

  const loadArtilharia = async (temporada: number) => {
    try {
      // --- ALTERADO ---
      // Usamos query params para passar a temporada
      const response = await fetch(`${API_URL}/artilharia?temporada=${temporada}`);
      if (!response.ok) throw new Error('Falha ao carregar artilharia');
      const data = await response.json();
      // ---------------

      setArtilharia(data || []);
    } catch (error) {
      console.error('Erro ao carregar artilharia:', error);
    }
  };

  const getPosicaoClass = (posicao: number) => {
    if (posicao <= 4) return 'bg-blue-50 border-l-4 border-blue-500';
    if (posicao <= 6) return 'bg-green-50 border-l-4 border-green-500';
    if (posicao <= 12) return 'bg-orange-50 border-l-4 border-orange-500';
    if (posicao >= 17) return 'bg-red-50 border-l-4 border-red-500';
    return '';
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Carregando...</div>;
  }

  //
  // O RESTANTE DO SEU CÓDIGO (JSX) PERMANECE EXATAMENTE IGUAL
  // ... (todo o HTML/JSX da sua tabela) ...
  //

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Classificação e Estatísticas</h2>
            <p className="text-sm text-slate-500">Acompanhe o desempenho do campeonato</p>
          </div>
        </div>
        <div>
          <select
            value={selectedTemporada || ''}
            onChange={(e) => setSelectedTemporada(parseInt(e.target.value))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {temporadas.map((temp) => (
              <option key={temp.ano} value={temp.ano}>
                Temporada {temp.ano}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('classificacao')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'classificacao'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Classificação Geral
        </button>
        <button
          onClick={() => setActiveTab('artilharia')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'artilharia'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Artilharia
        </button>
      </div>

      {activeTab === 'classificacao' && (
        <div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-slate-600">Libertadores (1º-4º)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-slate-600">Pré-Libertadores (5º-6º)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-slate-600">Sul-Americana (7º-12º)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-slate-600">Rebaixamento (17º-20º)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-12">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Clube
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    P
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    J
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    V
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    E
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    D
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    GP
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    GC
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    SG
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    CA
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    CV
                  </th>
                </tr>
              </thead>
              <tbody>
                {classificacao.map((item) => (
                  <tr
                    key={item.id_clube} // Certifique-se que o tipo Classificacao tem id_clube
                    className={`border-b border-slate-100 hover:bg-slate-50 ${getPosicaoClass(
                      item.posicao
                    )}`}
                  >
                    <td className="py-3 px-3 text-center text-slate-700 font-bold">
                      {item.posicao}º
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{item.nome_clube}</td>
                    <td className="py-3 px-3 text-center text-slate-800 font-bold">
                      {item.pontos}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.jogos}</td>
                    <td className="py-3 px-3 text-center text-green-600 font-medium">
                      {item.vitorias}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.empates}</td>
                    <td className="py-3 px-3 text-center text-red-600 font-medium">
                      {item.derrotas}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700">{item.gols_pro}</td>
                    <td className="py-3 px-3 text-center text-slate-700">{item.gols_contra}</td>
                    <td className="py-3 px-3 text-center text-slate-800 font-medium">
                      {item.saldo_gols > 0 ? '+' : ''}
                      {item.saldo_gols}
                    </td>
                    <td className="py-3 px-3 text-center text-yellow-600">
                      {item.cartoes_amarelos}
                    </td>
                    <td className="py-3 px-3 text-center text-red-600">
                      {item.cartoes_vermelhos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {classificacao.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhum dado de classification disponível para esta temporada.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'artilharia' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-700 w-16">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Jogador
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Clube
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Posição
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Gols
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Partidas
                  </th>
                </tr>
              </thead>
              <tbody>
                {artilharia.map((artilheiro, index) => (
                  <tr
                    key={artilheiro.cpf_jogador} // Certifique-se que o tipo Artilheiro tem cpf_jogador
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      index < 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      {index === 0 && (
                        <Trophy className="w-5 h-5 text-yellow-500 inline-block" />
                      )}
                      {index === 1 && (
                        <Trophy className="w-5 h-5 text-slate-400 inline-block" />
                      )}
                      {index === 2 && (
                        <Trophy className="w-5 h-5 text-orange-600 inline-block" />
                      )}
                      {index > 2 && (
                        <span className="text-slate-600 font-medium">{index + 1}º</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">
                      {artilheiro.nome_jogador}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{artilheiro.nome_clube || '-'}</td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {artilheiro.posicao_jogador}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {artilheiro.total_gols}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {artilheiro.partidas_com_gol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {artilharia.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhum artilheiro registrado para esta temporada.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
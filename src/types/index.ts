export interface Clube {
  id_clube: string;
  nome_clube: string;
  cidade_clube: string;
  estado_clube: string;
  ano_fundacao: number | null;
  tecnico_clube: string | null;
  created_at?: string;
}

export interface Estadio {
  id_estadio: string;
  nome_estadio: string;
  cidade_estadio: string;
  capacidade_estadio: number;
  created_at?: string;
}

export interface Jogador {
  cpf_jogador: string;
  nome_jogador: string;
  posicao: string;
  data_nascimento: string;
  nacionalidade: string;
  id_clube: string | null;
  created_at?: string;
}

export interface Temporada {
  ano: number;
  created_at?: string;
}

export interface Rodada {
  temporada: number;
  numero_rodada: number;
  data_inicio: string;
  data_fim: string;
}

export interface Partida {
  id_partida: string;
  data_hora: string;
  gols_casa: number;
  gols_visitante: number;
  temporada: number;
  numero_rodada: number;
  id_clube_casa: string;
  id_clube_visitante: string;
  id_estadio: string;
  finalizada: boolean;
}

export interface Estatistica {
  id_partida: string;
  cpf_jogador: string;
  gols_marcados: number;
  assistencias: number;
  cartoes_amarelos: number;
  cartoes_vermelhos: number;
}

export interface Classificacao {
  posicao: number;
  temporada: number;
  id_clube: string;
  nome_clube: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo_gols: number;
  cartoes_amarelos: number;
  cartoes_vermelhos: number;
}

export interface Artilheiro {
  posicao_artilharia: number;
  temporada: number;
  cpf_jogador: string;
  nome_jogador: string;
  posicao_jogador: string;
  nome_clube: string | null;
  total_gols: number;
  partidas_com_gol: number;
}

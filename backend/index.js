// ARQUIVO: backend/index.js

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json()); // Para ler JSON no body
app.use(cors()); // Permite chamadas do seu frontend

const port = 3001;

// --- !!! CONFIGURE SEU BANCO AQUI !!! ---
const dbConfig = {
  host: 'localhost',
  user: 'root', // Seu usuário MySQL
  password: '', // Sua senha MySQL
  database: 'campeonato' // O nome do seu database
};

/*
 * Helper de Conexão:
 * Usamos uma função para executar queries e garantir que a conexão
 * é sempre fechada (evitando vazamento de conexões).
 */
async function executeQuery(sql, params) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(sql, params);
    await connection.end();
    return rows;
  } catch (error) {
    // Se a conexão foi estabelecida, feche-a
    if (connection) await connection.end();
    // Re-lança o erro para ser pego pelo 'catch' da rota
    throw new Error(`Erro de Banco de Dados: ${error.message}`);
  }
}

// ===================================
// ROTAS DE LEITURA (VIEWS)
// ===================================

// GET /classificacao (de ClassificacaoView)
app.get('/classificacao', async (req, res) => {
  const { temporada } = req.query;
  if (!temporada) {
    return res.status(400).json({ error: 'Query param "temporada" é obrigatório' });
  }
  try {
    const sql = 'SELECT * FROM view_classificacao_geral WHERE temporada = ? ORDER BY posicao';
    const data = await executeQuery(sql, [temporada]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /artilharia (de ClassificacaoView)
app.get('/artilharia', async (req, res) => {
  const { temporada } = req.query;
  if (!temporada) {
    return res.status(400).json({ error: 'Query param "temporada" é obrigatório' });
  }
  try {
    const sql = 'SELECT * FROM view_artilharia WHERE temporada = ? ORDER BY posicao_artilharia';
    const data = await executeQuery(sql, [temporada]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// CRUD: CLUBES (de ClubesView, JogadoresView, etc.)
// ===================================

// GET /clubes
app.get('/clubes', async (req, res) => {
  try {
    const sql = 'SELECT * FROM clubes ORDER BY nome_clube';
    const data = await executeQuery(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /clubes
app.post('/clubes', async (req, res) => {
  try {
    const { nome_clube, cidade_clube, estado_clube, ano_fundacao, tecnico_clube } = req.body;
    const sql = 'INSERT INTO clubes (nome_clube, cidade_clube, estado_clube, ano_fundacao, tecnico_clube) VALUES (?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [nome_clube, cidade_clube, estado_clube, ano_fundacao || null, tecnico_clube || null]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /clubes/:id
app.put('/clubes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_clube, cidade_clube, estado_clube, ano_fundacao, tecnico_clube } = req.body;
    const sql = 'UPDATE clubes SET nome_clube = ?, cidade_clube = ?, estado_clube = ?, ano_fundacao = ?, tecnico_clube = ? WHERE id_clube = ?';
    await executeQuery(sql, [nome_clube, cidade_clube, estado_clube, ano_fundacao || null, tecnico_clube || null, id]);
    res.json({ message: 'Clube atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /clubes/:id
app.delete('/clubes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM clubes WHERE id_clube = ?';
    await executeQuery(sql, [id]);
    res.json({ message: 'Clube excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// CRUD: JOGADORES (de JogadoresView, EstatisticasView)
// ===================================

// GET /jogadores
app.get('/jogadores', async (req, res) => {
  try {
    const sql = 'SELECT * FROM jogadores ORDER BY nome_jogador';
    const data = await executeQuery(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /jogadores
app.post('/jogadores', async (req, res) => {
  try {
    const { cpf_jogador, nome_jogador, posicao, data_nascimento, nacionalidade, id_clube } = req.body;
    const sql = 'INSERT INTO jogadores (cpf_jogador, nome_jogador, posicao, data_nascimento, nacionalidade, id_clube) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [cpf_jogador, nome_jogador, posicao, data_nascimento, nacionalidade, id_clube || null]);
    res.status(201).json({ ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /jogadores/:cpf
app.put('/jogadores/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const { nome_jogador, posicao, data_nascimento, nacionalidade, id_clube } = req.body;
    const sql = 'UPDATE jogadores SET nome_jogador = ?, posicao = ?, data_nascimento = ?, nacionalidade = ?, id_clube = ? WHERE cpf_jogador = ?';
    await executeQuery(sql, [nome_jogador, posicao, data_nascimento, nacionalidade, id_clube || null, cpf]);
    res.json({ message: 'Jogador atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /jogadores/:cpf
app.delete('/jogadores/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const sql = 'DELETE FROM jogadores WHERE cpf_jogador = ?';
    await executeQuery(sql, [cpf]);
    res.json({ message: 'Jogador excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// CRUD: PARTIDAS (de PartidasView, EstatisticasView)
// ===================================

// GET /partidas
app.get('/partidas', async (req, res) => {
  try {
    let sql = 'SELECT * FROM partidas';
    const params = [];

    // Filtro usado pela EstatisticasView
    if (req.query.finalizada === 'true') {
      sql += ' WHERE finalizada = ?';
      params.push(true);
    }
    
    sql += ' ORDER BY data_hora DESC'; // Ordenação padrão
    
    const data = await executeQuery(sql, params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /partidas
app.post('/partidas', async (req, res) => {
  try {
    const { data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada } = req.body;
    const sql = 'INSERT INTO partidas (data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada || false]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /partidas/:id
app.put('/partidas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada } = req.body;
    const sql = 'UPDATE partidas SET data_hora = ?, gols_casa = ?, gols_visitante = ?, temporada = ?, numero_rodada = ?, id_clube_casa = ?, id_clube_visitante = ?, id_estadio = ?, finalizada = ? WHERE id_partida = ?';
    await executeQuery(sql, [data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada || false, id]);
    res.json({ message: 'Partida atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /partidas/:id
app.delete('/partidas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM partidas WHERE id_partida = ?';
    await executeQuery(sql, [id]);
    res.json({ message: 'Partida excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// CRUD: ESTATISTICAS (de EstatisticasView)
// ===================================

// GET /estatisticas
app.get('/estatisticas', async (req, res) => {
  const { id_partida } = req.query;
  if (!id_partida) {
    return res.status(400).json({ error: 'Query param "id_partida" é obrigatório' });
  }
  try {
    const sql = 'SELECT * FROM estatisticas WHERE id_partida = ?';
    const data = await executeQuery(sql, [id_partida]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /estatisticas (UPSERT)
app.post('/estatisticas', async (req, res) => {
  try {
    const { id_partida, cpf_jogador, gols_marcados, assistencias, cartoes_amarelos, cartoes_vermelhos } = req.body;
    
    // Lógica UPSERT do MySQL
    const sql = `
      INSERT INTO estatisticas (id_partida, cpf_jogador, gols_marcados, assistencias, cartoes_amarelos, cartoes_vermelhos)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        gols_marcados = VALUES(gols_marcados),
        assistencias = VALUES(assistencias),
        cartoes_amarelos = VALUES(cartoes_amarelos),
        cartoes_vermelhos = VALUES(cartoes_vermelhos)
    `;
    
    await executeQuery(sql, [id_partida, cpf_jogador, gols_marcados, assistencias, cartoes_amarelos, cartoes_vermelhos]);
    res.status(201).json({ message: 'Estatística salva com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// OUTRAS TABELAS (GET-only)
// ===================================

// GET /temporadas (de ClassificacaoView, PartidasView)
app.get('/temporadas', async (req, res) => {
  try {
    const sql = 'SELECT * FROM temporadas ORDER BY ano DESC';
    const data = await executeQuery(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /estadios (de PartidasView)
app.get('/estadios', async (req, res) => {
  try {
    const sql = 'SELECT * FROM estadios ORDER BY nome_estadio';
    const data = await executeQuery(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===================================
// Iniciar o Servidor
// ===================================
app.listen(port, () => {
  console.log(`API (Backend) rodando em http://localhost:${port}`);
  console.log(`Conectando ao banco: ${dbConfig.database} em ${dbConfig.host}`);
});
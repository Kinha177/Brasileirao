// ARQUIVO: backend/index.js

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const port = 3001;

// --- !!! CONFIGURE SEU BANCO AQUI !!! ---
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'campeonato',
  connectionLimit: 10, // Adicionado pool de conexões
};

// --- ALTERADO: Usando um Pool de Conexões ---
// Isso é mais eficiente do que criar uma conexão para cada query
const pool = mysql.createPool(dbConfig);

// Helper de Conexão (agora usando o pool)
async function executeQuery(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    throw new Error(`Erro de Banco de Dados: ${error.message}`);
  }
}

// ===================================
// ROTAS DE LEITURA (VIEWS)
// ===================================

// GET /classificacao
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

// GET /artilharia
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
// CRUD: CLUBES
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
    const [result] = await pool.execute(sql, [nome_clube, cidade_clube, estado_clube, ano_fundacao || null, tecnico_clube || null]);
    res.status(201).json({ id_clube: result.insertId, ...req.body });
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
// CRUD: JOGADORES
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
    await pool.execute(sql, [cpf_jogador, nome_jogador, posicao, data_nascimento, nacionalidade, id_clube || null]);
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
// CRUD: PARTIDAS
// ===================================

// GET /partidas
app.get('/partidas', async (req, res) => {
  try {
    let sql = 'SELECT * FROM partidas';
    const params = [];
    if (req.query.finalizada === 'true') {
      sql += ' WHERE finalizada = ?';
      params.push(true);
    }
    sql += ' ORDER BY data_hora DESC';
    const data = await executeQuery(sql, params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTA POST/partidas MODIFICADA (para incluir transação e INSERT IGNORE) ---
app.post('/partidas', async (req, res) => {
  let connection;
  try {
    const { data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada } = req.body;
    
    connection = await pool.getConnection(); // Pega uma conexão do pool
    await connection.beginTransaction(); // Inicia a transação

    // 1. Garante que a rodada existe (para satisfazer a Foreign Key)
    // IGNORA se a rodada já existir (não dá erro)
    const sqlRodada = 'INSERT IGNORE INTO rodadas (temporada, numero_rodada) VALUES (?, ?)';
    await connection.execute(sqlRodada, [temporada, numero_rodada]);

    // 2. Insere a partida
    const sqlPartida = 'INSERT INTO partidas (data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await connection.execute(sqlPartida, [data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada || false]);
    
    await connection.commit(); // Confirma a transação
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    if (connection) await connection.rollback(); // Desfaz em caso de erro
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release(); // Libera a conexão de volta para o pool
  }
});

// --- ROTA PUT/partidas MODIFICADA (para incluir transação e INSERT IGNORE) ---
app.put('/partidas/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada } = req.body;
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Garante que a rodada existe (caso o usuário tenha mudado a rodada)
    const sqlRodada = 'INSERT IGNORE INTO rodadas (temporada, numero_rodada) VALUES (?, ?)';
    await connection.execute(sqlRodada, [temporada, numero_rodada]);

    // 2. Atualiza a partida
    const sqlPartida = 'UPDATE partidas SET data_hora = ?, gols_casa = ?, gols_visitante = ?, temporada = ?, numero_rodada = ?, id_clube_casa = ?, id_clube_visitante = ?, id_estadio = ?, finalizada = ? WHERE id_partida = ?';
    await connection.execute(sqlPartida, [data_hora, gols_casa, gols_visitante, temporada, numero_rodada, id_clube_casa, id_clube_visitante, id_estadio, finalizada || false, id]);
    
    await connection.commit();
    
    res.json({ message: 'Partida atualizada com sucesso' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE /partidas/:id
app.delete('/partidas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Precisamos deletar as estatísticas primeiro por causa da Foreign Key
    await executeQuery('DELETE FROM estatisticas WHERE id_partida = ?', [id]);
    await executeQuery('DELETE FROM partidas WHERE id_partida = ?', [id]);
    res.json({ message: 'Partida e estatísticas associadas excluídas com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// CRUD: ESTATISTICAS
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
// CRUD: TEMPORADAS (NOVO)
// ===================================

// GET /temporadas
app.get('/temporadas', async (req, res) => {
  try {
    const sql = 'SELECT * FROM temporadas ORDER BY ano DESC';
    const data = await executeQuery(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /temporadas (NOVO)
app.post('/temporadas', async (req, res) => {
  try {
    const { ano } = req.body;
    if (!ano || isNaN(parseInt(ano))) {
      return res.status(400).json({ error: 'O campo "ano" é obrigatório e deve ser um número.' });
    }
    const sql = 'INSERT INTO temporadas (ano) VALUES (?)';
    await executeQuery(sql, [ano]);
    res.status(201).json({ message: 'Temporada criada com sucesso' });
  } catch (error) {
    // Código de erro 1062 é "Duplicate entry"
    if (error.message.includes('1062')) {
      return res.status(409).json({ error: `A temporada ${req.body.ano} já existe.` });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /temporadas/:ano (NOVO)
app.delete('/temporadas/:ano', async (req, res) => {
  try {
    const { ano } = req.params;
    // O banco de dados (FOREIGN KEY) impedirá a exclusão se
    // uma rodada ou partida estiver usando esta temporada.
    const sql = 'DELETE FROM temporadas WHERE ano = ?';
    await executeQuery(sql, [ano]);
    res.json({ message: 'Temporada excluída com sucesso' });
  } catch (error) {
    // Código de erro 1451 é "Foreign key constraint fails"
    if (error.message.includes('1451')) {
      return res.status(409).json({ error: 'Não é possível excluir. Esta temporada está em uso por rodadas ou partidas.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// CRUD: ESTADIOS (NOVO)
// ===================================

// GET /estadios
app.get('/estadios', async (req, res) => {
  try {
    const sql = 'SELECT * FROM estadios ORDER BY nome_estadio';
    const data = await executeQuery(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /estadios (NOVO)
app.post('/estadios', async (req, res) => {
  try {
    const { nome_estadio, cidade_estadio, capacidade_estadio } = req.body;
    const sql = 'INSERT INTO estadios (nome_estadio, cidade_estadio, capacidade_estadio) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [nome_estadio, cidade_estadio, capacidade_estadio || null]);
    res.status(201).json({ id_estadio: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /estadios/:id (NOVO)
app.put('/estadios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_estadio, cidade_estadio, capacidade_estadio } = req.body;
    const sql = 'UPDATE estadios SET nome_estadio = ?, cidade_estadio = ?, capacidade_estadio = ? WHERE id_estadio = ?';
    await executeQuery(sql, [nome_estadio, cidade_estadio, capacidade_estadio || null, id]);
    res.json({ message: 'Estádio atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /estadios/:id (NOVO)
app.delete('/estadios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // O banco de dados (FOREIGN KEY) impedirá a exclusão se
    // um estádio estiver em uso por uma partida.
    const sql = 'DELETE FROM estadios WHERE id_estadio = ?';
    await executeQuery(sql, [id]);
    res.json({ message: 'Estádio excluído com sucesso' });
  } catch (error) {
    if (error.message.includes('1451')) {
      return res.status(409).json({ error: 'Não é possível excluir. Este estádio está em uso por uma partida.' });
    }
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
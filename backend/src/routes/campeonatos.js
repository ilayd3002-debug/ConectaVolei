// backend/src/routes/campeonatos.js
const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const router = express.Router();

/*
 * Descobre o id do usuário a partir do token JWT enviado no cabeçalho
 *   Authorization: Bearer <token>
 *
 * Retorna null se não houver token ou se ele for inválido.
 */
function obterUsuarioId(req) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;

  if (!token) return null;

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    const id = dados.id ?? dados.userId ?? dados.usuario_id ?? dados.sub ?? null;
    return id !== null ? Number(id) : null;
  } catch (erro) {
    return null;
  }
}

// GET /campeonatos
// Públicos: aparecem para todos.
// Privados: aparecem só para quem criou.
router.get('/', async (req, res) => {
  const usuarioId = obterUsuarioId(req);

  try {
    const filtro = usuarioId
      ? { OR: [{ publico: true }, { criador_id: usuarioId }] }
      : { publico: true };

    const campeonatos = await prisma.campeonato.findMany({
      where: filtro,
      orderBy: { data_inicio: 'desc' }
    });

    res.json(
      campeonatos.map((c) => ({
        ...c,
        eh_meu: usuarioId !== null && c.criador_id === usuarioId
      }))
    );
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar campeonatos' });
  }
});

// POST /campeonatos - cria um novo campeonato (precisa estar logado)
router.post('/', async (req, res) => {
  const usuarioId = obterUsuarioId(req);

  if (!usuarioId) {
    return res.status(401).json({ erro: 'Usuário não identificado. Faça login novamente.' });
  }

  const {
    nome, data_inicio, data_fim, formato, max_equipes,
    status, regulamento, publico
  } = req.body;

  if (!nome || !data_inicio || !data_fim || !formato || !max_equipes) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
  }

  const maxEquipes = Number(max_equipes);

  if (!Number.isInteger(maxEquipes) || maxEquipes < 1) {
    return res.status(400).json({ erro: 'Número máximo de equipes inválido' });
  }

  try {
    const campeonato = await prisma.campeonato.create({
      data: {
        nome: String(nome).trim(),
        data_inicio: String(data_inicio).slice(0, 10),
        data_fim: String(data_fim).slice(0, 10),
        formato,
        max_equipes: maxEquipes,
        status: status || 'planejado',
        regulamento: regulamento || null,
        publico: publico !== false, // se não vier nada, fica público
        criador_id: usuarioId       // vem do token, não do corpo da requisição
      }
    });

    res.status(201).json(campeonato);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar campeonato' });
  }
});

// DELETE /campeonatos/:id - só quem criou pode excluir
router.delete('/:id', async (req, res) => {
  const usuarioId = obterUsuarioId(req);

  if (!usuarioId) {
    return res.status(401).json({ erro: 'Usuário não identificado. Faça login novamente.' });
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ erro: 'Campeonato inválido' });
  }

  try {
    const { count } = await prisma.campeonato.deleteMany({
      where: { id, criador_id: usuarioId }
    });

    if (count === 0) {
      return res.status(403).json({ erro: 'Você não pode excluir este campeonato' });
    }

    res.status(204).send();
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao excluir campeonato' });
  }
});

module.exports = router;

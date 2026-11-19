// backend/src/routes/partidasRouter.js
const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

/*
 * Campos da partida:
 * id, time_a, time_b, data, horario, local, criado_em,
 * tipo, campeonato_id, categoria, modalidade
 *
 * Além deles, a resposta traz os apelidos usados pelas telas:
 * mandante (= time_a), visitante (= time_b) e data_jogo (= data).
 */
function formatar(partida) {
  return {
    ...partida,
    mandante: partida.time_a,
    visitante: partida.time_b,
    data_jogo: partida.data
  };
}

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function lerCampeonatoId(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  return lerId(valor);
}

// GET /partidas - lista as partidas (mais próximas primeiro)
// Filtro opcional: /partidas?campeonato_id=3
router.get('/', async (req, res) => {
  try {
    const where = {};

    if (req.query.campeonato_id) {
      const campeonatoId = lerId(req.query.campeonato_id);

      if (!campeonatoId) {
        return res.status(400).json({ erro: 'Campeonato inválido' });
      }

      where.campeonato_id = campeonatoId;
    }

    const partidas = await prisma.partida.findMany({
      where,
      orderBy: [{ data: 'asc' }, { horario: 'asc' }]
    });

    res.json(partidas.map(formatar));
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar partidas' });
  }
});

// Valida e normaliza o corpo (POST e PUT)
function lerCorpo(body) {
  const { time_a, time_b, data, horario, local } = body;

  if (!time_a || !time_b || !data || !horario || !local) {
    return { erro: 'Preencha time A, time B, data, horário e local' };
  }

  if (String(time_a).trim() === String(time_b).trim()) {
    return { erro: 'Os dois times devem ser diferentes' };
  }

  const campeonatoId = lerCampeonatoId(body.campeonato_id);

  if (body.campeonato_id && !campeonatoId) {
    return { erro: 'Campeonato inválido' };
  }

  return {
    dados: {
      time_a: String(time_a).trim(),
      time_b: String(time_b).trim(),
      data: String(data).slice(0, 10),
      horario: String(horario).slice(0, 5),
      local: String(local).trim(),
      tipo: body.tipo || null,
      campeonato_id: campeonatoId,
      categoria: body.categoria || null,
      modalidade: body.modalidade || null
    }
  };
}

// POST /partidas - cria uma nova partida
router.post('/', async (req, res) => {
  const { erro, dados } = lerCorpo(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  try {
    const partida = await prisma.partida.create({ data: dados });
    res.status(201).json(formatar(partida));
  } catch (e) {
    // P2003 = campeonato informado não existe
    if (e.code === 'P2003') {
      return res.status(400).json({ erro: 'Campeonato não encontrado' });
    }

    console.error(e);
    res.status(500).json({ erro: 'Erro ao criar partida' });
  }
});

// PUT /partidas/:id - atualiza uma partida
router.put('/:id', async (req, res) => {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'Partida inválida' });
  }

  const { erro, dados } = lerCorpo(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  try {
    const partida = await prisma.partida.update({
      where: { id },
      data: dados
    });

    res.json(formatar(partida));
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    if (e.code === 'P2003') {
      return res.status(400).json({ erro: 'Campeonato não encontrado' });
    }

    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar partida' });
  }
});

// DELETE /partidas/:id - exclui uma partida
router.delete('/:id', async (req, res) => {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'Partida inválida' });
  }

  try {
    await prisma.partida.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    console.error(e);
    res.status(500).json({ erro: 'Erro ao excluir partida' });
  }
});

module.exports = router;

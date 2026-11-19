// controllers/checklistControllers.js
const checklistModel = require('../models/checklistModel');

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listarPorPartida(req, res) {
  const partidaId = lerId(req.params.partidaId);

  if (!partidaId) {
    return res.status(400).json({ erro: 'Partida inválida' });
  }

  try {
    const itens = await checklistModel.listarItensPorPartida(partidaId);
    res.json(itens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar checklist' });
  }
}

async function criar(req, res) {
  const partidaId = lerId(req.params.partidaId);
  const descricao = String(req.body.descricao ?? '').trim();

  if (!partidaId) {
    return res.status(400).json({ erro: 'Partida inválida' });
  }

  if (!descricao) {
    return res.status(400).json({ erro: 'Descrição é obrigatória' });
  }

  try {
    const item = await checklistModel.criarItem(partidaId, descricao);
    res.status(201).json(item);
  } catch (err) {
    // P2003 = violação de chave estrangeira (a partida não existe)
    if (err.code === 'P2003') {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    console.error(err);
    res.status(500).json({ erro: 'Erro ao adicionar item' });
  }
}

async function atualizar(req, res) {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'Item inválido' });
  }

  try {
    const item = await checklistModel.atualizarItem(
      id,
      Boolean(req.body.concluido)
    );

    if (!item) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar item' });
  }
}

async function excluir(req, res) {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'Item inválido' });
  }

  try {
    await checklistModel.excluirItem(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir item' });
  }
}

module.exports = { listarPorPartida, criar, atualizar, excluir };

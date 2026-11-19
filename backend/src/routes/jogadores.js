const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

function lerId(valor) {
  return /^\d+$/.test(valor) && Number(valor) >= 1 ? Number(valor) : null;
}

function numeroOuNull(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

// Monta os dados do jogador a partir do corpo da requisição
function lerCorpo(body) {
  const numeroCamisa = numeroOuNull(body.numero_camisa);
  const altura = numeroOuNull(body.altura);

  if (numeroCamisa === undefined || (numeroCamisa !== null && !Number.isInteger(numeroCamisa))) {
    return { erro: 'Número da camisa inválido.' };
  }

  if (altura === undefined) {
    return { erro: 'Altura inválida.' };
  }

  return {
    dados: {
      nome: body.nome.trim(),
      email: body.email || null,
      telefone: body.telefone || null,
      data_nascimento: body.data_nascimento || null,
      posicao: body.posicao || null,
      numero_camisa: numeroCamisa,
      altura,
      time: body.time || null
    }
  };
}

// Listar todos os jogadores
router.get('/', async (req, res) => {
  try {
    const jogadores = await prisma.jogador.findMany({
      orderBy: { id: 'asc' }
    });

    res.json(jogadores);
  } catch (erro) {
    console.error('Erro ao listar jogadores:', erro);
    res.status(500).json({ erro: 'Erro ao buscar jogadores.' });
  }
});

// Buscar jogador por ID
router.get('/:id', async (req, res) => {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  try {
    const jogador = await prisma.jogador.findUnique({ where: { id } });

    if (!jogador) {
      return res.status(404).json({ erro: 'Jogador não encontrado.' });
    }

    res.json(jogador);
  } catch (erro) {
    console.error('Erro ao buscar jogador:', erro);
    res.status(500).json({ erro: 'Erro ao buscar jogador.' });
  }
});

// Cadastrar jogador
router.post('/', async (req, res) => {
  if (!req.body.nome || !String(req.body.nome).trim()) {
    return res.status(400).json({ erro: 'O nome é obrigatório.' });
  }

  const { erro, dados } = lerCorpo({ ...req.body, nome: String(req.body.nome) });

  if (erro) {
    return res.status(400).json({ erro });
  }

  try {
    const jogador = await prisma.jogador.create({ data: dados });

    res.status(201).json(jogador);
  } catch (e) {
    // P2002 = valor único repetido (e-mail)
    if (e.code === 'P2002') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    console.error('Erro ao cadastrar jogador:', e);
    res.status(500).json({ erro: 'Erro ao cadastrar jogador.' });
  }
});

// Atualizar jogador
router.put('/:id', async (req, res) => {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const { status } = req.body;

  if (!req.body.nome || !String(req.body.nome).trim()) {
    return res.status(400).json({ erro: 'O nome é obrigatório.' });
  }

  if (status !== undefined && !['Ativo', 'Inativo'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  const { erro, dados } = lerCorpo({ ...req.body, nome: String(req.body.nome) });

  if (erro) {
    return res.status(400).json({ erro });
  }

  if (status !== undefined) dados.status = status;

  try {
    const jogador = await prisma.jogador.update({
      where: { id },
      data: dados
    });

    res.json(jogador);
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ erro: 'Jogador não encontrado.' });
    }

    if (e.code === 'P2002') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    console.error('Erro ao atualizar jogador:', e);
    res.status(500).json({ erro: 'Erro ao atualizar jogador.' });
  }
});

// Excluir jogador
router.delete('/:id', async (req, res) => {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  try {
    await prisma.jogador.delete({ where: { id } });

    res.json({ mensagem: 'Jogador excluído com sucesso.' });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ erro: 'Jogador não encontrado.' });
    }

    console.error('Erro ao excluir jogador:', e);
    res.status(500).json({ erro: 'Erro ao excluir jogador.' });
  }
});

module.exports = router;

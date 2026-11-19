// Perfil do usuário logado (rotas protegidas por token JWT)
const express = require('express');
const usuarioModel = require('../models/usuarioModel');

const router = express.Router();

// GET /usuarios/perfil
router.get('/perfil', async (req, res) => {
  try {
    const usuario = await usuarioModel.buscarPorId(Number(req.usuario.id));

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

// PUT /usuarios/perfil
router.put('/perfil', async (req, res) => {
  const nome = String(req.body.nome ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();

  if (!nome || !email) {
    return res.status(400).json({ mensagem: 'Nome e e-mail são obrigatórios.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: 'E-mail inválido.' });
  }

  try {
    const usuario = await usuarioModel.atualizarPerfil(
      Number(req.usuario.id),
      { nome, email }
    );

    res.json(usuario);
  } catch (erro) {
    if (erro.code === 'P2002') {
      return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
    }

    if (erro.code === 'P2025') {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    console.error('Erro ao atualizar perfil:', erro.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

module.exports = router;

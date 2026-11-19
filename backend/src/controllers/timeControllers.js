const prisma = require('../config/prisma');

const CATEGORIAS = ['Masculino', 'Feminino', 'Misto'];

const CAMPOS = {
  id: true,
  nome: true,
  cidade: true,
  categoria: true,
  tecnico: true,
  email: true,
  telefone: true
};

// Texto opcional: vazio vira null; undefined significa "não veio no corpo"
function textoOpcional(valor) {
  if (valor === undefined) return undefined;
  const texto = String(valor ?? '').trim();
  return texto === '' ? null : texto;
}

function validar(body) {
  const nome = String(body.nome ?? '').trim();
  const cidade = String(body.cidade ?? '').trim();
  const categoria = body.categoria;

  if (!nome) return { erro: 'Informe o nome do time.' };
  if (!cidade) return { erro: 'Informe a cidade.' };
  if (!CATEGORIAS.includes(categoria)) {
    return { erro: 'Categoria inválida.' };
  }

  const dados = { nome, cidade, categoria };

  for (const campo of ['tecnico', 'email', 'telefone']) {
    const valor = textoOpcional(body[campo]);
    if (valor !== undefined) dados[campo] = valor;
  }

  return { dados };
}

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /times
async function listar(req, res) {
  try {
    const times = await prisma.time.findMany({
      select: CAMPOS,
      orderBy: { nome: 'asc' }
    });

    res.json(times);
  } catch (e) {
    console.error('Erro ao listar times:', e);
    res.status(500).json({ mensagem: 'Erro ao listar os times.' });
  }
}

// POST /times
async function criar(req, res) {
  const { erro, dados } = validar(req.body);

  if (erro) {
    return res.status(400).json({ mensagem: erro });
  }

  try {
    const time = await prisma.time.create({ data: dados, select: CAMPOS });

    res.status(201).json(time);
  } catch (e) {
    console.error('Erro ao criar time:', e);
    res.status(500).json({ mensagem: 'Erro ao criar o time.' });
  }
}

// PUT /times/:id
async function atualizar(req, res) {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ mensagem: 'Time inválido.' });
  }

  const { erro, dados } = validar(req.body);

  if (erro) {
    return res.status(400).json({ mensagem: erro });
  }

  try {
    const time = await prisma.time.update({
      where: { id },
      data: dados,
      select: CAMPOS
    });

    res.json(time);
  } catch (e) {
    // P2025 = registro não encontrado
    if (e.code === 'P2025') {
      return res.status(404).json({ mensagem: 'Time não encontrado.' });
    }

    console.error('Erro ao atualizar time:', e);
    res.status(500).json({ mensagem: 'Erro ao atualizar o time.' });
  }
}

// DELETE /times/:id
async function excluir(req, res) {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ mensagem: 'Time inválido.' });
  }

  try {
    await prisma.time.delete({ where: { id } });

    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ mensagem: 'Time não encontrado.' });
    }

    console.error('Erro ao excluir time:', e);
    res.status(500).json({ mensagem: 'Erro ao excluir o time.' });
  }
}

module.exports = { listar, criar, atualizar, excluir };

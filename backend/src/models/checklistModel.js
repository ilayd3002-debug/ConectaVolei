const prisma = require('../config/prisma');

const CAMPOS = { id: true, descricao: true, concluido: true };

async function listarItensPorPartida(partidaId) {
  return prisma.checklistItem.findMany({
    where: { partida_id: partidaId },
    select: CAMPOS,
    orderBy: { id: 'asc' }
  });
}

async function criarItem(partidaId, descricao) {
  return prisma.checklistItem.create({
    data: { partida_id: partidaId, descricao },
    select: { ...CAMPOS, partida_id: true }
  });
}

// Retorna null se o item não existir
async function atualizarItem(id, concluido) {
  const { count } = await prisma.checklistItem.updateMany({
    where: { id },
    data: { concluido }
  });

  if (count === 0) return null;

  return prisma.checklistItem.findUnique({
    where: { id },
    select: { ...CAMPOS, partida_id: true }
  });
}

async function excluirItem(id) {
  await prisma.checklistItem.deleteMany({ where: { id } });
}

module.exports = {
  listarItensPorPartida,
  criarItem,
  atualizarItem,
  excluirItem
};

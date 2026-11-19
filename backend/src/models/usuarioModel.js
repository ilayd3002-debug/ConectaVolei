const prisma = require('../config/prisma');

const UMA_HORA = 60 * 60 * 1000;

// Buscar usuário pelo e-mail (retorna também o hash da senha, usado no login)
async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function buscarPorId(id) {
  return prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true }
  });
}

// Criar usuário
async function criar({ nome, email, senhaHash }) {
  return prisma.usuario.create({
    data: { nome, email, senha: senhaHash },
    select: { id: true, nome: true, email: true, criado_em: true }
  });
}

// Atualizar nome e e-mail do perfil
async function atualizarPerfil(id, { nome, email }) {
  return prisma.usuario.update({
    where: { id },
    data: { nome, email },
    select: { id: true, nome: true, email: true }
  });
}

// ===== Recuperação de senha =====

// Salva o hash do token com validade de uma hora.
async function salvarTokenReset(id, tokenHash) {
  await prisma.usuario.update({
    where: { id },
    data: {
      reset_token: tokenHash,
      reset_expira: new Date(Date.now() + UMA_HORA)
    }
  });
}

// Busca o usuário somente se o token existir e não estiver expirado.
async function buscarPorTokenReset(tokenHash) {
  return prisma.usuario.findFirst({
    where: {
      reset_token: tokenHash,
      reset_expira: { gt: new Date() }
    },
    select: { id: true, nome: true, email: true }
  });
}

// Troca a senha e invalida o token utilizado.
async function atualizarSenha(id, senhaHash) {
  await prisma.usuario.update({
    where: { id },
    data: { senha: senhaHash, reset_token: null, reset_expira: null }
  });
}

// Limpa o token se o envio do e-mail falhar.
async function limparTokenReset(id) {
  await prisma.usuario.update({
    where: { id },
    data: { reset_token: null, reset_expira: null }
  });
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  criar,
  atualizarPerfil,
  salvarTokenReset,
  buscarPorTokenReset,
  atualizarSenha,
  limparTokenReset
};

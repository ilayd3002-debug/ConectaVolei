require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Uma única instância do cliente em todo o projeto.
const globalRef = globalThis;

const prisma = globalRef.__prismaConecta || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalRef.__prismaConecta = prisma;
}

module.exports = prisma;

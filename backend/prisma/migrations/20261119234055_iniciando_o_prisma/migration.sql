-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "reset_token" TEXT,
    "reset_expira" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "times" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Masculino',
    "tecnico" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "jogadores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "data_nascimento" TEXT,
    "posicao" TEXT,
    "numero_camisa" INTEGER,
    "altura" REAL,
    "time" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "campeonatos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "data_inicio" TEXT NOT NULL,
    "data_fim" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "max_equipes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planejado',
    "regulamento" TEXT,
    "publico" BOOLEAN NOT NULL DEFAULT true,
    "criador_id" INTEGER,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campeonatos_criador_id_fkey" FOREIGN KEY ("criador_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time_a" TEXT NOT NULL,
    "time_b" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "tipo" TEXT,
    "categoria" TEXT,
    "modalidade" TEXT,
    "campeonato_id" INTEGER,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partidas_campeonato_id_fkey" FOREIGN KEY ("campeonato_id") REFERENCES "campeonatos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_itens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partida_id" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "checklist_itens_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "jogadores_email_key" ON "jogadores"("email");

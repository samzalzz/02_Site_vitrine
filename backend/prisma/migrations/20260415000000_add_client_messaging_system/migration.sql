-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "phone" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "canLogin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_projects" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "timeline" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'prospect',
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "adminId" TEXT,
    "clientId" TEXT,
    "senderType" VARCHAR(20) NOT NULL,
    "senderName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" VARCHAR(500) NOT NULL,
    "originalName" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "client_projects_clientId_idx" ON "client_projects"("clientId");

-- CreateIndex
CREATE INDEX "messages_projectId_idx" ON "messages"("projectId");

-- CreateIndex
CREATE INDEX "messages_clientId_idx" ON "messages"("clientId");

-- CreateIndex
CREATE INDEX "messages_adminId_idx" ON "messages"("adminId");

-- AddForeignKey
ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "client_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

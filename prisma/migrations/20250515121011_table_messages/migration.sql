-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'VIDEO', 'IMAGE', 'FILE', 'AUDIO');

-- CreateTable
CREATE TABLE "Messages" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "filename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replyMessageId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nickname" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "nickName1" TEXT,
    "nickName2" TEXT,
    "userId" INTEGER,

    CONSTRAINT "Nickname_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nickname_user1Id_user2Id_key" ON "Nickname"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_replyMessageId_fkey" FOREIGN KEY ("replyMessageId") REFERENCES "Messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nickname" ADD CONSTRAINT "Nickname_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nickname" ADD CONSTRAINT "Nickname_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nickname" ADD CONSTRAINT "Nickname_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

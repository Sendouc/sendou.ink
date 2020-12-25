-- CreateEnum
CREATE TYPE "VoiceChatStatus" AS ENUM ('YES', 'NO', 'MAYBE');

-- CreateEnum
CREATE TYPE "Playstyle" AS ENUM ('FRONTLINE', 'MIDLINE', 'BACKLINE');

-- CreateTable
CREATE TABLE "FreeAgentPost" (
"id" SERIAL,
    "playstyles" "Playstyle"[],
    "canVC" "VoiceChatStatus" NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LikedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FreeAgentPost.userId_unique" ON "FreeAgentPost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_LikedPosts_AB_unique" ON "_LikedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_LikedPosts_B_index" ON "_LikedPosts"("B");

-- AddForeignKey
ALTER TABLE "FreeAgentPost" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedPosts" ADD FOREIGN KEY("A")REFERENCES "FreeAgentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedPosts" ADD FOREIGN KEY("B")REFERENCES "FreeAgentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamId" INTEGER;

-- CreateTable
CREATE TABLE "Team" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "nameForUrl" TEXT NOT NULL,
    "twitterName" TEXT,
    "bio" TEXT,
    "recruitingPost" TEXT,
    "inviteCode" TEXT NOT NULL,
    "captainId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team.nameForUrl_unique" ON "Team"("nameForUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Team.inviteCode_unique" ON "Team"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Team.captainId_unique" ON "Team"("captainId");

-- AddForeignKey
ALTER TABLE "Team" ADD FOREIGN KEY("captainId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY("teamId")REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

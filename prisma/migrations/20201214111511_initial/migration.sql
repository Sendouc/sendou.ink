-- CreateEnum
CREATE TYPE "public"."RankedMode" AS ENUM ('SZ', 'TC', 'RM', 'CB');

-- CreateEnum
CREATE TYPE "public"."Mode" AS ENUM ('TW', 'SZ', 'TC', 'RM', 'CB');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('EU', 'NA', 'JP');

-- CreateEnum
CREATE TYPE "public"."LeagueType" AS ENUM ('TWIN', 'QUAD');

-- CreateEnum
CREATE TYPE "public"."Ability" AS ENUM ('CB', 'LDE', 'OG', 'T', 'H', 'NS', 'TI', 'RP', 'AD', 'DR', 'SJ', 'OS', 'BDU', 'REC', 'RES', 'ISM', 'ISS', 'MPU', 'QR', 'QSJ', 'RSU', 'SSU', 'SCU', 'SPU', 'SS', 'BRU');

-- CreateTable
CREATE TABLE "User" (
"id" SERIAL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordAvatar" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "twitterName" TEXT,
    "twitchName" TEXT,
    "youtubeId" TEXT,
    "country" TEXT,
    "sensMotion" DECIMAL(65,30),
    "sensStick" DECIMAL(65,30),
    "bio" TEXT,
    "weaponPool" TEXT[],
    "customUrlPath" TEXT,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "XRankPlacement" (
"id" SERIAL,
    "switchAccountId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "ranking" INTEGER NOT NULL,
    "xPower" DECIMAL(65,30) NOT NULL,
    "weapon" TEXT NOT NULL,
    "mode" "RankedMode" NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSquad" (
"id" SERIAL,
    "region" "Region" NOT NULL,
    "type" "LeagueType" NOT NULL,
    "leaguePower" DECIMAL(65,30) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSquadMember" (
    "squadId" INTEGER NOT NULL,
    "switchAccountId" TEXT NOT NULL,
    "weapon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "switchAccountId" TEXT NOT NULL,
    "userId" INTEGER,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Build" (
"id" SERIAL,
    "userId" INTEGER NOT NULL,
    "weapon" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "modes" "Mode"[],
    "headGear" TEXT,
    "headAbilities" "Ability"[],
    "clothingGear" TEXT,
    "clothingAbilities" "Ability"[],
    "shoesGear" TEXT,
    "shoesAbilities" "Ability"[],
    "abilityPoints" JSONB NOT NULL,
    "top500" BOOLEAN NOT NULL,
    "jpn" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.discordId_unique" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile.customUrlPath_unique" ON "Profile"("customUrlPath");

-- CreateIndex
CREATE UNIQUE INDEX "Profile.userId_unique" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XRankPlacement.switchAccountId_mode_month_year_unique" ON "XRankPlacement"("switchAccountId", "mode", "month", "year");

-- CreateIndex
CREATE INDEX "LeagueSquad.leaguePower_type_region_index" ON "LeagueSquad"("leaguePower", "type", "region");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSquadMember.squadId_switchAccountId_unique" ON "LeagueSquadMember"("squadId", "switchAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Player.switchAccountId_unique" ON "Player"("switchAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Player.userId_unique" ON "Player"("userId");

-- CreateIndex
CREATE INDEX "Build.weapon_index" ON "Build"("weapon");

-- CreateIndex
CREATE INDEX "Build.userId_index" ON "Build"("userId");

-- CreateIndex
CREATE INDEX "Build.abilityPoints_index" ON "Build"("abilityPoints");

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XRankPlacement" ADD FOREIGN KEY("switchAccountId")REFERENCES "Player"("switchAccountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSquadMember" ADD FOREIGN KEY("squadId")REFERENCES "LeagueSquad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSquadMember" ADD FOREIGN KEY("switchAccountId")REFERENCES "Player"("switchAccountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

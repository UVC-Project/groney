-- CreateEnum
CREATE TYPE "DecorationType" AS ENUM ('BUILDING', 'PAVEMENT', 'PARKING', 'FENCE', 'ENTRANCE', 'BENCH', 'TRASH_BIN', 'BIKE_RACK');

-- CreateTable
CREATE TABLE "map_decorations" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "type" "DecorationType" NOT NULL,
    "gridX" INTEGER NOT NULL,
    "gridY" INTEGER NOT NULL,
    "gridWidth" INTEGER NOT NULL DEFAULT 2,
    "gridHeight" INTEGER NOT NULL DEFAULT 2,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "map_decorations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "map_decorations_classId_idx" ON "map_decorations"("classId");

-- AddForeignKey
ALTER TABLE "map_decorations" ADD CONSTRAINT "map_decorations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

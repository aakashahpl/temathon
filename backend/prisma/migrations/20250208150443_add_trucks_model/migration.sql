-- CreateTable
CREATE TABLE "Trucks" (
    "id" SERIAL NOT NULL,
    "truck_id" INTEGER NOT NULL,
    "truck_number" TEXT NOT NULL,
    "route_geometry" JSONB NOT NULL,
    "current_location" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "assigned_colony" TEXT NOT NULL,
    "route_distance" DOUBLE PRECISION NOT NULL,
    "route_duration" INTEGER NOT NULL,
    "dustbin_ids" JSONB NOT NULL,

    CONSTRAINT "Trucks_pkey" PRIMARY KEY ("id")
);

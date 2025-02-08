// routes/trucks.js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/trucks/:id - fetch a single truck by truck_id
router.get("/getTruck/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Assuming 'truck_id' is unique (or adjust if your primary key is different)
    const truck = await prisma.trucks.findUnique({
      where: { id: Number(id) },
    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found." });
    }

    res.status(200).json({
      message: "Truck fetched successfully.",
      data: truck,
    });
  } catch (error) {
    console.error("Error fetching truck:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Existing POST /assign route (if needed)
router.post("/assign", async (req, res) => {
  try {
    const {
      truck_id,
      truck_number,
      route_geometry,
      current_location,
      status,
      assigned_colony,
      route_distance,
      route_duration,
      dustbin_ids,
    } = req.body;

    if (!truck_id || !truck_number || !route_geometry || !current_location) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    console.log("trucks assigned success");

    const newTruck = await prisma.trucks.create({
      data: {
        truck_id,
        truck_number,
        route_geometry,
        current_location,
        status,
        assigned_colony,
        route_distance,
        route_duration,
        dustbin_ids,
      },
    });

    res.status(201).json({
      message: "Truck assigned successfully.",
      data: newTruck,
    });
  } catch (error) {
    console.error("Error assigning truck:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;

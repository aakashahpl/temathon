import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getAllBins = async (req: Request, res: Response) => {
  try {
    const bins = await prisma.dustbins.findMany();
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const requestPickup = async (req: Request, res: Response) => {
  const { binId } = req.body;
  if (!binId) return res.status(400).json({ error: "Missing binId" });

  try {
    const bin = await prisma.dustbins.findUnique({ where: { id: binId } });

    if (!bin) return res.status(404).json({ error: "Bin not found" });

    const today = new Date();
    const defaultPickup = new Date(bin.scheduledPickupDate);
    const oneDayBefore = new Date(defaultPickup);
    oneDayBefore.setDate(defaultPickup.getDate() - 1);

    if (today > oneDayBefore) {
      return res.status(400).json({ error: "Cannot request on this date" });
    }

    const updatedBin = await prisma.dustbins.update({
      where: { id: binId },
      data: { pickupStatus: 1 },
    });

    res.json({ message: "Pickup request sent", bin: updatedBin });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const approvePickup = async (req: Request, res: Response) => {
  const { binId } = req.params;
  try {
    const bin = await prisma.dustbins.findUnique({ where: { id: Number(binId) } });

    if (!bin || bin.pickupStatus !== 1)
      return res.status(400).json({ error: "No pending request" });

    const updatedBin = await prisma.dustbins.update({
      where: { id: Number(binId) },
      data: { pickupStatus: 2 },
    });

    res.json({ message: "Pickup approved", bin: updatedBin });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const cancelPickup = async (req: Request, res: Response) => {
  const { binId } = req.params;
  try {
    const bin = await prisma.dustbins.findUnique({ where: { id: Number(binId) } });

    if (!bin) return res.status(404).json({ error: "Bin not found" });

    const updatedBin = await prisma.dustbins.update({
      where: { id: Number(binId) },
      data: { pickupStatus: 0 },
    });

    res.json({ message: "Pickup canceled", bin: updatedBin });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

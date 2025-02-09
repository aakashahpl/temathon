import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const fetchDustbins = async (req: Request, res: Response) => {
    try {
        // Fetch all dustbins from the database
        const dustbins = await prisma.dustbins.findMany();

        return res.status(200).json({ 
            message: 'Dustbins fetched successfully.', 
            data: dustbins 
        });
    } 
    catch (error) {
        console.error('Error fetching dustbins:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    } 
};


export const getFirstDustbin = async (req: Request, res: Response) => {
  try {
    const dustbin = await prisma.dustbins.findUnique({
      where: { id: 7 }, // Hardcoded to fetch the first row
    });

    if (!dustbin) {
      return res.status(404).json({ message: "Dustbin not found" });
    }

    res.json(dustbin);
  } catch (error) {
    console.error("Error fetching dustbin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePickupStatus = async (req: Request, res: Response) => {
  try {
    console.log("Received request body:", req.body);
    const { action } = req.body; // "schedule" or "cancel"
    
    // Fetch the dustbin entry with ID 1 (can adjust later to dynamic IDs)
    const dustbin = await prisma.dustbins.findUnique({ where: { id: 7 } });
    
    if (!dustbin) return res.status(404).json({ error: "Dustbin not found" });

    let newPickupStatus = dustbin.pickupStatus; // Keep existing value initially
    let newCollectionTime = dustbin.scheduledPickupDate; // Keep existing value initially
    let newTotalWaste = dustbin.totalWaste;
    if (action === "schedule") {

   

      newPickupStatus = 1;
      newCollectionTime = new Date();
      newCollectionTime.setDate(newCollectionTime.getDate() + 1); 
        newTotalWaste= 60;

    } else if (action === "cancel") {
      // If action is cancel, we reset pickup status and revert the scheduled pickup date
      if (newPickupStatus === 0) {
        return res.status(400).json({ error: "No scheduled pickup to cancel" });
      }

      newPickupStatus = 0;
      newCollectionTime = new Date(dustbin.scheduledPickupDate);  
      newCollectionTime.setDate(newCollectionTime.getDate() + 1);
      newTotalWaste = 30;
    }

    // Update the dustbin data with the new pickup status and date
    const updatedDustbin = await prisma.dustbins.update({
      where: { id: 7 }, // Updating dustbin with ID 1
      data: {totalWaste:newTotalWaste,  pickupStatus: newPickupStatus, scheduledPickupDate: newCollectionTime },
    });

    res.json({ message: "Pickup status updated", dustbin: updatedDustbin });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update pickup status" });
  }
};

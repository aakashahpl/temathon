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

export const fetchMany = async (req: Request, res: Response) => {
    try {
      const { dustbin_ids } = req.body;
  
      if (!dustbin_ids || !Array.isArray(dustbin_ids) || dustbin_ids.length === 0) {
        return res.status(400).json({ message: "Invalid or missing dustbin_ids array." });
      }

      console.log(dustbin_ids);
  
      // Fetch dustbins with the provided IDs
      const dustbins = await prisma.dustbins.findMany({
        where: {
          id: {
            in: dustbin_ids,
          },
        },
      });
  
      if (dustbins.length === 0) {
        return res.status(404).json({ message: "No dustbins found for the given IDs." });
      }
  
      return res.status(200).json({
        message: "Dustbins fetched successfully.",
        data: dustbins,
      });
    } catch (error) {
      console.error("Error fetching dustbins:", error);
      return res.status(500).json({ message: "Server error. Please try again later." });
    }
  };


  export const emptyDustbin = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Convert id to a number if needed
      const dustbinId = Number(id);
  
      // Update the dustbin in the database, e.g.:
      // Set bioFillLevel, nonBioFillLevel, and totalWaste to 0.
      // Or, do any other logic you need for "emptying" the dustbin.
      const updatedDustbin = await prisma.dustbins.update({
        where: { id: dustbinId },
        data: {
          bioFillLevel: 0,
          nonBioFillLevel: 0,
          totalWaste: 0,
          // Possibly also update any 'status' field if you have it
          // status: "emptied",
        },
      });
  
      return res.status(200).json({
        message: "Dustbin emptied successfully.",
        data: updatedDustbin,
      });
    } catch (error) {
      console.error("Error emptying dustbin:", error);
      return res.status(500).json({
        error: "Internal server error while emptying dustbin",
      });
    }
  };
  export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const pendingRequests = await prisma.dustbins.findMany({
      where: { pickupStatus: 1 }, 
    });

    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

export const approvePickupRequest = async (req: Request, res: Response) => {
  try {
    const { dustbinId } = req.body;
    

    if (!dustbinId) {
      return res.status(400).json({ error: "Dustbin ID is required" });
    }

    // Find the dustbin
    const dustbin = await prisma.dustbins.findUnique({
      where: { id: dustbinId },
    });

    if (!dustbin) {
      return res.status(404).json({ error: "Dustbin not found" });
    }

    if (dustbin.pickupStatus !== 1) {
      return res.status(400).json({ error: "Request is not in pending state" });
    }

    // Approve the pickup request (set pickupStatus to 2)
    const updatedDustbin = await prisma.dustbins.update({
      where: { id: dustbinId },
      data: { pickupStatus: 2 },
    });

    return res.json({ message: "Pickup approved successfully", dustbin: updatedDustbin });
  } catch (error) {
    console.error("Error approving pickup:", error);
    return res.status(500).json({ error: "Failed to approve pickup request" });
  }
};

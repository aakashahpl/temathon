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
      where: { id: 1 }, // Hardcoded to fetch the first row
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
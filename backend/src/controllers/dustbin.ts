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

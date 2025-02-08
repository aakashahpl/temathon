import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTruck = async (req: Request, res: Response) => {
    try {
        // Extract truck data from request body
        const {
            truck_id,
            truck_number,
            route_geometry,
            current_location,
            status,
            assigned_colony,
            route_distance,
            route_duration,
            dustbin_ids
        } = req.body;

        // Create a new truck entry in the database
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
            }
        });

        // Send response with the created truck
        return res.status(201).json({ 
            message: 'Truck created successfully.', 
            data: newTruck 
        });
    } 
    catch (error) {
        console.error('Error creating truck:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    } 
};

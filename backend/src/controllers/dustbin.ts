import { Request, Response } from 'express';



export const fetchDustbins = async (req: Request, res: Response) => {

    try {




        return res.status(201).json({ message: 'Slot booked successfully.' });
    }
    catch (error) {
        console.error('Error booking slot:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};







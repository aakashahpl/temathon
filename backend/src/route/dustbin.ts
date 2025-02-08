import { Router, Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import {bookSlot,freeSlots, speakerBookings} from '../controllers/dustbin';

const router = Router();

router.post('/add',verifyRole(['user']),bookSlot);



export default router;

import { Router, Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import {fetchDustbins} from '../controllers/dustbin';

const router = Router();

// router.post('/add',verifyRole(['user']),bookSlot);
router.post('/getAll',fetchDustbins);



export default router;

import { Router, Request, Response } from 'express';
import { fetchDustbins } from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);


export default router;

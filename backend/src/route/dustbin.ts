import { Router, Request, Response } from 'express';
import { fetchDustbins, getFirstDustbin } from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);

router.get("/first", getFirstDustbin);

export default router;

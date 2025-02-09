import { Router, Request, Response } from 'express';
import { fetchDustbins, getFirstDustbin, updatePickupStatus } from '../controllers/dustbin';
import {  fetchMany} from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);

router.post('/fetchMany',fetchMany);

router.get("/first", getFirstDustbin);
router.post("/pickup", updatePickupStatus);
export default router;

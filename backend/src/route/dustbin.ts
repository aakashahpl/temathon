import { Router, Request, Response } from 'express';
import { approvePickupRequest, fetchDustbins, getFirstDustbin, getPendingRequests, updatePickupStatus } from '../controllers/dustbin';
import {  fetchMany} from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);

router.post('/fetchMany',fetchMany);

router.get("/first", getFirstDustbin);
router.post("/pickup", updatePickupStatus);
router.get('/pending-requests', getPendingRequests);

router.post('/approve-pickup',approvePickupRequest);
export default router;

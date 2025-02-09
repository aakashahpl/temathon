import { Router, Request, Response } from 'express';
import { fetchDustbins, getFirstDustbin ,fetchMany,emptyDustbin} from '../controllers/dustbin';
import { approvePickupRequest, getPendingRequests, updatePickupStatus } from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);

router.post('/fetchMany',fetchMany);

router.get("/first", getFirstDustbin);
router.get("/empty-dustbin/:id", emptyDustbin);
router.post("/pickup", updatePickupStatus);
router.get('/pending-requests', getPendingRequests);

router.post('/approve-pickup',approvePickupRequest);
export default router;

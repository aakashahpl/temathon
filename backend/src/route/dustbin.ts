import { Router, Request, Response } from 'express';
import { fetchDustbins, getFirstDustbin ,fetchMany,emptyDustbin} from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);

router.post('/fetchMany',fetchMany);

router.get("/first", getFirstDustbin);
router.get("/empty-dustbin/:id", emptyDustbin);

export default router;

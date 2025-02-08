import { Router, Request, Response } from 'express';
import { fetchDustbins, getFirstDustbin ,fetchMany} from '../controllers/dustbin';

const router = Router();


router.get('/fetchAll',fetchDustbins);

router.post('/fetchMany',fetchMany);

router.get("/first", getFirstDustbin);

export default router;

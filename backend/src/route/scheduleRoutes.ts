import express from "express";
import {
  getAllBins,
  requestPickup,
  approvePickup,
  cancelPickup,
} from "../controllers/scheduleController";

const router = express.Router();

router.get("/", getAllBins); // ✅ Get all bins with pickup status
router.post("/request", requestPickup); // ✅ Request a pickup
router.put("/approve/:binId", approvePickup); // ✅ Approve pickup (Admin)
router.put("/cancel/:binId", cancelPickup); // ✅ Cancel pickup

export default router;

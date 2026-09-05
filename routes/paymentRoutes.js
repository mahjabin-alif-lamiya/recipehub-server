import express from "express";
import {
  createCheckoutSession,
  getMyPayments,
  getAllPayments,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.get("/my", verifyToken, getMyPayments);
router.get("/", verifyToken, verifyAdmin, getAllPayments);

export default router;
import express from "express";
import { updateProfile, getMyStats } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
router.patch("/profile", updateProfile);
router.get("/stats", getMyStats);

export default router;
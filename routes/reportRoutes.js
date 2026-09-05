import express from "express";
import { createReport, getAllReports, resolveReport } from "../controllers/reportController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.post("/", verifyToken, createReport);
router.get("/", verifyToken, verifyAdmin, getAllReports);
router.patch("/:id", verifyToken, verifyAdmin, resolveReport);

export default router;
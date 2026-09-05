import express from "express";
import { addFavorite, removeFavorite, getMyFavorites } from "../controllers/favoriteController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
router.post("/", addFavorite);
router.delete("/:recipeId", removeFavorite);
router.get("/my", getMyFavorites);

export default router;
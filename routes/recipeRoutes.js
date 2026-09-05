import express from "express";
import {
  getRecipes,
  getFeaturedRecipes,
  getPopularRecipes,
  getMyRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
} from "../controllers/recipeController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public
router.get("/", getRecipes);
router.get("/featured", getFeaturedRecipes);
router.get("/popular", getPopularRecipes);

// Protected — must come before the "/:id" catch-all route
router.get("/my", verifyToken, getMyRecipes);
router.post("/", verifyToken, createRecipe);

router.get("/:id", getRecipeById);
router.put("/:id", verifyToken, updateRecipe);
router.delete("/:id", verifyToken, deleteRecipe);
router.patch("/:id/like", verifyToken, likeRecipe);

export default router;
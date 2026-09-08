import express from "express";
import {
  getAllUsers,
  blockUser,
  unblockUser,
  getAllRecipesAdmin,
  deleteRecipeAdmin,
  featureRecipe,
  updateRecipeAdmin,
  getAdminStats,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.get("/recipes", getAllRecipesAdmin);
router.put("/recipes/:id", updateRecipeAdmin);
router.delete("/recipes/:id", deleteRecipeAdmin);
router.patch("/recipes/:id/feature", featureRecipe);

export default router;
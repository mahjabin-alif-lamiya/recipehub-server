import { ObjectId } from "mongodb";
import { getCollections } from "../config/db.js";

export async function addFavorite(req, res, next) {
  try {
    const { favorites } = getCollections();
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "recipeId is required." });
    }

    const existing = await favorites.findOne({ recipeId, userId: req.user.id });
    if (existing) {
      return res.status(409).json({ message: "Recipe is already in your favorites." });
    }

    await favorites.insertOne({
      userId: req.user.id,
      userEmail: req.user.email,
      recipeId,
      addedAt: new Date(),
    });

    res.status(201).json({ message: "Added to favorites." });
  } catch (error) {
    next(error);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const { favorites } = getCollections();
    await favorites.deleteOne({ recipeId: req.params.recipeId, userId: req.user.id });
    res.status(200).json({ message: "Removed from favorites." });
  } catch (error) {
    next(error);
  }
}

export async function getMyFavorites(req, res, next) {
  try {
    const { favorites, recipes } = getCollections();
    const favoriteDocs = await favorites.find({ userId: req.user.id }).toArray();

    const recipeIds = favoriteDocs.map((fav) => new ObjectId(fav.recipeId));
    const favoriteRecipes = await recipes.find({ _id: { $in: recipeIds } }).toArray();

    res.status(200).json({ recipes: favoriteRecipes });
  } catch (error) {
    next(error);
  }
}
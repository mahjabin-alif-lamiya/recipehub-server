import { ObjectId } from "mongodb";
import { getCollections } from "../config/db.js";

export async function updateProfile(req, res, next) {
  try {
    const { users } = getCollections();
    const { name, image } = req.body;

    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name, image, updatedAt: new Date() } }
    );

    const updated = await users.findOne({ _id: new ObjectId(req.user.id) });
    res.status(200).json({
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        role: updated.role,
        isPremium: updated.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyStats(req, res, next) {
  try {
    const { recipes, favorites } = getCollections();

    const myRecipes = await recipes.find({ authorId: req.user.id }).toArray();
    const totalLikes = myRecipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);
    const totalFavorites = await favorites.countDocuments({ userId: req.user.id });

    res.status(200).json({
      totalRecipes: myRecipes.length,
      totalFavorites,
      totalLikesReceived: totalLikes,
    });
  } catch (error) {
    next(error);
  }
}
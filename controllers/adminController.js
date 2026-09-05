import { ObjectId } from "mongodb";
import { getCollections } from "../config/db.js";

export async function getAllUsers(req, res, next) {
  try {
    const { users } = getCollections();
    const items = await users
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ users: items });
  } catch (error) {
    next(error);
  }
}

export async function blockUser(req, res, next) {
  try {
    const { users } = getCollections();
    await users.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isBlocked: true } });
    res.status(200).json({ message: "User blocked." });
  } catch (error) {
    next(error);
  }
}

export async function unblockUser(req, res, next) {
  try {
    const { users } = getCollections();
    await users.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isBlocked: false } });
    res.status(200).json({ message: "User unblocked." });
  } catch (error) {
    next(error);
  }
}

export async function getAllRecipesAdmin(req, res, next) {
  try {
    const { recipes } = getCollections();
    const items = await recipes.find().sort({ createdAt: -1 }).toArray();
    res.status(200).json({ recipes: items });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecipeAdmin(req, res, next) {
  try {
    const { recipes } = getCollections();
    await recipes.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ message: "Recipe deleted." });
  } catch (error) {
    next(error);
  }
}

export async function featureRecipe(req, res, next) {
  try {
    const { recipes } = getCollections();
    const { isFeatured } = req.body;
    await recipes.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isFeatured: Boolean(isFeatured) } }
    );
    res.status(200).json({ message: isFeatured ? "Recipe featured." : "Recipe unfeatured." });
  } catch (error) {
    next(error);
  }
}

export async function getAdminStats(req, res, next) {
  try {
    const { users, recipes, reports } = getCollections();

    const [totalUsers, totalRecipes, totalPremium, totalReports] = await Promise.all([
      users.countDocuments(),
      recipes.countDocuments(),
      users.countDocuments({ isPremium: true }),
      reports.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({ totalUsers, totalRecipes, totalPremium, totalReports });
  } catch (error) {
    next(error);
  }
}
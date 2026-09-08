import { ObjectId } from "mongodb";
import { getCollections } from "../config/db.js";

const FREE_RECIPE_LIMIT = 2;

// GET /api/recipes  — server-side pagination + category filter ($in) + search
export async function getRecipes(req, res, next) {
  try {
    const { recipes } = getCollections();

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 9, 1);
    const skip = (page - 1) * limit;

    const query = { status: { $ne: "removed" } };

    if (req.query.categories) {
      const categoryList = req.query.categories.split(",").filter(Boolean);
      if (categoryList.length > 0) {
        query.category = { $in: categoryList };
      }
    }

    if (req.query.search) {
      query.recipeName = { $regex: req.query.search, $options: "i" };
    }

    const [items, total] = await Promise.all([
      recipes.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      recipes.countDocuments(query),
    ]);

    res.status(200).json({
      recipes: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedRecipes(req, res, next) {
  try {
    const { recipes } = getCollections();
    const items = await recipes
      .find({ isFeatured: true, status: { $ne: "removed" } })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    res.status(200).json({ recipes: items });
  } catch (error) {
    next(error);
  }
}

export async function getPopularRecipes(req, res, next) {
  try {
    const { recipes } = getCollections();
    const items = await recipes
      .find({ status: { $ne: "removed" } })
      .sort({ likesCount: -1 })
      .limit(6)
      .toArray();
    res.status(200).json({ recipes: items });
  } catch (error) {
    next(error);
  }
}

export async function getMyRecipes(req, res, next) {
  try {
    const { recipes } = getCollections();
    const items = await recipes
      .find({ authorId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ recipes: items });
  } catch (error) {
    next(error);
  }
}

export async function getRecipeById(req, res, next) {
  try {
    const { recipes } = getCollections();
    const recipe = await recipes.findOne({ _id: new ObjectId(req.params.id) });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.status(200).json({ recipe });
  } catch (error) {
    next(error);
  }
}

export async function createRecipe(req, res, next) {
  try {
    const { users, recipes } = getCollections();
    const author = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!author.isPremium) {
      const ownedCount = await recipes.countDocuments({ authorId: req.user.id });
      if (ownedCount >= FREE_RECIPE_LIMIT) {
        return res.status(403).json({
          message: `Free accounts can add up to ${FREE_RECIPE_LIMIT} recipes. Become a premium member for unlimited recipes.`,
        });
      }
    }

    const {
      recipeName,
      recipeImage,
      category,
      cuisineType,
      difficultyLevel,
      preparationTime,
      ingredients,
      instructions,
    } = req.body;

    if (!recipeName || !category || !cuisineType || !ingredients || !instructions) {
      return res.status(400).json({ message: "Please fill in all required recipe fields." });
    }

    const newRecipe = {
      recipeName,
      recipeImage: recipeImage || "",
      category,
      cuisineType,
      difficultyLevel: difficultyLevel || "Easy",
      preparationTime: preparationTime || "",
      ingredients,
      instructions,
      authorId: req.user.id,
      authorName: author.name,
      authorEmail: author.email,
      likesCount: 0,
      isFeatured: false,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await recipes.insertOne(newRecipe);
    res.status(201).json({ recipe: { ...newRecipe, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
}

export async function updateRecipe(req, res, next) {
  try {
    const { recipes } = getCollections();
    const recipe = await recipes.findOne({ _id: new ObjectId(req.params.id) });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own recipes." });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.authorId;
    delete updates.authorEmail;
    delete updates.likesCount;

    await recipes.updateOne({ _id: recipe._id }, { $set: updates });
    const updated = await recipes.findOne({ _id: recipe._id });

    res.status(200).json({ recipe: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecipe(req, res, next) {
  try {
    const { recipes, favorites } = getCollections();
    const recipe = await recipes.findOne({ _id: new ObjectId(req.params.id) });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own recipes." });
    }

    await recipes.deleteOne({ _id: recipe._id });
    await favorites.deleteMany({ recipeId: recipe._id.toString() });

    res.status(200).json({ message: "Recipe deleted." });
  } catch (error) {
    next(error);
  }
}

export async function likeRecipe(req, res, next) {
  try {
    const { recipes } = getCollections();

    // Note: mongodb driver v6 returns the document directly (or null)
    // from findOneAndUpdate — not wrapped in a `.value` property like
    // older versions did.
    const updatedRecipe = await recipes.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $inc: { likesCount: 1 } },
      { returnDocument: "after" }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.status(200).json({ likesCount: updatedRecipe.likesCount });
  } catch (error) {
    next(error);
  }
}
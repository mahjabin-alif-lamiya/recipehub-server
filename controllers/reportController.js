import { ObjectId } from "mongodb";
import { getCollections } from "../config/db.js";

export async function createReport(req, res, next) {
  try {
    const { reports } = getCollections();
    const { recipeId, reason } = req.body;

    if (!recipeId || !reason) {
      return res.status(400).json({ message: "recipeId and reason are required." });
    }

    await reports.insertOne({
      recipeId,
      reporterEmail: req.user.email,
      reason,
      status: "pending",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Report submitted. Our team will review it." });
  } catch (error) {
    next(error);
  }
}

export async function getAllReports(req, res, next) {
  try {
    const { reports } = getCollections();
    const items = await reports.find().sort({ createdAt: -1 }).toArray();
    res.status(200).json({ reports: items });
  } catch (error) {
    next(error);
  }
}

// Admin resolves a report: dismiss it, or remove the reported recipe.
export async function resolveReport(req, res, next) {
  try {
    const { reports, recipes } = getCollections();
    const { action } = req.body; // "dismiss" | "remove"
    const report = await reports.findOne({ _id: new ObjectId(req.params.id) });

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    if (action === "remove") {
      await recipes.updateOne(
        { _id: new ObjectId(report.recipeId) },
        { $set: { status: "removed" } }
      );
      await reports.updateOne({ _id: report._id }, { $set: { status: "resolved" } });
      return res.status(200).json({ message: "Recipe removed and report resolved." });
    }

    await reports.updateOne({ _id: report._id }, { $set: { status: "dismissed" } });
    res.status(200).json({ message: "Report dismissed." });
  } catch (error) {
    next(error);
  }
}
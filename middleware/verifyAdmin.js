import { getCollections } from "../config/db.js";
import { ObjectId } from "mongodb";

// Runs after verifyToken. Confirms the logged-in user's role in the
// database (never trusts the client) before allowing admin routes.
export async function verifyAdmin(req, res, next) {
  try {
    const { users } = getCollections();
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Admin access only." });
    }

    next();
  } catch (error) {
    next(error);
  }
}
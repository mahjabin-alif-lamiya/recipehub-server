// One-time script to create (or promote) the admin account needed
// for assignment submission.
//
// Usage:
//   node scripts/createAdmin.js admin@recipehub.com SomeStrongPass1
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB, getCollections } from "../config/db.js";

async function run() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.log("Usage: node scripts/createAdmin.js <email> <password>");
    process.exit(1);
  }

  await connectDB();
  const { users } = getCollections();

  const existing = await users.findOne({ email });
  if (existing) {
    await users.updateOne({ email }, { $set: { role: "admin", isBlocked: false } });
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({
      name: "RecipeHub Admin",
      email,
      image: "",
      password: hashedPassword,
      role: "admin",
      isBlocked: false,
      isPremium: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Admin account created: ${email}`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
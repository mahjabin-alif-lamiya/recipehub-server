import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from environment variables");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db("recipehub");
  console.log("MongoDB connected: recipehub database");
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected yet. Call connectDB() first.");
  }
  return db;
}

export function getCollections() {
  const database = getDB();
  return {
    users: database.collection("users"),
    recipes: database.collection("recipes"),
    favorites: database.collection("favorites"),
    reports: database.collection("reports"),
    payments: database.collection("payments"),
  };
}
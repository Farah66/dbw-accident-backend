const { MongoClient } = require("mongodb");

let db;

async function connectDB() {
  if (db) return db;

  const client = new MongoClient(process.env.MONGO_URI);

  await client.connect();

  db = client.db("dbw_project");

  console.log("✅ Local MongoDB Connected");

  return db;
}

module.exports = connectDB;
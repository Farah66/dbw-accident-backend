const express = require("express");
const connectDB = require("../db");

const router = express.Router();

router.get("/top", async (req, res) => {
  const db = await connectDB();

  const limit = Number(req.query.limit) || 10;

  const data = await db
    .collection("indicator_values")
    .find({
      indicator_code: "accidents_per_10000",
      year: 2023,
    })
    .sort({ value: -1 })
    .limit(limit)
    .toArray();

  res.json(data);
});

router.get("/bottom", async (req, res) => {
  const db = await connectDB();

  const limit = Number(req.query.limit) || 10;

  const data = await db
    .collection("indicator_values")
    .find({
      indicator_code: "accidents_per_10000",
      year: 2023,
    })
    .sort({ value: 1 })
    .limit(limit)
    .toArray();

  res.json(data);
});

router.get("/highest-accident-rate-city", async (req, res) => {
  try {
    const db = await connectDB();

    const result = await db
      .collection("indicator_values")
      .find({
        indicator_code: "accidents_per_10000",
      })
      .sort({ value: -1 })
      .limit(1)
      .toArray();

    res.json(result[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch highest accident rate city",
    });
  }
});

module.exports = router;
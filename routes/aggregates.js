const express = require("express");
const connectDB = require("../db");

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const db = await connectDB();

    const { year, state_code } = req.query;
    const filter = {};

    if (year) filter.year = Number(year);
    if (state_code) filter.state_code = state_code;

    const total = await db.collection("accidents").countDocuments(filter);
    const bicycle = await db.collection("accidents").countDocuments({
      ...filter,
      has_bicycle: true,
    });
    const pedestrian = await db.collection("accidents").countDocuments({
      ...filter,
      has_pedestrian: true,
    });
    const car = await db.collection("accidents").countDocuments({
      ...filter,
      has_car: true,
    });

    res.json({ total, bicycle, pedestrian, car });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate summary" });
  }
});

module.exports = router;

router.get("/monthly", async (req, res) => {
  try {
    const db = await connectDB();

    const { year, state_code } = req.query;

    const match = {};

    if (year) match.year = Number(year);
    if (state_code) match.state_code = state_code;

    const result = await db.collection("accidents").aggregate([
      { $match: match },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const data = months.map((name, index) => {
      const found = result.find((item) => item._id === index + 1);

      return {
        month: name,
        count: found ? found.count : 0,
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate monthly data" });
  }
});

router.get("/top-fatal-districts-2024", async (req, res) => {
  try {
    const db = await connectDB();

    const result = await db.collection("accidents").aggregate([
      {
        $match: {
          year: 2024,
          category: 1,
        },
      },
      {
        $group: {
          _id: "$district_code",
          fatal_accidents: { $sum: 1 },
        },
      },
      {
        $sort: {
          fatal_accidents: -1,
        },
      },
      {
        $limit: 5,
      },
    ]).toArray();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fatal districts" });
  }
});

router.get("/dresden-bicycle-2024", async (req, res) => {
  try {
    const db = await connectDB();

    const count = await db.collection("accidents").countDocuments({
      year: 2024,
      municipality_code: "14012000",
      has_bicycle: true,
    });

    res.json({
      city: "Dresden",
      year: 2024,
      bicycle_accidents: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch Dresden bicycle accidents",
    });
  }
});
router.get("/top-fatal-districts-2024", async (req, res) => {
  try {
    const db = await connectDB();

    const result = await db.collection("accidents").aggregate([
      {
        $match: {
          year: 2024,
          category: 1,
        },
      },
      {
        $group: {
          _id: "$district_code",
          fatal_accidents: { $sum: 1 },
        },
      },
      {
        $sort: {
          fatal_accidents: -1,
        },
      },
      {
        $limit: 5,
      },
    ]).toArray();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch top fatal districts",
    });
  }
});

router.get("/zero-accident-municipalities-saxony-2023", async (req, res) => {
  try {
    const db = await connectDB();

    const accidentMunicipalities = await db
      .collection("accidents")
      .aggregate([
        {
          $match: {
            year: 2023,
            state_code: "14",
          },
        },
        {
          $project: {
            full_municipality_code: {
              $concat: ["$state_code", "$district_code", "$municipality_code"],
            },
          },
        },
        {
          $group: {
            _id: "$full_municipality_code",
          },
        },
      ])
      .toArray();

    const accidentCodes = accidentMunicipalities.map((item) => item._id);

    const zeroMunicipalities = await db
      .collection("municipalities")
      .find(
        {
          state_code: "14",
          municipality_code: { $nin: accidentCodes },
        },
        {
          projection: {
            _id: 0,
            municipality_code: 1,
            municipality_name: 1,
          },
        }
      )
      .sort({ municipality_name: 1 })
      .toArray();

    res.json({
      year: 2023,
      state: "Saxony",
      count: zeroMunicipalities.length,
      municipalities: zeroMunicipalities,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch zero accident municipalities",
    });
  }
});
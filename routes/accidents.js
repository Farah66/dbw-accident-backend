
const express = require("express");
const connectDB = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    const {
      year,
      month,
      category,
      state_code,
      pedestrian,
      bicycle,
      car,
      limit,
    } = req.query;

    const filter = {};

    if (year) filter.year = Number(year);
    if (month) filter.month = Number(month);

    if (category === "injury") {
      filter.category = { $in: [2, 3] };
    } else if (category) {
      filter.category = Number(category);
    }

    if (state_code) filter.state_code = state_code;

    if (pedestrian === "true") filter.has_pedestrian = true;
    if (bicycle === "true") filter.has_bicycle = true;
    if (car === "true") filter.has_car = true;

    const maxLimit = Math.min(Number(limit) || 3000, 5000);

    const count = await db.collection("accidents").countDocuments(filter);

    const projection = {
      year: 1,
      month: 1,
      hour: 1,
      weekday: 1,
      category: 1,
      lat: 1,
      lon: 1,
      has_bicycle: 1,
      has_pedestrian: 1,
      has_car: 1,
      state_code: 1,
    };

    let data;

    // If all Germany is selected, use random sample.
    // This prevents the map from showing only the first CSV records from north Germany.
    if (!state_code) {
      data = await db
        .collection("accidents")
        .aggregate([
          { $match: filter },
          { $sample: { size: maxLimit } },
          { $project: projection },
        ])
        .toArray();
    } else {
      data = await db
        .collection("accidents")
        .find(filter)
        .project(projection)
        .limit(maxLimit)
        .toArray();
    }

    res.json({
      count,
      returned: data.length,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch accidents" });
  }
});

module.exports = router;
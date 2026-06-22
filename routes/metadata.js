const express = require("express");

const router = express.Router();

router.get("/sources", (req, res) => {
  res.json({
    project: "DBW Unfallatlas",
    sources: [
      {
        name: "Unfallatlas accident locations 2023",
        file: "accident_per_location_2023.csv",
        type: "CSV",
        records: 269048,
        collection: "accidents",
        licence: "Official German open data",
      },
      {
        name: "Accident rate per 10,000 inhabitants",
        file: "accident_per_10000_per_city.csv",
        type: "CSV",
        collection: "indicator_values",
        indicator: "accidents_per_10000",
      },
      {
        name: "Accidents with persons per month",
        file: "accidents_with_persons_per_month.csv",
        type: "CSV",
        collection: "not imported yet",
      },
    ],
  });
});

module.exports = router;
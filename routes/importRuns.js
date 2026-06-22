const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    import_runs: [
      {
        source: "Unfallatlas",
        file: "accident_per_location_2023.csv",
        collection: "accidents",
        records_imported: 269048,
        year: 2023,
        method: "CSV import script",
      },
      {
        source: "Regionalstatistik",
        file: "accident_per_10000_per_city.csv",
        collection: "indicator_values",
        indicator: "accidents_per_10000",
        method: "CSV import script",
      },
      {
        source: "Manual reference data",
        collection: "regions",
        records_imported: 16,
        method: "region import script",
      },
    ],
  });
});

module.exports = router;
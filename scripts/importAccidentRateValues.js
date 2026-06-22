require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const connectDB = require("../db");

function toNumber(value) {
  if (!value) return null;
  return Number(value.replace(",", "."));
}

async function importAccidentRateValues() {
  const db = await connectDB();
  const values = [];

  const filePath = path.join(
    __dirname,
    "../data/accident_per_10000_per_city.csv"
  );

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ";", skipLines: 2 }))
    .on("data", (row) => {
      values.push({
        region_id: row.schluessel,
        region_name: row.regionaleinheit,
        indicator_code: "accidents_per_10000",
        year: 2023,
        value: toNumber(row.wert),
        source_system: "Regionalstatistik",
        source_file: "accident_per_10000_per_city.csv",
        imported_at: new Date(),
      });
    })
    .on("end", async () => {
      await db.collection("indicator_values").deleteMany({
        indicator_code: "accidents_per_10000",
        year: 2023,
      });

      await db.collection("indicator_values").insertMany(values);

      console.log(`Imported ${values.length} indicator values`);
      process.exit();
    });
}

importAccidentRateValues();
require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
});

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const connectDB = require("../db");


async function importAccidents2024() {
  const db = await connectDB();

  const filePath = path.join(__dirname, "../data/Unfallorte2024_LinRef.csv");

  const accidents = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ";" }))
    .on("data", (row) => {
      accidents.push({
        year: Number(row.UJAHR),
        month: Number(row.UMONAT),
        hour: Number(row.USTUNDE),
        weekday: Number(row.UWOCHENTAG),

        category: Number(row.UKATEGORIE),

        state_code: row.ULAND,
        district_code: `${row.ULAND}${String(row.UKREIS).padStart(3, "0")}`,
        municipality_code: `${row.ULAND}${String(row.UKREIS).padStart(3, "0")}${String(row.UGEMEINDE).padStart(3, "0")}`,

        has_bicycle: row.IstRad === "1",
        has_car: row.IstPKW === "1",

        lon: Number(String(row.XGCSWGS84).replace(",", ".")),
        lat: Number(String(row.YGCSWGS84).replace(",", ".")),

        source_file: "Unfallorte2024_LinRef.csv",
      });
    })
    .on("end", async () => {
      await db.collection("accidents").insertMany(accidents);
      console.log(`Imported ${accidents.length} accident records for 2024`);
      process.exit();
    });
}

importAccidents2024();
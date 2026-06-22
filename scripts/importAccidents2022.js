require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const connectDB = require("../db");

function toNumber(value) {
  if (!value) return null;
  return Number(String(value).replace(",", "."));
}

async function importAccidents() {
  const db = await connectDB();
  const accidents = [];

  const filePath = path.join(
    __dirname,
    "../data/Unfallorte2022_LinRef.csv"
  );

  console.log("Reading file:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("CSV file not found!");
    process.exit(1);
  }

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ";" }))
    .on("data", (row) => {
      const lon = toNumber(row.XGCSWGS84);
      const lat = toNumber(row.YGCSWGS84);

      accidents.push({
        source_id: row.UIDENTSTLAE,
        state_code: row.ULAND,
        district_code: row.UKREIS,
        municipality_code: row.UGEMEINDE,

        year: Number(row.UJAHR) || 2022,
        month: Number(row.UMONAT),
        hour: Number(row.USTUNDE),
        weekday: Number(row.UWOCHENTAG),

        category: Number(row.UKATEGORIE),
        accident_type: Number(row.UART),
        type_1: Number(row.UTYP1),
        light_condition: Number(row.ULICHTVERH),
        road_condition: Number(row.IstStrassenzustand),

        has_bicycle: row.IstRad === "1",
        has_car: row.IstPKW === "1",
        has_pedestrian: row.IstFuss === "1",
        has_motorcycle: row.IstKrad === "1",
        has_goods_vehicle: row.IstGkfz === "1",
        has_other: row.IstSonstige === "1",

        lon,
        lat,

        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },

        source: "Unfallatlas",
        imported_at: new Date(),
      });
    })
    .on("error", (err) => {
      console.error("CSV read error:", err);
    })
    .on("end", async () => {
      await db.collection("accidents").deleteMany({ year: 2022 });

      if (accidents.length > 0) {
        await db.collection("accidents").insertMany(accidents);
      }

      console.log(`Imported ${accidents.length} accidents for 2022`);
      process.exit();
    });
}

importAccidents();
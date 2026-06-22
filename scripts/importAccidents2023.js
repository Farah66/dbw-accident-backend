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
    "../data/accident_per_location_2023.csv"
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

        year: Number(row.UJAHR),
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
      console.log("Example accident:", accidents[0]);

      const states = [...new Set(accidents.map((a) => a.state_code))];
      console.log("States in CSV:", states);

      const latValues = accidents.map((a) => a.lat).filter(Boolean);
      const lonValues = accidents.map((a) => a.lon).filter(Boolean);

      // console.log("Lat range:", Math.min(...latValues), Math.max(...latValues));
      // console.log("Lon range:", Math.min(...lonValues), Math.max(...lonValues));
      
      const latMin = latValues.reduce((min, v) => Math.min(min, v), Infinity);
      const latMax = latValues.reduce((max, v) => Math.max(max, v), -Infinity);

      const lonMin = lonValues.reduce((min, v) => Math.min(min, v), Infinity);
      const lonMax = lonValues.reduce((max, v) => Math.max(max, v), -Infinity);

      console.log("Lat range:", latMin, latMax);
      console.log("Lon range:", lonMin, lonMax);
      
      const invalidCoords = accidents.filter(
        (a) =>
          !Number.isFinite(a.lat) ||
          !Number.isFinite(a.lon) ||
          a.lat < 47 ||
          a.lat > 55.5 ||
          a.lon < 5.5 ||
          a.lon > 15.5
      );

      console.log("Invalid coordinates:", invalidCoords.length);

      await db.collection("accidents").deleteMany({ year: 2023 });

      if (accidents.length > 0) {
        await db.collection("accidents").insertMany(accidents);
      }

      console.log(`Imported ${accidents.length} accidents`);

      process.exit();
    });
}

importAccidents();
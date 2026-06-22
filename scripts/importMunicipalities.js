require("dotenv").config();

const XLSX = require("xlsx");
const connectDB = require("../db");
const path = require("path");

async function importMunicipalities() {
  const db = await connectDB();

  const filePath = path.join(__dirname, "../data/AuszugGV2QAktuell.xlsx");
  const workbook = XLSX.readFile(filePath);

  const sheetName = "Onlineprodukt_Gemeinden30062026";
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  const municipalities = [];

  for (const row of rows) {
    if (String(row[0]) !== "60") continue;

    const stateCode = String(row[2]).padStart(2, "0");
    const districtPart = String(row[4]).padStart(2, "0");
    const municipalityPart = String(row[6]).padStart(3, "0");

    municipalities.push({
      state_code: stateCode,
      district_code: `${stateCode}${districtPart}`,
      municipality_code: `${stateCode}${districtPart}${municipalityPart}`,
      municipality_name: row[7],
      population: Number(row[9]) || 0,
      area_km2: Number(row[8]) || 0,
      postal_code: String(row[13]),
      lon: Number(String(row[14]).replace(",", ".")) || null,
      lat: Number(String(row[15]).replace(",", ".")) || null,
      source_file: "AuszugGV2QAktuell.xlsx",
    });
  }

  await db.collection("municipalities").deleteMany({});

  if (municipalities.length > 0) {
    await db.collection("municipalities").insertMany(municipalities);
  }

  console.log(`Imported ${municipalities.length} municipalities`);

  console.log(
    "Example Saxony municipalities:",
    municipalities.filter((m) => m.state_code === "14").slice(0, 5)
  );

  process.exit();
}

importMunicipalities();
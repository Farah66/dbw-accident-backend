require("dotenv").config();
const connectDB = require("../db");

async function importRegions() {
  const db = await connectDB();

  const regions = [
    { region_id: "01", name: "Schleswig-Holstein", level: "state" },
    { region_id: "02", name: "Hamburg", level: "state" },
    { region_id: "03", name: "Niedersachsen", level: "state" },
    { region_id: "04", name: "Bremen", level: "state" },
    { region_id: "05", name: "Nordrhein-Westfalen", level: "state" },
    { region_id: "06", name: "Hessen", level: "state" },
    { region_id: "07", name: "Rheinland-Pfalz", level: "state" },
    { region_id: "08", name: "Baden-Württemberg", level: "state" },
    { region_id: "09", name: "Bayern", level: "state" },
    { region_id: "10", name: "Saarland", level: "state" },
    { region_id: "11", name: "Berlin", level: "state" },
    { region_id: "12", name: "Brandenburg", level: "state" },
    { region_id: "13", name: "Mecklenburg-Vorpommern", level: "state" },
    { region_id: "14", name: "Sachsen", level: "state" },
    { region_id: "15", name: "Sachsen-Anhalt", level: "state" },
    { region_id: "16", name: "Thüringen", level: "state" }
  ];

  await db.collection("regions").deleteMany({});
  await db.collection("regions").insertMany(regions);

  console.log(`Imported ${regions.length} regions`);
  process.exit();
}

importRegions();
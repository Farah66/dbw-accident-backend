require("dotenv").config();
const connectDB = require("../db");

async function importIndicators() {
  const db = await connectDB();

  const indicators = [
    {
      indicator_id: 1,
      code: "accidents_total",
      name: "Total accidents",
      unit: "count",
      source_system: "Unfallatlas",
    },
    {
      indicator_id: 2,
      code: "accidents_per_10000",
      name: "Accidents per 10,000 inhabitants",
      unit: "accidents",
      source_system: "Unfallatlas",
    },
    {
      indicator_id: 3,
      code: "accidents_with_persons",
      name: "Accidents involving persons",
      unit: "accidents",
      source_system: "Unfallatlas",
    },
    {
      indicator_id: 4,
      code: "bicycle_accidents",
      name: "Bicycle accidents",
      unit: "accidents",
      source_system: "Unfallatlas",
    },
    {
      indicator_id: 5,
      code: "pedestrian_accidents",
      name: "Pedestrian accidents",
      unit: "accidents",
      source_system: "Unfallatlas",
    },
    {
      indicator_id: 6,
      code: "car_accidents",
      name: "Car accidents",
      unit: "accidents",
      source_system: "Unfallatlas",
    }
  ];

  await db.collection("indicators").deleteMany({});
  await db.collection("indicators").insertMany(indicators);

  console.log(`Imported ${indicators.length} indicators`);

  process.exit();
}

importIndicators();
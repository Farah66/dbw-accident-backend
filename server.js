require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const accidentsRoutes = require("./routes/accidents");
const aggregatesRoutes = require("./routes/aggregates");
const rankingsRoutes = require("./routes/rankings");
const metadataRoutes = require("./routes/metadata");
const importRunsRoutes = require("./routes/importRuns");
const app = express();
const swaggerUi = require("swagger-ui-express");

app.use(cors());
app.use(express.json());
app.use("/api/metadata", metadataRoutes);
app.use("/api/import-runs", importRunsRoutes);

app.use("/api/accidents", accidentsRoutes);
app.use("/api/aggregates", aggregatesRoutes);
app.use("/api/rankings", rankingsRoutes);

app.get("/", (req, res) => {
  res.send("DBW Accident API Running");
});

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "DBW Unfallatlas API",
    version: "1.0.0",
    description: "API for German accident data integration project",
  },
  servers: [
    {
      url: "http://localhost:5000",
    },
  ],
  paths: {
    "/api/accidents": {
      get: {
        summary: "Get filtered accidents",
        parameters: [
          { name: "year", in: "query", schema: { type: "integer" } },
          { name: "state_code", in: "query", schema: { type: "string" } },
          { name: "month", in: "query", schema: { type: "integer" } },
          { name: "category", in: "query", schema: { type: "integer" } },
          { name: "bicycle", in: "query", schema: { type: "boolean" } },
          { name: "pedestrian", in: "query", schema: { type: "boolean" } },
          { name: "car", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          200: { description: "Filtered accident data" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/aggregates/summary": {
      get: {
        summary: "Get accident summary statistics",
        responses: {
          200: { description: "Summary statistics" },
        },
      },
    },
    "/api/aggregates/monthly": {
      get: {
        summary: "Get monthly accident statistics",
        responses: {
          200: { description: "Monthly accident counts" },
        },
      },
    },
    "/api/rankings/top": {
      get: {
        summary: "Top regions by accident rate",
        responses: {
          200: { description: "Top ranking list" },
        },
      },
    },
    "/api/rankings/bottom": {
      get: {
        summary: "Bottom regions by accident rate",
        responses: {
          200: { description: "Bottom ranking list" },
        },
      },
    },
    "/api/metadata/sources": {
      get: {
        summary: "Get metadata about data sources",
        responses: {
          200: { description: "Source metadata" },
        },
      },
    },
    "/api/import-runs": {
      get: {
        summary: "Get import provenance information",
        responses: {
          200: { description: "Import run list" },
        },
      },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
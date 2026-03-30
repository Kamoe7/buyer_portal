const express = require("express");
const cors = require("cors");
const { init } = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

init().then(() => {
  const authRoutes = require("./authRoutes");
  const propertyRoutes = require("./propertyRoutes");

  app.use("/api/auth", authRoutes);
  app.use("/api/properties", propertyRoutes);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
  app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error." });
  });

  app.listen(PORT, () => {
    console.log("\n🏠 Buyer Portal API running on http://localhost:" + PORT);
    console.log("   Health: http://localhost:" + PORT + "/api/health\n");
  });
}).catch(err => {
  console.error("Failed to initialise database:", err);
  process.exit(1);
});

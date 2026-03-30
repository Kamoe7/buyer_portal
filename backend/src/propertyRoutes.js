const express = require("express");
const { prepare } = require("./db");
const { authenticate } = require("./middleware");

const router = express.Router();
router.use(authenticate);
router.get("/", (req,res) => {
  const properties = prepare(`
    SELECT p.*,
      CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
    FROM properties p
    LEFT JOIN favourites f ON f.property_id = p.id AND f.user_id = ?
    ORDER BY p.id
  `).all(req.user.id);
  return res.json({ properties });
});
router.get("/favourites", (req,res) => {
  const favourites = prepare(`
    SELECT p.*, f.created_at AS favourited_at
    FROM properties p
    JOIN favourites f ON f.property_id = p.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  return res.json({ favourites });
});

router.post("/:id/favourite",(req, res) => {
  const propertyId = parseInt(req.params.id, 10);
  if (isNaN(propertyId)) return res.status(400).json({ error: "Invalid property ID." });

  const property = prepare("SELECT id FROM properties WHERE id = ?").get(propertyId);
  if (!property) return res.status(404).json({ error: "Property not found." });

  const existing = prepare("SELECT id FROM favourites WHERE user_id = ? AND property_id = ?")
    .get(req.user.id, propertyId);

  if (existing) {
    prepare("DELETE FROM favourites WHERE user_id = ? AND property_id = ?").run(req.user.id, propertyId);
    return res.json({ favourited: false, message: "Removed from favourites." });
  } else {
    prepare("INSERT INTO favourites (user_id, property_id) VALUES (?, ?)").run(req.user.id, propertyId);
    return res.status(201).json({ favourited: true, message: "Added to favourites." });
  }
});

router.delete("/:id/favourite",(req, res) => {
  const propertyId = parseInt(req.params.id, 10);
  if (isNaN(propertyId)) return res.status(400).json({ error: "Invalid property ID." });
  const result = prepare("DELETE FROM favourites WHERE user_id = ? AND property_id = ?")
    .run(req.user.id, propertyId);
  if (result.changes === 0) return res.status(404).json({ error: "Favourite not found." });
  return res.json({ message: "Removed from favourites." });
});

module.exports = router;

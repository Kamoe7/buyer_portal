const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prepare } = require("./db");
const { JWT_SECRET, authenticate } = require("./middleware");

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2)
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    if (!email || !validateEmail(email))
      return res.status(400).json({ error: "A valid email address is required." });
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: "An account with that email already exists." });

    const hash = await bcrypt.hash(password, 12);
    const result = prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'buyer')")
      .run(name.trim(), email.toLowerCase(), hash);

    const user = prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET, { expiresIn: "7d" }
    );
    const { password: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/me", authenticate, (req, res) => {
  const user = prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user });
});

module.exports = router;

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/portal.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}
function prepare(sql) {
  return {
    get(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    all(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    run(...params) {
      db.run(sql, params);
      const changes = db.getRowsModified();
      const res = db.exec("SELECT last_insert_rowid()");
      const lastInsertRowid = res[0]?.values[0][0] || 0;
      saveDb();
      return { changes, lastInsertRowid };
    },
  };
}

function exec(sql) {
  db.exec(sql);
  saveDb();
}

async function init() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'buyer',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS properties (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT    NOT NULL,
      address   TEXT    NOT NULL,
      price     INTEGER NOT NULL,
      bedrooms  INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      sqft      INTEGER NOT NULL,
      image_url TEXT,
      tag       TEXT
    );
    CREATE TABLE IF NOT EXISTS favourites (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id),
      property_id INTEGER NOT NULL REFERENCES properties(id),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, property_id)
    );
  `);
  saveDb();

  const res = db.exec("SELECT COUNT(*) FROM properties");
  const count = res[0]?.values[0][0] || 0;
  if (count === 0) {
    const seeds = [
      ["Modern Downtown Loft","42 Urban Ave, New York, NY 10001",850000,2,2,1200,"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80","Featured"],
      ["Suburban Family Home","15 Maple Street, Austin, TX 78701",620000,4,3,2400,"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80","New"],
      ["Beachfront Villa","7 Ocean Drive, Miami, FL 33139",1450000,5,4,3800,"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80","Luxury"],
      ["Cozy Studio Apartment","88 Lakeview Blvd, Chicago, IL 60601",310000,1,1,650,"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80","Affordable"],
      ["Mountain Retreat Cabin","23 Pine Ridge Rd, Denver, CO 80202",490000,3,2,1800,"https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&q=80","Scenic"],
      ["Historic Brownstone","5 Commonwealth Ave, Boston, MA 02116",975000,3,2,2100,"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80","Historic"],
    ];
    for (const s of seeds) {
      db.run("INSERT INTO properties (title,address,price,bedrooms,bathrooms,sqft,image_url,tag) VALUES (?,?,?,?,?,?,?,?)", s);
    }
    saveDb();
    console.log("Seeded 6 sample properties");
  }
  console.log("Database ready at " + DB_PATH);
}

module.exports = { prepare, exec, init };

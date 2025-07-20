const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const QRCode = require("qrcode");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./menu.db", err => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite DB");
});

db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, username TEXT UNIQUE, password TEXT
  )\`);

  db.run(\`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER, name TEXT, price REAL, image TEXT,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )\`);

  db.run(\`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER, phone TEXT, items TEXT,
    status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )\`);
});

app.post("/register", (req, res) => {
  const { name, username, password } = req.body;
  db.run("INSERT INTO restaurants (name, username, password) VALUES (?, ?, ?)", [name, username, password], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM restaurants WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ restaurant: row });
  });
});

app.get("/menu/:id", (req, res) => {
  db.all("SELECT * FROM menu_items WHERE restaurant_id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/item", (req, res) => {
  const { restaurant_id, name, price } = req.body;
  db.run("INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)", [restaurant_id, name, price], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.post("/order", (req, res) => {
  const { restaurant_id, phone, items } = req.body;
  db.run("INSERT INTO orders (restaurant_id, phone, items) VALUES (?, ?, ?)", [restaurant_id, phone, JSON.stringify(items)], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ order_id: this.lastID });
  });
});

app.get("/orders/:restaurant_id", (req, res) => {
  db.all("SELECT * FROM orders WHERE restaurant_id = ?", [req.params.restaurant_id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/order/done", (req, res) => {
  db.run("UPDATE orders SET status = 'done' WHERE id = ?", [req.body.order_id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get("/generate-qr/:id", async (req, res) => {
  const url = \`http://yourdomain.com/menu/\${req.params.id}\`;
  try {
    const qr = await QRCode.toDataURL(url);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(\`API running at http://localhost:\${PORT}\`));
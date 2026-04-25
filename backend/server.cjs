const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "bookings.db");

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateBooking(body) {
  const booking = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    check_in: String(body.check_in || "").trim(),
    check_out: String(body.check_out || "").trim()
  };

  if (!booking.name || !booking.email || !booking.check_in || !booking.check_out) {
    return { error: "All fields are required." };
  }

  if (!booking.email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!isValidDate(booking.check_in) || !isValidDate(booking.check_out)) {
    return { error: "Please enter valid check-in and check-out dates." };
  }

  if (booking.check_in >= booking.check_out) {
    return { error: "Check-out date must be after check-in date." };
  }

  return { booking };
}

app.post("/book", (req, res) => {
  const { booking, error } = validateBooking(req.body);

  if (error) {
    res.status(400).json({ error });
    return;
  }

  db.get(
    `
      SELECT id FROM bookings
      WHERE check_in < ? AND check_out > ?
      LIMIT 1
    `,
    [booking.check_out, booking.check_in],
    (overlapError, existingBooking) => {
      if (overlapError) {
        res.status(500).json({ error: "Could not check availability." });
        return;
      }

      if (existingBooking) {
        res.status(409).json({ error: "Those dates are already booked. Please choose another stay." });
        return;
      }

      db.run(
        `
          INSERT INTO bookings (name, email, check_in, check_out)
          VALUES (?, ?, ?, ?)
        `,
        [booking.name, booking.email, booking.check_in, booking.check_out],
        function onInsert(insertError) {
          if (insertError) {
            res.status(500).json({ error: "Could not create booking." });
            return;
          }

          res.status(201).json({ id: this.lastID, ...booking });
        }
      );
    }
  );
});

app.get("/bookings", (req, res) => {
  db.all(
    `
      SELECT id, name, email, check_in, check_out, created_at
      FROM bookings
      ORDER BY check_in ASC
    `,
    (error, rows) => {
      if (error) {
        res.status(500).json({ error: "Could not load bookings." });
        return;
      }

      res.json(rows);
    }
  );
});

app.delete("/bookings/:id", (req, res) => {
  db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], function onDelete(error) {
    if (error) {
      res.status(500).json({ error: "Could not delete booking." });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Booking not found." });
      return;
    }

    res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`Apartment booking API running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  db.close(() => process.exit(0));
});

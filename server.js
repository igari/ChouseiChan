const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const fs = require("fs");
const uuidv4 = require("uuid").v4;

const app = express();
const port = 3000;

// Read SQL file
const sqlFile = fs.readFileSync("./schema.sql", "utf8");

// Connect to SQLite database
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Endpoint to create a new schedule
app.post("/create-event", (req, res) => {
  const { event_name, candidate_dates } = req.body;
  const eventId = uuidv4(); // Generate a unique event id
  const sql = `INSERT INTO events (id, created_at, title) VALUES (?, datetime('now'), ?)`;
  const candidateDates = candidate_dates.split(/\s?\,\s?/);
  db.run(sql, [eventId, event_name], function (err) {
    if (err) {
      return console.log(err.message);
    }
    // Insert the candidate dates and times into the candidate_dates table
    candidateDates.forEach((candidateDate) => {
      const [date, time] = candidateDate.split(/\s/);
      const sql = `INSERT INTO candidate_dates (event_id, candidate_date, candidate_time) VALUES (?, ?, ?)`;
      db.run(sql, [eventId, date, time], function (err) {
        if (err) {
          return console.log(err.message);
        }
      });
    });
    // Fetch the updated list of events to send back to the client
    db.all("SELECT * FROM events", [], (err, rows) => {
      if (err) {
        throw err;
      }
      res.send(rows);
    });
  });
});

// Start the server
app.listen(port, () => {
  db.exec(sqlFile, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log(`Server running on http://localhost:${port}`);
  });
});

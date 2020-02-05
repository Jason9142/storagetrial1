const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("config");

const connection = mysql.createConnection({
  host: config.get("sqlHost"),
  user: config.get("sqlUser"),
  password: config.get("sqlPassword"),
  database: config.get("sqlDb")
});

connection.connect(function(err) {
  if (err) {
    console.error("Error connecting to SQL database: " + err.stack);
    return;
  }
  console.log("Connected to SQL database with id " + connection.threadId);
});

router.get("/", async (req, res) => {
  const query = `SELECT * FROM exc ORDER BY date DESC, time DESC LIMIT 12`;

  connection.query(query, function(err, rows) {
    if (err) return res.status(500).send(err);
    res.send(rows);
  });
});

module.exports = router;

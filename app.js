require("express-async-errors");
const winston = require("winston");
const express = require("express");
const config = require("config");
const app = express();
const path = require("path");

require("dotenv").config();
require("./startup/logging")();
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
// require("./util/excel");
// require("./startup/validation")();
app.use(express.static(path.join(__dirname, "frontend", "build")));

const port = process.env.PORT || config.get("port");
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});
const server = app.listen(port, () => {
  // winston.info(`Listening on port ${port}...`);
  console.log(`Listening on port ${port}...`);
});

module.exports = server;

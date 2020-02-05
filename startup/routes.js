const express = require("express");
const users = require("../routes/users");
const usersArchive = require("../routes/usersArchive");
const commodities = require("../routes/commodities");
const commoditiesArchive = require("../routes/commoditiesArchive");
const pdf = require("../routes/pdf");
const excel = require("../routes/excel");
const auth = require("../routes/auth");
const img = require("../routes/img");
const sql = require("../routes/sql");
const admin = require("../middleware/admin");
const error = require("../middleware/error");
const middlewareAuth = require("../middleware/auth");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/sql", sql);
  app.use("/api/uploads", [middlewareAuth, express.static("uploads")]);
  app.use("/api/users", users);
  app.use("/api/usersArchive", usersArchive);
  app.use("/api/commodities", commodities);
  app.use("/api/commoditiesArchive", commoditiesArchive);
  app.use("/api/pdf", pdf);
  app.use("/api/excel", excel);
  app.use("/api/img", img);
  app.use(error);
};

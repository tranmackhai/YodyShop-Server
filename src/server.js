const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/db");
const cors = require("cors");

var app = express();

sequelize
  .authenticate()
  .then(() => {
    console.log("successfully");
  })
  .catch((error) => {
    console.log("error");
  })
  .finally(() => {
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      })
    );
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use("/", require("./routes"));

    app.listen(3050, () => {
      console.log("server");
    });
  });

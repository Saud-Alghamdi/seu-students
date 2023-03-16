const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const routes = require("./routes");
const crypto = require("crypto");
const session = require("express-session");
const multer = require("multer");

// BASIC CONFIG
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));
app.use(express.static(path.join(__dirname, "../client")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SESSION CONFIG
app.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
  })
);

app.use(routes);

app.listen(port, () => console.log("Listening ..."));

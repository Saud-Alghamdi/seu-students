const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const viewRoutes = require("./routes/view-routes.js");
const apiRoutes = require("./routes/api-routes.js");

// Server setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views")); // views served in views directory
app.use(express.static(path.join(__dirname, "../client"))); // static files served from client directory
app.use(express.urlencoded({ extended: true }));
app.use(viewRoutes)
app.use(apiRoutes)

app.listen(port, () => console.log("Listening ..."));

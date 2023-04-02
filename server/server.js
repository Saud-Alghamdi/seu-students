const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const routes = require("./routes");
const crypto = require("crypto");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const store = new MemoryStore({
  checkPeriod: 3600000,
});

// BASIC CONFIG
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));
app.use(express.static(path.join(__dirname, "../client")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensures sessions are securely stored and regularly cleared to prevent any issues with server memory usage //

setInterval(() => {
  store.clear((err) => {
    if (err) {
      console.log("Error clearing expired sessions:", err);
    }
  });
}, 3600000);

app.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 3600000,
    },
  })
);

//---------------------//

app.use(routes);

app.listen(port, () => console.log("Listening ..."));

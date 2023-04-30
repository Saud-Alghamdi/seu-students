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

// Session config + middleware
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

// Language middleware
function setLang(req, res, next) {
  let userLanguage;

  if (req.query.lang) {
    userLanguage = req.query.lang;
    req.session.userLanguage = userLanguage;
  } else if (req.session.userLanguage) {
    userLanguage = req.session.userLanguage;
  } else {
    userLanguage = req.headers["accept-language"].split(",")[0].toLowerCase();
  }

  // Set language info in session
  req.session.lang = userLanguage;
  req.session.langDirection = userLanguage === "ar" ? "rtl" : "ltr";
  req.session.langData = require(`./lang/${userLanguage}.json`);

  next();
}

// Ensures sessions are securely stored and regularly cleared to prevent any issues with server memory usage //
setInterval(() => {
  store.clear((err) => {
    if (err) {
      console.log("Error clearing expired sessions:", err);
    }
  });
}, 3600000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

app.use(express.static(path.join(__dirname, "../client")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(setLang);
app.use(routes);

app.listen(port, () => console.log("Listening ..."));

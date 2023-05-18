import express from "express";
import session from "express-session";
import memorystore from "memorystore";
import path from "path";
import routes from "./routes.js";
import crypto from "crypto";
import arLangData from "./lang/ar.json" assert { type: "json" };
import enLangData from "./lang/en.json" assert { type: "json" };

const app = express();
const __dirname = path.resolve();
const port = 3000;
const MemoryStore = memorystore(session);
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
async function setLang(req, res, next) {
  let userLanguage;

  // first option, check if there is a query to change language
  if (req.query.lang) {
    userLanguage = req.query.lang;
  }
  // second option, check session to see set language
  else if (req.session.lang) {
    userLanguage = req.session.lang;
  }
  // third option, take the default user language
  else {
    userLanguage = req.headers["accept-language"].split(",")[0].toLowerCase();
  }

  req.session.lang = userLanguage;
  req.session.langData = req.session.lang === "ar" ? arLangData : enLangData;
  req.session.langDirection = userLanguage === "ar" ? "rtl" : "ltr";
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
app.set("views", path.join(__dirname, "client/views"));

app.use(express.static(path.join(__dirname, "client")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(setLang);
app.use(routes);
app.listen(port, () => console.log(`Listening on ${port} ...`));

import express from "express";
import session from "express-session";
import memorystore from "memorystore";
import path from "path";
import routes from "./routes.js";
import crypto from "crypto";
import cors from 'cors';
import {arLangData} from "../lang/ar.js";
import {enLangData} from "../lang/en.js";

const app = express();
const __dirname = path.resolve();
const port = process.env.PORT || 3000;
const MemoryStore = memorystore(session);
const store = new MemoryStore({
  checkPeriod: 3600000, // 1 hour
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

  // first statement, check if there is a query to change language
  if (req.query.lang) {
    userLanguage = req.query.lang;
  }
  // second statement, check session to see if a language is already set
  else if (req.session.lang) {
    userLanguage = req.session.lang;
  }
  // third statement, set the default user language
  else {
    userLanguage = req.headers["accept-language"]?.split(",")[0]?.toLowerCase() || "ar";
  }

  req.session.lang = userLanguage;
  req.session.langData = userLanguage === "en" ? enLangData : arLangData;

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
app.use(cors());
app.use(express.json());
app.use(setLang);
app.use(routes);
app.listen(port, () => console.log(`Listening on ${port} ...`));

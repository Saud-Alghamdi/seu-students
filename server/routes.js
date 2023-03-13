const express = require("express");
const router = express.Router();
const RouteHandler = require("./RouteHandler.js");
const path = require("path");

// LANG config
function detectLanguageMiddleware(req, res, next) {
  const supportedLanguages = ["ar", "en"];
  const userLanguage = req.query.lang || req.headers["accept-language"].split(",")[0].slice(0, 2);

  if (!supportedLanguages.includes(userLanguage)) {
    res.status(400).send(`Unsupported language ${userLanguage}`);
    return;
  }

  req.userLanguage = userLanguage;
  req.translationFile = require(path.join(__dirname, "../lang/" + userLanguage + ".json"));
  next();
}
router.use(detectLanguageMiddleware);

// multer config for file handling
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Home page
router.get("/", RouteHandler.renderHomePage);

// Sign up page
router.get("/signup", (req, res) => {
  RouteHandler.renderSignupPage(req, res);
});

// Sign up process
router.post("/signup-process", async (req, res) => {
  await RouteHandler.signupProcess(req, res);
});

// Sign up - check username exists
router.post("/signup/checkUsernameExists", async (req, res) => {
  await RouteHandler.checkUsernameExists(req, res);
});

// Sign up - check email exists
router.post("/signup/checkEmailExists", async (req, res) => {
  await RouteHandler.checkEmailExists(req, res);
});

// Login page
router.get("/login", RouteHandler.renderLoginPage);

// Login process
router.post("/login-process", async (req, res) => {
  await RouteHandler.loginProcess(req, res);
});

// Logout
router.get("/logout", RouteHandler.logout);

// Departments page
router.get("/departments", RouteHandler.renderDepartments);

// Courses page
router.get("/departments/:depAbbr/courses", async (req, res) => {
  await RouteHandler.renderCourses(req, res);
});

// Posts page
router.get("/departments/:depAbbr/:courseId/posts", async (req, res) => {
  await RouteHandler.renderPosts(req, res);
});

// Add Post page
router.get("/departments/:depAbbr/:courseId/add-post", async (req, res) => {
  await RouteHandler.renderAddPost(req, res);
});

// Add Post Process
router.post("/departments/:depAbbr/:courseId/add-post/addPostProcess", upload.single("file"), async (req, res) => {
  await RouteHandler.addPostProcess(req, res);
});

// Download file from post
router.get("/downloadFile", async (req, res) => {
  await RouteHandler.downloadFile(req, res);
});

// user dashboard page
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

module.exports = router;

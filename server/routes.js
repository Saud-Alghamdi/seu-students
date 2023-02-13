const express = require("express");
const router = express.Router();
const RouteHandler = require("./RouteHandler.js");

/*--------------------------------
------------MAIN ROUTES-------------
--------------------------------*/

//--- Home ---//
router.get("/", (req, res) => res.render("home"));

//--- Sign up ---//
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup/signup-process", async (req, res) => {
  await RouteHandler.signupProcess(req, res);
});

router.post("/signup/checkUsernameExists", async (req, res) => {
  await RouteHandler.checkUsernameExists(req, res);
});

router.post("/signup/checkEmailExists", async (req, res) => {
  await RouteHandler.checkEmailExists(req, res);
});

//--- login ---//
router.get("/login", (req, res) => {
  
});

router.post("/login/login-process", async (req, res) => {
  await RouteHandler.loginProcess(req, res);
});



// faculties
router.get("/faculties", (req, res) => {
  res.render("faculties");
});

/*--------------------------------
------------FACULTY DEPARTMENTS-------------
--------------------------------*/

// afs departments
router.get("/faculties/afs/departments", (req, res) => {
  res.render("departments");
});

// ci departments
router.get("/faculties/ci/departments", (req, res) => {
  res.render("departments");
});

// hs departments
router.get("/faculties/hs/departments", (req, res) => {
  res.render("departments");
});

// sts departments
router.get("/faculties/sts/departments", (req, res) => {
  res.render("departments");
});

/*--------------------------------
------------POSTS-------------
--------------------------------*/

// afs --> acc posts
router.get("/faculties/afs/departments/acc/posts", (req, res) => {
  res.render("posts");
});

// afs --> ecom posts
router.get("/faculties/afs/ecom/posts", (req, res) => {
  res.render("posts");
});

// afs --> fin posts
router.get("/faculties/afs/fin/posts", (req, res) => {
  res.render("posts");
});

// afs --> mng posts
router.get("/faculties/afs/mng/posts", (req, res) => {
  res.render("posts");
});

// ci --> cs posts
router.get("/faculties/ci/cs/posts", (req, res) => {
  res.render("posts");
});

// ci --> it posts
router.get("/faculties/ci/it/posts", (req, res) => {
  res.render("posts");
});

// ci --> ds posts
router.get("/faculties/ci/ds/posts", (req, res) => {
  res.render("posts");
});

// hs --> hi posts
router.get("/faculties/hs/hi/posts", (req, res) => {
  res.render("posts");
});

// hs --> ph posts
router.get("/faculties/hs/ph/posts", (req, res) => {
  res.render("posts");
});

// sts --> dig posts
router.get("/faculties/sts/dig/posts", (req, res) => {
  res.render("posts");
});

// sts --> eng posts
router.get("/faculties/sts/eng/posts", (req, res) => {
  res.render("posts");
});

// sts --> law posts
router.get("/faculties/sts/law/posts", (req, res) => {
  res.render("posts");
});

/*--------------------------------
------------USER DASHBOARD-------------
--------------------------------*/

// user dashboard
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

/*--------------------------------
------------PROCESSING-------------
--------------------------------*/
router.post("/signup-process", async (req, res) => {
  const formData = req.body;
  const result = await signup(formData);
  if (result === true) {
    res.redirect("login");
  } else {
    res.redirect("signup");
  }
});

// test signup process
router.post("/signup/process", async (req, res) => {
  // validate data
  const formData = req.body;
  if (formData.username.length < 3 || formData.username.length > 25) {
    res.render("signup", { msg: "username must be between 3 to 25 characters long" });
  } else {
    res.render("login", { msg: "Signed up successfully!" });
  }
});

module.exports = router;

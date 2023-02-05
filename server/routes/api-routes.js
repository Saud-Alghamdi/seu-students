const express = require("express");
const app = express();
const router = express.Router();
const checkUsernameExists = require('../db/db-functions');

// parse req body
app.use(express.urlencoded({ extended: true }));

// check username exists
router.get('/checkUsernameExists', async (req, res) => {
  const username = req.query.username
  const exists = await checkUsernameExists(username)
  res.json(exists)
})

module.exports = router
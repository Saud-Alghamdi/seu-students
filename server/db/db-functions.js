const connect = require("./connection");

async function checkUsernameExists(username) {
  let exists = false;
  const con = await connect();

  const stmt = "SELECT `username` FROM `users` WHERE `username` = ?";
  const [rows] = await con.query(stmt, [username]);

  if (rows.length > 0) {
    exists = true;
  }

  return exists;
}

module.exports = checkUsernameExists;

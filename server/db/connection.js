const mysql = require("mysql2/promise");

async function connect() {
  try {
    return await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "seu-students",
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = connect;

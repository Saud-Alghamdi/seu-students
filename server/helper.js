function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

function formatDate(dateFromDB) {
  const date = new Date(dateFromDB + " UTC");

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Riyadh",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function bytesToKB(bytes) {
  const KB = bytes / 1024;
  return parseFloat(KB.toFixed(2));
}

module.exports = { snakeToCamel, formatDate, bytesToKB };

// Convert snake case to camel case
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

// Convert DB date to a more readable formatted date
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

module.exports = { snakeToCamel, formatDate };
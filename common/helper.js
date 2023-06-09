import axios from "axios";

export function formatDate(dateFromDB) {
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

export function bytesToKB(bytes) {
  const KB = bytes / 1024;
  return parseFloat(KB.toFixed(2));
}

export async function getCurrentLanguage() {
  let lang;

  await axios
    .get(`/currentLang`)
    .then((res) => (lang = res.data))
    .catch((err) => console.log(err.message));

  return lang;
}

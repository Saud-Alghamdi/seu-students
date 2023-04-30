// Module Purpose: Loads current set language json file

import axios from "axios";

let langData = null;

export function getLangData() {
  if (!langData) {
    langData = axios
      .get("/langData")
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }
  return langData;
}

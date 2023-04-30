import axios from "axios";

let langDataPromise = null;

export function getLangData() {
  if (!langDataPromise) {
    langDataPromise = axios
      .get("/langData")
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }
  return langDataPromise;
}

import axios from "axios";

export const api = (url, params) => {
  return new Promise((resolve, reject) => {
    const serverUrl = `http://localhost:3000/${url}?${params}`;
    axios
      .get(serverUrl)
      .then(response => {
        if (response.status != 200) {
          reject({ Message: "API external error" });
          return;
        }
        resolve({
          Data: response.data
        });
        return;
      })
      .catch(error => {
        if (!error.response) {
          reject({ Message: "API external error" });
          return;
        }
        if (!error.response.data) {
          reject({ Message: "API internal error" });
          return;
        }
        reject(error.response.data);
        return;
      });
  });
};
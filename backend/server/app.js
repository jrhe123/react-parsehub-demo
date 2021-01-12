const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

app.get("/route", (req, res, next) => {
  // 1. get parameters from req
  // 1.1 validate the parameters
  let routePath = req.query.path;
  if (!routePath) {
    return res.status(403).json({ Confirmation: "FAIL", Message: "Path is required" });
  }
  routePath = routePath.split("/").filter(item => item != '') || [];
  // 2. fetch structure data
  let filePath = path.join(__dirname, "/data.json");
  let rawData = fs.readFileSync(filePath);
  let dataJson = JSON.parse(rawData);
  // 3. validate path
  let currentLevelData = __is_validate_path(dataJson, routePath);
  if (!currentLevelData) {
    return res.json({
      Confirmation: 'FAIL',
      Message: 'Not found',
    })
  }
  // 3.1 return current level data
  currentLevelData
  return res.json({
    Confirmation: 'SUCCESS',
    Response: {
      Data: currentLevelData
    }
  })
});

// recursive search
const __is_validate_path = (json, array) => {
  if (!array.length) {
    return json.home;
  }
  let currentPath = array.shift();
  if (`${currentPath}` in json) {
    if (array.length) {
      if (!json[currentPath].children) {
        return null;
      }
      return __is_validate_path(json[currentPath].children, array);
    } else {
      let res = json[currentPath] || {};
      // remove subtree info, unnecessary data
      if (res.type == 'dir' && res.children) {
        Object.keys(res.children).map((item, index) => {
          if (res.children[item].type == 'dir' && res.children[item].children) {
            delete res.children[item].children;
          }
        })
      }
      // remove subtree info, unnecessary data
      return res;
    }
  }
}

const server = http.createServer(app);
const port = 3000;
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server: running on http://localhost:${port}`);
});
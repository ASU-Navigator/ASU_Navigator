const fs = require("fs");

const data = JSON.parse(fs.readFileSync("asu_buildings_cleaned.json", "utf-8"));

const output = data.map(row =>
  `{ code: "${row.code}", name: "${row.name}", campus: "${row.campus}" },`
).join("\n");

fs.writeFileSync("asu_buildings_list.js", output);

console.log("Done!");
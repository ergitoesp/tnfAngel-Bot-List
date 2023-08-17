const fs = require("fs");

module.exports = (filepath) => {
  if (!filepath) throw new Error("Erro");

  if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);

  const files = fs.readdirSync(filepath, { withFileTypes: true })
    .filter((entry) => !entry.isDirectory())
    .map((entry) => entry.name);

  return files;
};

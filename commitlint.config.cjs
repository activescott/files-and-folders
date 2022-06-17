const { opendirSync } = require("fs")
const { join } = require("path")

function getPackageNames() {
  const names = []
  // NOTE: using Sync because in some cases commitlint wouldn't invoke the async function :/
  const dir = opendirSync(`${__dirname}/packages`)
  let dirent = dir.readSync()
  while (dirent) {
    if (dirent.isDirectory()) {
      const pkg = require(join(dir.path, dirent.name, "package.json"))
      names.push(pkg.name)
    }
    dirent = dir.readSync()
  }
  return names
}

const RULE_ERROR = 2
const RULE_WARN = 1
const RULE_DISABLE = 0

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-empty": [RULE_ERROR, "never"],
    "scope-enum": [
      RULE_ERROR,
      "always",
      ["docs", "build", ...getPackageNames()],
    ],
    "type-enum": [RULE_ERROR, "always", ["feat", "fix", "chore", "build"]],
    "body-max-line-length": [RULE_DISABLE],
  },
}

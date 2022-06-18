const template = require("../../.releaserc-template.cjs")
const pkg = require("./package.json")
const PACKAGE_NAME = pkg.name

module.exports = template(PACKAGE_NAME)

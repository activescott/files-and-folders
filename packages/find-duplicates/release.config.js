module.exports = {
  // https://github.com/semantic-release/semantic-release/blob/beta/docs/usage/configuration.md
  branches: [
    "main",
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
}

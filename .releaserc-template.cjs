module.exports = (PACKAGE_NAME) => ({
  branches: [
    "main",
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
  repositoryUrl: "git@github.com:activescott/files-and-folders.git",
  tagFormat: PACKAGE_NAME + "@${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          // IGNORE if scope *is* empty:
          { type: "feat", release: false },
          { type: "fix", release: false },
          { type: "perf", release: false },

          // IGNORE if scope *is not* PACKAGE_NAME:
          { type: "feat", scope: `!(${PACKAGE_NAME})`, release: false },
          { type: "fix", scope: `!(${PACKAGE_NAME})`, release: false },

          // RELEASE if scope *is* PACKAGE_NAME:
          { type: "feat", scope: `${PACKAGE_NAME}`, release: "minor" },
          { type: "fix", scope: `${PACKAGE_NAME}`, release: "patch" },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
})

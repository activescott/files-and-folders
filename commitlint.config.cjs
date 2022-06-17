const { opendirSync } = require("fs")
const { join } = require("path")

function getPackageNames() {
  const names = []
  // NOTE: using Sync because in some cases commitlint wouldn't invoke the async function :/
  const dir = opendirSync(`${__dirname}/packages`)
  try {
    let dirent = dir.readSync()
    while (dirent) {
      if (dirent.isDirectory()) {
        const pkg = require(join(dir.path, dirent.name, "package.json"))
        names.push(pkg.name)
      }
      dirent = dir.readSync()
    }
  } finally {
    if (dir) dir.closeSync()
  }
  return names
}

function getPackagePrompts() {
  const promptsObj = {}
  for (let pkgname of getPackageNames()) {
    promptsObj[pkgname] = {
      description: `package ${pkgname}`,
      title: pkgname,
      emoji: "📦",
    }
  }
  return promptsObj
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
    "type-enum": [RULE_ERROR, "always", ["feat", "fix", "chore", "revert"]],
    "body-max-line-length": [RULE_DISABLE],
  },
  helpUrl:
    "https://github.com/activescott/files-and-folders/tree/main#release-process-deploying-to-npm",
  prompt: {
    settings: {},
    messages: {
      skip: ":skip",
      max: "maximum %d chars",
      min: "%d chars at least",
      emptyWarning: "can not be empty",
      upperLimitWarning: "over limit",
      lowerLimitWarning: "below limit",
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: "A new feature",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "A bug fix",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: "Chores",
            emoji: "♻️",
          },
          revert: {
            description: "Reverts a previous commit",
            title: "Reverts",
            emoji: "🗑",
          },
        },
      },
      scope: {
        description:
          "What is the scope of this change (e.g. area or package name)",
        enum: {
          docs: {
            description: "Documentation only changes",
            title: "Documentation",
            emoji: "📚",
          },
          build: {
            description:
              "Changes that affect the build system or external dependencies",
            title: "Builds",
            emoji: "🛠",
          },
          ...getPackagePrompts(),
        },
      },
      subject: {
        description:
          "Write a short, imperative tense description of the change",
      },
      body: {
        description: "Provide a longer description of the change",
      },
      isBreaking: {
        description: "Are there any breaking changes?",
      },
      breakingBody: {
        description:
          "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
      },
      breaking: {
        description: "Describe the breaking changes",
      },
      isIssueAffected: {
        description: "Does this change affect any open issues?",
      },
      issuesBody: {
        description:
          "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
}

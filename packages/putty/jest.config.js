export default {
  preset: "ts-jest/presets/default-esm-legacy",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  // NOTE: ignoring src/index.ts because jest+babel freak out about the use of ESM-only `import.meta`
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
}

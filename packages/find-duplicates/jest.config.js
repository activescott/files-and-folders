export default {
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFiles: ["./tests/support/setup.ts"],
  collectCoverageFrom: ["src/**/*.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
}

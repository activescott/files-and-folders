export default {
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "./tsconfig.jest.json",
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  setupFiles: ["./tests/support/setup.ts"],
  // NOTE: ignoring src/index.ts because jest+babel freak out about the use of ESM-only `import.meta`
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
}

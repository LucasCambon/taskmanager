module.exports = {
    // Unit tests and Integration tests
    testMatch: [
      "<rootDir>/tests/spec/**/*.spec.js",
      "<rootDir>/tests/integration/**/*.spec.js"
    ],
    
    // Directories to ignore from testing
    testPathIgnorePatterns: [
      "<rootDir>/node_modules/"
    ],
};
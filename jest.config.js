module.exports = {
    // Unit tests
    testMatch: ["<rootDir>/tests/spec/**/*.spec.js"],
    // Integration tests
    //testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
    
    // Directories to ignore from testing
    testPathIgnorePatterns: [
      "<rootDir>/node_modules/"
    ],
};
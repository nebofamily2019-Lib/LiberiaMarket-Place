// Force NODE_ENV to test to prevent database wipes
process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/config/',
    '/database/'
  ],
  transformIgnorePatterns: [
    'node_modules/sharp'
  ],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Reduce concurrency to avoid IPC/deserialization memory pressure
  maxWorkers: 1
}

process.env.NODE_ENV = 'test';

const { spawn } = require('child_process');
const path = require('path');

const jestPath = path.join(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js');

const jest = spawn('node', [
  jestPath,
  'auth.security.test.js',
  '--detectOpenHandles',
  '--forceExit'
], {
  stdio: 'inherit',
  shell: true
});

jest.on('exit', (code) => {
  process.exit(code);
});

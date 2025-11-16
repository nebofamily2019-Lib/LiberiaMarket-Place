process.env.NODE_ENV = 'test';

const { spawn } = require('child_process');
const path = require('path');

const jestPath = path.join(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js');

const jest = spawn('node', [
  '--max-old-space-size=4096',
  jestPath,
  '--runInBand',
  '--detectOpenHandles',
  '--forceExit',
  '--verbose'
], {
  stdio: 'inherit',
  shell: true
});

jest.on('exit', (code) => {
  process.exit(code);
});

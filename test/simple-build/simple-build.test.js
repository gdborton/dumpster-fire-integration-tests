const path = require('path');
const chai = require('chai');
const rimraf = require('rimraf');
const dumpsterFire = require('dumpster-fire');
const expect = chai.expect;

rimraf.sync(path.join(__dirname, './dist'));
rimraf.sync(path.join(__dirname, './.cache'));

const buildConfig = [{
  bundleGlob: '**/*.bundle.js',
  context: path.resolve(path.join(__dirname, './src')),
  outputDirectory: path.resolve(path.join(__dirname, './dist')),
  cacheLocation: path.resolve(path.join(__dirname, './.cache')),
}];

describe('simple-build', () => {
  it('builds without error', () => {
    return dumpsterFire(buildConfig).then(() => {
      expect(require('./dist/index.bundle.js')).to.equal(3);
    });
  });
});

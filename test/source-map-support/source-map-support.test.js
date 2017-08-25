const path = require('path');
const chai = require('chai');
const dumpsterFire = require('dumpster-fire');
const rimraf = require('rimraf');

rimraf.sync(path.join(__dirname, './dist'));
rimraf.sync(path.join(__dirname, './.cache'));

const expect = chai.expect;
require('source-map-support').install();

const buildConfig = [{
  bundleGlob: '**/*.bundle.js',
  context: path.resolve(path.join(__dirname, './src')),
  outputDirectory: path.resolve(path.join(__dirname, './dist')),
  cacheLocation: path.resolve(path.join(__dirname, './.cache')),
}];

describe('source-map-support', () => {
  it('points to the correct file/line when an error is thrown', function(){
    this.timeout(60000);
    return dumpsterFire(buildConfig).then(() => {
      try {
        require('./dist/index.bundle.js'); // this should throw.
      } catch (e) {
        expect(e.stack.includes('index.bundle.js:8:6')).to.equal(true);
      }
    });
  });
});

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const mkdirp = require('mkdirp');
const dumpsterFire = require('dumpster-fire');
const rimraf = require('rimraf');
const glob = require('glob');
const expect = chai.expect;

rimraf.sync(path.join(__dirname, './dist'));
rimraf.sync(path.join(__dirname, './.cache'));

/**
 * We're going to build a very large project here, and write it to disk.
*/
const entryFiles = 5;
const modules = 2000; // twenty thousand

const projectRoot = path.resolve(path.join(__dirname, './src'));
const entryFileLocation = path.join(projectRoot, 'bundles');
const fileCreationPromises = [];

if (glob.sync(path.join(projectRoot, '**/*.js')).length < entryFiles + modules) {
  console.time('building src files');
  rimraf.sync(path.join(__dirname, './src'));
  mkdirp.sync(projectRoot);
  mkdirp.sync(entryFileLocation);
  for (let createdFiles = 0; createdFiles < modules; createdFiles++) {
    const content = createdFiles === 0 ? 'console.log("I am zero.")' : `require('./${createdFiles - 1}.js');`;
    fs.writeFileSync(path.join(projectRoot, `${createdFiles}.js`), content);
  }

  for (let createdEntryFiles = 0; createdEntryFiles < entryFiles; createdEntryFiles++) {
    const entryTargetLocation = path.join(entryFileLocation, `${createdEntryFiles}.bundle.js`);
    const target = createdEntryFiles === 0 ? modules - 1 : Math.floor(Math.random() * modules);
    const content = `require('../${target}.js');`;
    fs.writeFileSync(entryTargetLocation, content);
  }
  console.timeEnd('building src files');
}

const buildConfig = [{
  bundleGlob: '**/*.bundle.js',
  context: path.resolve(path.join(__dirname, './src')),
  outputDirectory: path.resolve(path.join(__dirname, './dist')),
  cacheLocation: path.resolve(path.join(__dirname, './.cache')),
}];
/**
 * This block only works serially. The first test is without a cache, the second is with the cache.
*/
let firstTestTiming;
describe('dumpster-fire building a large project', function() {
  this.timeout(60000); // 60 seconds.
  it('builds quickly.', function () {
    const start = Date.now();
    return dumpsterFire(buildConfig).then(() => {
      firstTestTiming = Date.now() - start;
      const targetTiming = 40000;
      const msg = `Expected build (${firstTestTiming}ms) to be less than ${targetTiming}ms.`;
      expect(firstTestTiming).to.be.below(targetTiming, msg);
    });
  });

  it('rebuilds more quickly.', function() {
    const start = Date.now();
    return dumpsterFire(buildConfig).then(() => {
      const timing = Date.now() - start;
      const msg = `Expected second build (${timing}ms) to be less than ${Math.round(firstTestTiming * 0.5)}ms.`;
      expect(timing).to.be.below(firstTestTiming * 0.5);
    });
  });
});

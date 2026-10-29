module.exports = { extends: null, ...require('./package.json').build, extraResources: [{from:'worker/dist/ble-worker',to:'worker'}], directories:{output:'release-local'} }

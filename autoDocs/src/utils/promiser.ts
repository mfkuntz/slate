const bluebird = require('bluebird');

export const fsAsync = bluebird.promisifyAll(require('fs'));
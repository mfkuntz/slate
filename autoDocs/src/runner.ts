import * as fs from 'fs';
import * as path from 'path';

import { FileParser } from './fileParser';

import { authHelper } from './auth';

export default class Runner {

  public static dirName: string = '../../source/';

  public run() {
    const dirPath = path.join(__dirname, Runner.dirName);

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    const promises = [];

    // TODO run this BEFORE the others, not in parallel
    promises.push(authHelper.authenticate());

    fs.readdirSync(dirPath).forEach((file: string) => {
      if (file !== 'index.js' && file.match(/\.md$/) !== null) {
        const parser = new FileParser(file);
        promises.push(parser.run());
      }
    });

    return Promise.all(promises)
      .then(() => console.log('DONE!'))
      .catch((err) => console.error(err));
  }

}


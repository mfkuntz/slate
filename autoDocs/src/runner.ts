import * as fs from 'fs';
import * as path from 'path';

import { FileParser } from './fileParser';

export default class Runner {

  public static dirName: string = '../../source/';

  public run() {
    const dirPath = path.join(__dirname, Runner.dirName);

    fs.readdirSync(dirPath).forEach((file: string) => {
      if (file !== 'index.js' && file.match(/\.md$/) !== null) {
        const parser = new FileParser(file);
        parser.run();
      }
    });
  }

}


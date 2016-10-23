import { fsAsync } from './utils/promiser';
import * as path from 'path';

const _ = require('lodash');
const { lexer } = require('marked');
const curlConverter = require('curlconverter/util');

import Curl from './models/curl';
import DocModel from './models/docModel';

import Runner from './runner';
import TestRunner from './testRunner';

export class FileParser {

  private filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(__dirname, Runner.dirName, fileName);
  }

  public run() {
    return fsAsync.readFileAsync(this.filePath, 'utf8')
      .then(this.handleFileString.bind(this));
  }

  private handleFileString (data: string) {
      const tokens = lexer(data);

      const curls = this.getCurlObjects(tokens);

      const codeBlocks = this.getCodeBlocks(tokens);

      if (curls.length !== codeBlocks.length) {
        throw new Error(`Curls and Codeblocks are different lengths!
          curls: ${curls.length} | codeBlocks: ${codeBlocks.length}
        `);
      }

      const results = [];
      for (let i = 0; i < curls.length; i++) {
        const curl = new Curl(curls[i]);

        const doc = new DocModel();
        doc.curl = curl;
        doc.format = codeBlocks[i];

        results.push(doc);
      }

      // TODO get promise and pass it back up the chain
      const promises = results.map((result) => {
        const runner = new TestRunner(result);
        return runner.run();
      });

      return Promise.all(promises);
  }

  private getCurlObjects(tokens: any) {
    return _.chain(tokens)
          .filter(item => (item.type === 'code' && item.lang === 'shell'))
          .map(item => item.text)
          .map((str) => {
            let lines = str.split('\n');
            lines = _.filter(lines, line => line.indexOf('#') === -1);
            return lines.join('');
          })
          .filter(line => line) // no empty lines
          .map(item => curlConverter.parseCurlCommand(item))
          .value();
  }

  private getCodeBlocks(tokens: any) {
    return _.chain(tokens)
          .filter(item => (item.type === 'code' && item.lang === 'json'))
          .map(item => item.text)
          .filter(item => item && item.substring(0, 2) !== '//') // no empty lines or comments
          .map(str => JSON.parse(str))
          .value();
  }

}

import * as fs from 'fs';
import * as path from 'path';

import { FileParser } from './fileParser';
import TestRunner from './testRunner';
import DocModel from './models/docModel';
import { authHelper } from './auth';

import * as Promise from 'bluebird';

import * as _ from 'lodash';

export default class Runner {

  public static dirName: string = '../../source/';

  public init() {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    return authHelper.authenticate();
  }

  public run() {
    const dirPath = path.join(__dirname, Runner.dirName);

    const fileResultTasks = _.chain(fs.readdirSync(dirPath))
      .map((file: string) => {
        if (file.match(/\.md$/) === null) {
          return null;
        }

        const parser = new FileParser(file);
        return parser.run();
      })
      .filter(task => task) // truthy, not null
      .value();


    const fileResults = [];
    const results = [];
    return this.settleAll(fileResultTasks)
      .each((result: Promise.Inspection<DocModel[]>) => {
        if (result.isFulfilled()) {
          fileResults.push(result.value());
        } else {
          console.error(result.reason());
        }
      })
      .then(() => this.runAllTests(fileResults).bind(this))
      .each((result: Promise.Inspection<any>) => {
        if (result.isFulfilled()) {
          results.push(result.value());
        } else {
          results.push(result.reason());
        }
      })
      .then(() => this.report(results))
      .then(() => console.log('DONE!'))
      .catch((err) => console.error(err));

  }



  private settleAll(promises) {
    return Promise.all(promises.map(function(promise) {
        return Promise.resolve(promise).reflect();
    }));
  }

  private runAllTests(fileResults: DocModel[][]) {
    const flatFileResults = _.chain(fileResults)
      .reduce((result: any[], item) => result.concat(item))
      .value();

    const testRunners = _.map(flatFileResults, docModel => new TestRunner(docModel).run());
    return this.settleAll(testRunners);
  }

  private report(results: any[]) {
    console.log('---');
    _.forEach(results, (result) => {
      console.log(result);
      console.log('---');
    });

  }

}


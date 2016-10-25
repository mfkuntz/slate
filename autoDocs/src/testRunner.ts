import DocModel from './models/docModel';

import * as request from 'superagent';
import * as assert from 'assert';
import * as _ from 'lodash';

import { authHelper } from './auth';

export default class TestRunner {

  private doc: DocModel;

  constructor(doc: DocModel) {
    this.doc = doc;
  }

  public run() {
    const doc = this.doc;

    return request(doc.curl.method, doc.curl.url)
      .set('Accept', 'application/json')
      .set('Authorization', authHelper.Token)
      .set('grant_type', 'bearer')
      .then(
        this.responseSuccess.bind(this),
        this.responseError.bind(this)
      );

  }

  private responseSuccess(res) {
    if (res.status > 200) {
      throw new Error(`Response Error!
      URL: ${this.doc.curl.url} | status: ${res.status}
      `);
    }

    const { body } = res;

    let item = {};
    let doc = {};
    if (this.doc.isArray()) {
      assert(_.isArray(body));
      // TODO make sure spec is not empty before this 
      // assertion is run
      assert(body.length > 0);

      item = body[0];
      doc = this.doc.format[0];
    } else {
      // check object things too?
      item = body;
      doc = this.doc.format;
    }
    // allow empty response

    const itemKeys = Object.keys(item);
    const docKeys = Object.keys(doc);

    assert(_.isEqual(itemKeys, docKeys));

    return `Pass: ${this.doc.curl.url}`;
  }

  private responseError(err) {
    const errorMessage = JSON.stringify(err, null, 2);

    if (err.status && err.status > 200) {
      throw new Error(`Response Error!
      URL: ${this.doc.curl.url} | status: ${err.status}
      response: 
      ${errorMessage}
      `);
    }

    throw new Error(errorMessage);
  }

}
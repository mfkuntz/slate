import Curl from './curl';
const _ = require('lodash');

export default class DocModel {
  public curl: Curl;
  public format: any;

  public isArray() {
    return _.isArray(this.format);
  }
}

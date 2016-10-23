const config = require('../config.json');

export default class Curl {
  public url: string;
  public method: string;
  public headers: any;

  constructor(data: any) {
    this.url = data.url.replace(config.urlReplace.src, config.urlReplace.value);
    this.method = data.method;
    this.headers = data.headers; // validation?
  }
}

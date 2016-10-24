import * as request from 'superagent';

const config = require('./config.json'); // tslint:disable-line

export class Auth {
    public Token: string;
    private url: string;

    public authenticate() {
        this.url = `${config.urlReplace.value}${config.auth.route}`;

        return request(config.auth.verb, this.url)
            .set('Accept', 'application/json')
            .send('grant_type=password')
            .send(`username=${config.auth.username}`)
            .send(`password=${config.auth.password}`)
            .then(
                this.requestSuccess.bind(this),
                this.requestError.bind(this)
            );

    }

    private requestSuccess(res) {
      if (res.status > 200) {
        throw new Error(`Response Success w/ bad status!
        URL: ${this.url} | status: ${res.status}
        `);
      }

      const { body } = res;

      const { token_type, access_token } = body; // tslint:disable-line:variable-name

      this.Token = `${token_type} ${access_token}`;
      console.log(`TOKEN: ${this.Token}`);
    }

    private requestError(err) {
      const errorMessage = JSON.stringify(err, null, 2);

      if (err.status && err.status > 200) {
        throw new Error(`Response Error!
        URL: ${this.url} | status: ${err.status}
        ========================================
        Full- ${errorMessage}
        `);
      }

      throw new Error(errorMessage);
    }
}

export const authHelper = new Auth();

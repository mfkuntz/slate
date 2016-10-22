const fs = require('fs');
const _ = require('lodash');
const { lexer } = require('marked');

const curlConverter = require('curlconverter/util');

const dirName = './source/';

function handleFile(file) {
  fs.readFile(`${dirName}${file}`, 'utf8', (err, data) => {
    if (err) throw new Error(err);

    const tokens = lexer(data);

    const curls = _.chain(tokens)
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

    const codeBlocks = _.chain(tokens)
        .filter(item => (item.type === 'code' && item.lang === 'json'))
        .map(item => item.text)
        .map(str => JSON.parse(str))
        .value();



    curls.forEach(item => console.log(JSON.stringify(item, null, 2)));
    console.log('__________________________');

    codeBlocks.forEach(item => console.log(JSON.stringify(item, null, 2)));
  });
}

fs.readdirSync(dirName).forEach((file) => {
  if (file !== 'index.js' && file.match(/\.md$/) !== null) {
    handleFile(file);
  }
});




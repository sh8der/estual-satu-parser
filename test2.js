const request = require('request');
const fs = require('fs');

var host = '45.81.138.244';
var port = '51991';
var login = 'C1Kd8Xdye4';
var password = 'ZzDKoa2ZDm';
/* 45.81.138.244:51991:C1Kd8Xdye4:ZzDKoa2ZDm
94.158.189.42:61925:C1Kd8Xdye4:ZzDKoa2ZDm */

var headers = {
  'User-Agent': 'Node js'
};

var options = {
  url: 'https://whoer.net/ru',
  proxy: `http://${login}:${password}@${host}:${port}`,
  // proxy: `http://${host}:${port}`,
  method: 'GET',
  headers: headers,
  strictSSL: false
};


function callback(err, resp, body) {
  if (!err && resp.statusCode == 200) {
    fs.writeFileSync('proxy-ip.html', body);
  } else {
    console.log(err);
  }
}

request(options, callback);
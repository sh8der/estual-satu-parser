const request = require('request');

const headers = {
	'User-Agent': 'Node js - sh8der'
};

let opt = {
	method: 'GET',
	headers: headers,
	strictSSL: false
};

function req(_extOpt) {
	let extOpt = _extOpt;
	return new Promise(function (resolve, reject) {
		let options = Object.assign(opt, extOpt);
		request(options, (err, resp, body) => {
			if (err) return reject(err);
			if (!err && resp.statusCode == 200) {
				resolve(body);
			} else {
				console.log(err);
				reject(err);
			}
		});
	});
}

module.exports.request = req;
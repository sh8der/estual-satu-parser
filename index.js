const fs = require("fs");
// const axios = require("axios-https-proxy-fix");
const axios = require("axios-proxy-fix");
// const axios = require("axios");
const request = require("request");
const cheerio = require("cheerio");
const queue = require('async/queue');
const parsePages = require('./page.js');
const httpsProxyAgent = require('https-proxy-agent');




const productListPageUrl = "https://estual.satu.kz/product_list";
let allProductLinks = [];

let proxyList = [
	"78.38.111.243:8080",
	"62.24.109.15:50877",
	"138.197.151.223:8118",
	"45.55.9.218:8080",
	"159.138.20.247:80",
	"169.57.1.85:80",
	"119.81.71.27:8123",
	"191.103.254.125:51869",
	"178.167.92.234:53281",
	"119.81.199.82:8123",
	"118.69.50.154:80",
	"5.252.161.48:8080",
	"139.59.53.106:8080",
	"162.243.108.129:3128",
	"138.197.157.44:8080",
	"139.59.64.9:8080",
	"188.166.83.20:3128",
	"138.197.157.60:3128",
	"138.197.204.55:8080",
	"101.178.215.185:8080",
]

let getBrandFilterID = html => {
	const $ = cheerio.load(html);
	let idList = [];
	$(".cs-manufactures-list__item a").each((i, a) => {
		idList.push($(a).attr('href').split("=")[1]);
	})
	return idList.map(e => "bss0=" + e).join("&");
};

let getRandomInt = max => {
	return Math.floor(Math.random() * Math.floor(max));
}

let q = queue(function (link, callback) {
	let proxyNumber = getRandomInt(proxyList.length);
	// let proxy = {
	// 	host: proxyList[proxyNumber].split(':')[0],
	// 	port: proxyList[proxyNumber].split(':')[1],
	// };
	let proxy = { proxy: { host: proxyList[proxyNumber].split(':')[0], port: proxyList[proxyNumber].split(':')[1] } }
	// link = link.replace('https://', 'http://');
	// console.log(link);
	// var agent = new httpsProxyAgent(`http://${proxyList[proxyNumber]}`);
	// console.log(agent);
	// var config = {
		// url: link,
		// method: 'get',
		// httpsAgent: agent
	// }
	// axios.request(config).then(r => {
		axios.get(link, /* {timeout: 3600} */proxy).then(r => {
		$ = cheerio.load(r.data);
		$('.cs-product-gallery__list .cs-product-gallery__item .cs-product-gallery__title a').each((i, e) => {
			let t = $(e).attr('href');
			console.log(t)
			allProductLinks.push(t);
		})
		// setTimeout(()=>callback(),2000);
		
		callback();
	});
}, 4);

q.drain(function () {
	console.log('all items have been processed');
	// console.log(allProductLinks);
	fs.writeFileSync('allLinksProduct.txt', allProductLinks.join('\n'));
	parsePages(allProductLinks);
});

// assign an error callback
q.error(function (err, task) {
	console.error('task experienced an error');
});

function requestGetHtml(url) {
	request(url, function (error, response, body) {
		return body;
	});
}

(async () => {
	// let productPage = requestGetHtml(productListPageUrl);
	let productPage = await axios.get(productListPageUrl);
	let idFilterList = getBrandFilterID(productPage.data);
 
	productPage = await axios.get(productListPageUrl + "?" + idFilterList);
	let $ = cheerio.load(productPage.data);
	let productPageCount = Number($('.b-pager__dotted-link').next().text());
	for (let i = 1; i <= productPageCount; i++) {
		// console.log(proxy);
		q.push(`${productListPageUrl}/page_${i}?${idFilterList}`);
	}

})();
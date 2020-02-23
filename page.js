const fs = require("fs");
const chalk = require('chalk');
const log = console.log;
const cheerio = require("cheerio");
const queue = require("async/queue");
const getHtml = require('./getHtml.js');
const delay = require('./delay.js');

const proxyList = [
	"45.81.138.244:51991:C1Kd8Xdye4:ZzDKoa2ZDm",
	"94.158.189.42:61925:C1Kd8Xdye4:ZzDKoa2ZDm",
	"185.233.201.87:9102:u2weBm:74qeay"
];

let i = 0;
let parseCount = 0;
let proxyListCount = proxyList.length;
let data = [];
let curProdId = '';
let mathTable = {
	"Производитель": "manufacturer",
	"Страна производитель": "countryManufacture",
	"Вид парфюмерной продукции": "typePP",
	"Тип аромата": 'flavorType',
	"Начальная нота": "topNote",
	"Нота сердца": "heartNote",
	"Конечная нота": "finalNote",
	"Классификация": "classification",
	"Год выпуска": "year",
	"Объем": "bulk"
}
let prodAttr = {}

let getImgList = ($, selector, glueChar) => {
	let links = [];
	let id = '';
	$(selector).each((i, e) => {
		id = $(e).attr('data-subscribe').split('"')[1];
		links.push(`https://images.kz.prom.st/${id}_w640_h640.jpg`);
	})
	return links.join(glueChar);
}

let q = queue(function (_data, callback) {

	let extOpt = {
		url: _data.url,
		proxy: _data.proxy,
	}
	getHtml.request(extOpt)
		.then(html => {
			let $ = cheerio.load(html);
			curProdId = $("h1.cs-title .cs-online-edit__link").attr("data-edit-id");
			let attrName = "";
			let attrVal = "";
			prodAttr = {
				"manufacturer": "",
				"countryManufacture": "",
				"typePP": "",
				'flavorType': "",
				"topNote": "",
				"heartNote": "",
				"finalNote": "",
				"classification": "",
				"year": "",
				"bulk": ""
			}

			temp = {
				"id": curProdId,
				"name": $("h1.cs-title .cs-title__text").text().replace(/\s\d+|\(\d.*.\)/gi, ''),
				"tag": $(".cs-product__container .cs-product__label").text(),
				"price": $(".cs-product__container .b-product-cost__price").text().replace(/\D+/g, ""),
				"imgList": getImgList($, '.cs-product__visual img', ', '),
				"desc": $(".cs-tab-list .b-user-content").html()
			};

			$('.b-product-info tbody tr').first().remove(); // remove tr with TH
			$('.b-product-info tbody tr').each((i, e) => {
				attrName = $(e).find('td').first().text().trim(); // add current product attr name
				attrVal = $(e).find('td').last().text().trim(); // add current product attr value
				if (attrName == "Объем") {
					attrVal = attrVal.replace(/\D+\d*/gi, '');
				}
				prodAttr[mathTable[attrName]] = attrVal;
				temp = Object.assign(temp, prodAttr);
			})
			// data.push(temp);
			fs.appendFile('data.json', `\n${JSON.stringify(temp)},`, err => {
				if (err) throw err;
				// log(chalk.green('Файл обновлён...'));
			})
			parseCount++;
			log(
				chalk.black.bgBlue(parseCount),
				'[' + chalk.blue(extOpt.proxy.split('@')[1].split(':')[0]) + ']',
				chalk.green('Обработан продукт:', temp.name)
			);
			callback();
		})
		.catch(err => console.warn(chalk.red(err)));
}, 5);

q.drain(function () {
	log(chalk.black.bgGreen("Все очереди отработаны"));
	// fs.writeFileSync('data.json', JSON.stringify(data));
	fs.appendFile('data.json', ']', err => {
		if (err) throw err;
		log(chalk.green('Файл обновлён...'));
	});
});

q.error(function (err, task) {
	console.error("task experienced an error");
});

let startParsePages = links => {
	links.forEach(async link => {
		await delay(500, 1000);
		i = (i > proxyListCount - 1) ? 0 : i;
		let currentProxy = proxyList[i];
		[host, port, login, password] = currentProxy.split(':');
		let data = {
			url: link,
			proxy: `http://${login}:${password}@${host}:${port}`
		};
		q.push(data);
		i++;
	});
}

// module.exports = startParsePages;
fs.readFile('allLinksProduct.txt', 'utf8', function (err, contents) {
	let links = contents.split('\n');
	fs.writeFileSync('data.json', '[');
	startParsePages(links.slice(0, 100));
});

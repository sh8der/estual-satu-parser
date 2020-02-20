const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const queue = require("async/queue");

let links = [
	"https://estual.satu.kz/p64233084-blue-seduction-for.html",
	"https://estual.satu.kz/p71214075-miraculum-pani-walewska.html",
	"https://estual.satu.kz/p64232966-her-secret-antonio.html",
	"https://estual.satu.kz/p64232996-antonio-banderas-blue.html",
	"https://estual.satu.kz/p67777234-the-golden-secret.html",
	"https://estual.satu.kz/p64236542-the-secret-temptation.html",
	"https://estual.satu.kz/p64237888-blue-seduction-for.html"
];

let data = [];
let curProdId = '';
let curentParentProdId = '';
let isVariable = '';
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

let q = queue(function (link, callback) {
	axios.get(link, {timeout: 3600}).then(r => {
		let $ = cheerio.load(r.data);
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
			"name": $("h1.cs-title .cs-title__text").text().replace(/\s\d+/gi, ''),
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
		console.log('Обработан продукт:', temp.name);
		data.push(temp);
		// setTimeout(()=>callback(),2000);
		callback();
	});
}, 4);

q.drain(function () {
	console.log("Все очереди отработаны");
	fs.writeFileSync('data.json', JSON.stringify(data));
});

q.error(function (err, task) {
	console.error("task experienced an error");
});

let startParsePages = links => {
	links.forEach(e => {
		q.push(e);
	});
}

module.exports = startParsePages;
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
let getImgList = ($, selector) => {
	let links = [];
	let id = '';
	$(selector).each((i, e) => {
		id = $(e).attr('data-subscribe').split('"')[1];
		links.push(`https://images.kz.prom.st/${id}_w640_h640.jpg`);
	})
	return links.join('|');
}
let q = queue(function (link, callback) {
	axios.get(link).then(r => {
		$ = cheerio.load(r.data);

		temp = [];
		temp.push($("h1.cs-title .cs-online-edit__link").attr("data-edit-id")); // id
		temp.push($("h1.cs-title .cs-title__text").text()); // h1
		temp.push($(".cs-product__container .cs-product__label").text()); // tag
		temp.push($(".cs-product__container .b-product-cost__price").text().replace(/\D+/g, "")); // price
		temp.push(getImgList($, '.cs-product__visual img')); // img lits links
		temp.push($(".cs-tab-list .b-user-content").html()); // html description

		$('.b-product-info tbody tr').first().remove(); // remove tr with TH
		$('.b-product-info tbody tr').each((i, e) => {
			temp.push($(e).find('td').first().text().trim()); // add current product attr name
			temp.push($(e).find('td').last().text().trim()); // add current product attr value
		})

		data.push({...temp}); // convert arr to obj and push to global data arr 
		callback();
	});
}, 10);

q.drain(function () {
	console.log("Все очереди отработаны");
	// console.log(data);
	fs.writeFileSync('data.json', JSON.stringify({...data}));
});

q.error(function (err, task) {
	console.error("task experienced an error");
});

links.forEach(e => {
	q.push(e);
});

const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const queue = require('async/queue');

const productListPageUrl = "https://estual.satu.kz/product_list";
let allProductLinks = [];

let getBrandFilterID = html => {
	const $ = cheerio.load(html);
	let idList = [];
	$(".cs-manufactures-list__item a").each((i, a) => {
		idList.push($(a).attr('href').split("=")[1]);
	})
	return idList.map(e => "bss0=" + e).join("&");
};

let q = queue(function(link, callback) {
	axios.get(link).then(r => {
		$ = cheerio.load(r.data);
		let tempData = []
		$('.cs-product-gallery__list .cs-product-gallery__item .cs-product-gallery__title a').each((i,e) => {
			let t = $(e).attr('href');
			console.log(t)
			allProductLinks.push(t);
		})
		callback();
	});
}, 10);

q.drain(function() {
		console.log('all items have been processed');
});

// assign an error callback
q.error(function(err, task) {
		console.error('task experienced an error');
});

(async()=>{
	let productPage = await axios.get(productListPageUrl);
	let idFilterList = getBrandFilterID(productPage.data);

	productPage = await axios.get(productListPageUrl + "?" + idFilterList);
	let $ = cheerio.load(productPage.data);
	let productPageCount = Number($('.b-pager__dotted-link').next().text());
	for (let i = 1; i <= productPageCount; i++) {
		q.push(`${productListPageUrl}/page_${i}?${idFilterList}`);
	}
	
})();
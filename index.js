const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const productListPageUrl = "https://estual.satu.kz/product_list";

let getBrandFilterID = html => {
	const $ = cheerio.load(html);
	let idList = [];
	$(".cs-manufactures-list__item a").each((i, a) => {
		idList.push($(a).attr('href').split("=")[1]);
	})
	return productListPageUrl + "/page_1?" + idList.map(e => "bss0=" + e).join("&");
};

(async()=>{
	let productPage = await axios.get(productListPageUrl);
	console.log( getBrandFilterID(productPage.data) );
})();
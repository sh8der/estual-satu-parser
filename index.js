const fs = require('fs');
const axios = require("axios");
const cherio = require("cheerio");
const productListPage = "https://estual.satu.kz/product_list";

let getBrandFilterID = pageHtml => {
	const $ = cherio.load(pageHtml);
	IDList = [];
	$(".cs-manufactures-list__item a").forEach(a =>
		IDList.push(a.href.split("=")[1])
	);
};

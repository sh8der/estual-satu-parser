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

let q = queue(function(link, callback) {
	axios.get(link).then(r => {
    $ = cheerio.load(r.data);
    satuProductID = $('h1.cs-title .cs-online-edit__link').attr('data-edit-id');
    console.log(satuProductID);
    data.push(satuProductID);
	});
}, 4);

q.drain(function() {
  console.log("Все очереди отработаны");
  console.log(data);
});

q.error(function(err, task) {
	console.error("task experienced an error");
});

links.forEach(e => {
	q.push(e);
});

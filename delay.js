const getRandomTimeMs = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
}

const delay = (min, max) => {
	let ms = (min && max) ? getRandomTimeMs(min, max) : 1000;
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = delay;
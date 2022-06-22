require('dotenv').config();

exports.handler = async () => {
	console.log('🤖 starting DCA bot...');

	// initialize
	const { default: axios } = require("axios");
	const moment = require('moment');
	const { CoinbasePro } = require('coinbase-pro-node');
	const auth = {
		apiKey: process.env.COINBASE_KEY,
		apiSecret: process.env.COINBASE_SECRET,
		passphrase: process.env.COINBASE_PASSPHRASE,
		useSandbox: false
	}
	
	const client = new CoinbasePro(auth);

	const products = process.env.PRODUCTS.split(',');

	// cycle through PRODUCTS, check change from 24hr high, purchase if specified criteria is met
	for (product of products) {
		try {
			let fills = await client.rest.fill.getFillsByProductId(product);
			let lastFill = fills.data[0];
			if (moment(lastFill.created_at).add(process.env.HOURS, 'hours') > moment()) {
				console.log('Latest ' + product + ' fill was less than ' + process.env.HOURS + ' hours ago, skipping...');
			} else {
				console.log(product + ' - checking 24 hr stats...');
				let stats = await client.rest.product.getProductStats(product);
				let changePercentage = 1 - (stats.last / stats.high);
				console.log('Last price: ', stats.last);
				console.log('24 hr high: ', stats.high);
				console.log('Change % from 24 hr high: ', changePercentage);
				if (changePercentage >= process.env.LOW_CHANGE && changePercentage < process.env.HIGH_CHANGE) {
					await purchase(product, process.env.LOW_DOLLARS, changePercentage);
				} else if (changePercentage >= process.env.HIGH_CHANGE) {
					await purchase(product, process.env.HIGH_DOLLARS, changePercentage);
				} else {
					console.log('Decided not to buy ' + product);
				}
			}
		} catch (e) {
			console.log('Error occurred:', e);
			await sendSlackNotification('❗️ Error trying to purchase assets, account balance may need to be refilled.');
		}

		// send slack notification to SLACK_LINK
		async function sendSlackNotification (message) {
			let response = await axios.post(process.env.SLACK_LINK, { text: message });
		}

		// purchases an asset
		async function purchase (product, funds, changePercentage) {
			let orderResponse = await client.rest.order.placeOrder({
				type: "market",
				side: "buy",
				product_id: product,
				funds: funds
			});
			console.log('💸 Purchased ' + product);
			console.log('⏰ Waiting 5s for order to be filled...');
			await timeout(5000);
			let postOrderFills = await client.rest.fill.getFillsByProductId(product);
			let price = postOrderFills.data[0].price;
			await sendSlackNotification("Purchased " + product + "($" + funds + "). " + product + " Change Percentage: " + Math.trunc(changePercentage * 100) + "%. Fill Price: $" + price);
		}

		function timeout(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
	}
}

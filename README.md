# 🤖 DCA-BOT
DCA-BOT is a serverless javascript function app that can be deployed to AWS Lambda or other serverless providers to take advantage of a dollar-cost average purchasing strategy, which buys when the asset has dipped below a specified threshold from the 24 hour high. It currently only works with coinbase pro and USD-based products. It never sells assets.

## Usage
The bot checks current prices and makes purchasing decisions everytime it is run, then it exits. If you'd like to run the bot at scheduled intervals (IE 15 minutes), you can set up a cron job in Amazon EventBridge. The bot can be run via `npm start`.

## Local Installation
1. `npm install`

2. You must specify the following .env variables for the function to work properly.

`HIGH_DOLLARS=20`
This is the amount you'd like to invest when the 'HIGH' trigger is hit

`LOW_DOLLARS=10`
This is the amount you'd like to invest when the 'LOW' trigger is hit

`HIGH_CHANGE=0.2`
This specifies the target change from 24hr high, which is the 'HIGH' trigger. IE 20% dip from the 24 hour high.

`LOW_CHANGE=0.1`
This specifies the target change from 24hr high, which is the 'LOW' trigger. IE 10% dip from the 24 hour high.

`PRODUCTS=ETH-USD,SOL-USD,LINK-USD`
This specifies the assets to purchase.

`SLACK_LINK=https://hooks.slack.com/services/`
Slack webhook link to send notifications to

`COINBASE_KEY=aaa`
Coinbase pro api key

`COINBASE_SECRET=bbb`
Coinbase pro api secret

`COINBASE_PASSPHRASE=ccc`
Coinbase pro api passphrase

`HOURS=24`
IE if ETH-USD is purchased 12 hours ago, it will not try to purchase ETH-USD again for another 12 hours. This is a mandatory wait period that applies after a particular asset is purchased.



## Installation on AWS Lambda with 15 minute trigger
1. `git clone https://github.com/amplicity/dca-bot.git`
2. `zip -r deploy-to-lambda.zip .`
3. Navigate to 'Lambda' from AWS, click 'Create Function'
4. Under 'Author from scratch', specify a 'Function name', and the 'Runtime' should be Node.js 16.x. Architecture should be x86_64, click 'Create function' to save
5. Click 'Configuration'
6. From the left, click 'Environment variables'
7. Populate the environment variables specified in the installation section above.
8. Click 'code' from the top nav bar
9. Choose 'Upload from' and select '.zip'
10. You can test by choosing 'Test', and leaving the arguments as-is.
11. Choose 'Configuration', and then 'Triggers', 'Add trigger'.
12. Choose 'EventBridge'
13. This allows you to specify when dca-bot runs. You can specify a 'rule name', a 'rule description', and then provide a cron pattern via 'Schedule expression'. IE every 15 minutes would be `cron(0/15 * * * ? *)`

## Warning
Use this bot responsibly and at your own risk. I take no responsibility for any actions resulting from the usage of this application. You may turn the 'sandbox' to `true` within index.js if you'd like to test the application out before using live api keys. The sandbox supports fewer products than production coinbase, but `BTC-USD` is supported.

## Support
Send crypto my way if you like what I build! Send ethereum-based crypto to `amplicity.eth`

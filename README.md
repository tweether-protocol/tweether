# tweether

## Install

Clone, cd into directory.

Run: `npm install`

## Testing

Run: `npm run test`

## Compile

Run: `npm run build`

## Linting

Solidity: `npm run lint:sol`
Javascript: `npm run lint:js`

## Chainlink Oracle

In order to deploy the `OracleClient` you'll have to add the governance contract address. Only that address can call the node.

The Chainlink oracle should only respond to requests coming from the Tweether Governance protocol. You can update this with the following command in your database.

`update initiators set requesters = '0x0000000000000000000000000000000000000000' where job_spec_id = 'job-id-of-tweet-sender';`

Instead of having to add new jobs everytime you go to test something new. Replace the burn address (0x00...) with the address of the requester. This should always been the governance address. 

## Integration test

After running the tests above, to test everything is working, here's what you do:
Update `send-tweet.js` to have a new status.
You'll need your chainlink oracle and external adapter set up. This will set your account as the governance contract. 
This will mock it that you are the governance contract.
```bash
truffle migrate --reset --network kovan
truffle exec scripts/fund-oracle-client.js --network kovan
truffle exec scripts/send-tweet.js --network kovan
```
And you should get a successful tweet send from the contract. 

# Current Twitter Oracle Listing

[View on market.link](https://market.link/jobs/56b8f668-a3bb-4344-b3b0-d3bfd548ce2e)

[Current Twitter account associated](https://twitter.com/TweethTweet)
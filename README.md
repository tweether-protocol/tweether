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

The Chainlink oracle should only respond to requests coming from the Tweether Governance protocol. You can update this with the following command in your database.

`update initiators set requesters = '0x0000000000000000000000000000000000000000' where job_spec_id = 'f2052265-1c7e-4239-a773-0e619b70eb4b';`

Instead of having to add new jobs everytime you go to test something new. Replace the burn address (0x00...) with the address of the requester. 


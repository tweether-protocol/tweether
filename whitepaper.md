Tweether

Structure: [https://medium.com/the-capital/how-to-write-a-white-paper-for-your-blockchain-project-a-complete-guide-660ca52372a2](https://medium.com/the-capital/how-to-write-a-white-paper-for-your-blockchain-project-a-complete-guide-660ca52372a2)

Alex Roan

Patrick Collins

September 29, 2020

Organization repo: https://github.com/tweether-protocol

- Abstract
  - Something about on-chain governance
  - Blockchain oracles
  - LP ERC20 tokens
  - NFT
- Problem
  - Democratize tweeting from a single twitter account
  - An on-chain ecosystem that facilitates merit based tweeting
  - Verified on-chain voting by participants and stakeholders within the system
- Solution
  - Oracle
    - Chainlink External Adapter
    - Whitelist
    - Cost of an oracle in LINK
      - This means our gov needs LINK
  - Gov protocol
    - ERC20 token \$TWE - for participating in the protocol
    - Likely? - ERC721 are created Tweet submissions
    - Needs to maintain a supply of LINK, whilst participation in submitting and voting requires \$TWE
    - Therefore, external operations:
      - FUND LINK
        - Details / Equation
      - REDEEM LINK
        - Details / Equation
      - SUBMIT TWEET
        - Details / Equation
        - Spend \$TWE
      - VOTE
        - Details / Equation
        - Lock \$TWE in votes
    - Internal operations:
      - TWEET THROUGH ORACLE
        - Spending LINK
    - Maintaining Ecosystem Equilibrium
      - Known Constants
      - Price of \$TWE - determined by supplies of LINK and TWE
      - “Tweether Governance Golden Ratio” Determines:
        - Cost of tweet submission
        - Votes needed to actually tweet
      - Risks
        - Price of \$TWE trending to zero
          - This is mitigated by proper setting of the TGGR
          - Mitigated in V2 by dynamic TGGR dependent on number of tweets suggested, number of suggestions that have actually been tweeted by the protocol, and the oracle price.
        - Whales locking up the protocol
          - Obtaining more than TGGR amount of \$TWE and voting excessively / not voting.
        - Breaking twitter terms of service
          - Tweets get voted in that do not adhere to terms of service
          - Future plans to oraclize this and punish submitters
- Release plan
- Future plans
  - Twitter terms of service tweet suggestion removal
  - Follow through on tweets successfully sent - rewards slashed if not
  - Maybe tweak the winning submission rewards
  - Allowing multiple twitter accounts to sign up with multitoken standard

Abstract

Getting updates in the world and sending messages is at the moment, a very centralized operation. We have designed a governance protocol to send tweets based on the population of people. Using this voting protocol, \$TWE holders can both submit and vote on tweets that allows for decentralized communications to be sent out into the world.

Votes needed to tweet are based on the Tweether Governance Golden Ratio (TGGR) of supply of \$TWE. In V1 this will be hard coded, but in V2 this will be based off calculated values. The platform uses Chainlink Oracles to send the tweets, and in future versions, uses Chainlink oracles to follow up on whether these tweets were successfully sent.

Ideology

Users should be able to stake their \$TWE to vote for tweets on a democratized platform. To send the tweets, we want to do this in a decentralized manner.

On-chain Architecture

V1

The Tweether Ratio is the number used to calculate how much a submission cost (and burnt), based on the cost of the oracle. The Tweether Ratio is hard coded.

Future Plans

V2

The Tweether Ratio is calculated based off the number of tweets that have been tweeted and the number of submitted tweets.

const Tweether = artifacts.require('Tweether')
const MockERC20 = artifacts.require('MockERC20')
const MockOracle = artifacts.require('MockOracle')
const NFTwe = artifacts.require('NFTwe')

require('chai').use(require('chai-as-promised')).should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

function wadDiv(x, y) {
  return (x * WAD + y / 2) / y
}

contract('Tweether', (accounts) => {
  const [deployer, user1] = accounts

  WAD = 10 ** 18

  let link, oracle, nftwe, tweether
  const denominator = 5 * WAD

  beforeEach(async () => {
    link = await MockERC20.new({ from: deployer })
    oracle = await MockOracle.new(link.address, { from: deployer })
    nftwe = await NFTwe.new({ from: deployer })
    tweether = await Tweether.new(oracle.address, nftwe.address, denominator.toString(), { from: deployer })
    await nftwe.transferOwnership(tweether.address, { from: deployer })
  })

  describe('deployment', async () => {
    it('sets the correct state variables', async () => {
      let linkAddress = await tweether.link()
      linkAddress.should.equal(link.address)
      let oracleAddress = await tweether.oracle()
      oracleAddress.should.equal(oracle.address)
      let denom = await tweether.tweetherDenominator()
      denom.toString().should.equal(denominator.toString())
    })

    it('sets the correct oracle values', async () => {
      let oracleCostResult = await tweether.oracleCost()
      let { 0: price, 1: decimals } = oracleCostResult

      let actualOracleCost = await oracle.price()
      let { 0: expectedPrice, 1: expectedDecimals } = actualOracleCost

      price.toString().should.equal(expectedPrice.toString())
      decimals.toString().should.equal(expectedDecimals.toString())
    })

    it('sets the correct LINK balance at 0', async () => {
      let linkBalanceResult = await tweether.linkBalance()
      linkBalanceResult.toString().should.equal('0')
    })

    it('reverts TWE value calculation due to division by zero', async () => {
      await tweether.tweValueInLink().should.be.rejectedWith(EVM_REVERT)
    })

    it('sends mock LINK to the deployer', async () => {
      let linkBalanceResult = await link.balanceOf(deployer)
      let expectedMintAmount = 100 * WAD
      linkBalanceResult.toString().should.equal(expectedMintAmount.toString())
    })
  })

  describe('minting and burning', async () => {
    it('mints TWE for LINK 1:1 before any proposals or tweets', async () => {
      let linkSuppliedAmount = 4 * WAD
      let deployerInitialLinkBalance = await link.balanceOf(deployer)
      let deployerInitialTweBalance = await tweether.balanceOf(deployer)
      let tweetherInitialTotalSupply = await tweether.totalSupply()
      let tweetherInitialLinkBalance = await tweether.linkBalance()

      //Cover the first ever mint
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })

      let deployerFirstLinkBalance = await link.balanceOf(deployer)
      let deployerFirstTweBalance = await tweether.balanceOf(deployer)
      let tweetherFirstTotalSupply = await tweether.totalSupply()
      let tweetherFirstLinkBalance = await tweether.linkBalance()

      deployerFirstLinkBalance.toString().should.equal((deployerInitialLinkBalance - linkSuppliedAmount).toString())
      deployerFirstTweBalance
        .toString()
        .should.equal((linkSuppliedAmount + parseInt(deployerInitialTweBalance)).toString())
      tweetherFirstTotalSupply
        .toString()
        .should.equal((linkSuppliedAmount + parseInt(tweetherInitialTotalSupply)).toString())
      tweetherFirstLinkBalance
        .toString()
        .should.equal((linkSuppliedAmount + parseInt(tweetherInitialLinkBalance)).toString())

      // Cover mints after the first ever mint
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })

      let deployerSecondLinkBalance = await link.balanceOf(deployer)
      let deployerSecondTweBalance = await tweether.balanceOf(deployer)
      let tweetherSecondTotalSupply = await tweether.totalSupply()
      let tweetherSecondLinkBalance = await tweether.linkBalance()

      deployerSecondLinkBalance.toString().should.equal((deployerFirstLinkBalance - linkSuppliedAmount).toString())
      deployerSecondTweBalance
        .toString()
        .should.equal((linkSuppliedAmount * 2 + parseInt(deployerInitialTweBalance)).toString())
      tweetherSecondTotalSupply
        .toString()
        .should.equal((linkSuppliedAmount * 2 + parseInt(tweetherInitialTotalSupply)).toString())
      tweetherSecondLinkBalance
        .toString()
        .should.equal((linkSuppliedAmount * 2 + parseInt(tweetherInitialLinkBalance)).toString())
    })

    it('burns TWE for LINK 1:1 before any proposals or tweets', async () => {
      let linkSuppliedAmount = 4 * WAD
      let burnAmount = linkSuppliedAmount / 2
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })

      let deployerInitialLinkBalance = await link.balanceOf(deployer)
      let deployerInitialTweBalance = await tweether.balanceOf(deployer)
      let tweetherInitialTotalSupply = await tweether.totalSupply()
      let tweetherInitialLinkBalance = await tweether.linkBalance()

      await tweether.burn(burnAmount.toString(), { from: deployer })

      let deployerAfterLinkBalance = await link.balanceOf(deployer)
      let deployerAfterTweBalance = await tweether.balanceOf(deployer)
      let tweetherAfterTotalSupply = await tweether.totalSupply()
      let tweetherAfterLinkBalance = await tweether.linkBalance()

      deployerAfterLinkBalance
        .toString()
        .should.equal((parseInt(deployerInitialLinkBalance) + parseInt(burnAmount)).toString())
      deployerAfterTweBalance
        .toString()
        .should.equal((parseInt(deployerInitialTweBalance) - parseInt(burnAmount)).toString())
      tweetherAfterTotalSupply
        .toString()
        .should.equal((parseInt(tweetherInitialTotalSupply) - parseInt(burnAmount)).toString())
      tweetherAfterLinkBalance
        .toString()
        .should.equal((parseInt(tweetherInitialLinkBalance) - parseInt(burnAmount)).toString())
    })
  })

  describe('proposal cost', async () => {
    beforeEach(async () => {
      let linkSuppliedAmount = 4 * WAD
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })
    })

    it('costs (1 / denominator) in TWE to propose a single tweet', async () => {
      let oracleCostResult = await tweether.oracleCost()
      let { 0: priceReturned, 1: decimalsReturned } = oracleCostResult
      let expectedPrice = priceReturned / (denominator / WAD)

      let tweCost = await tweether.tweSingleProposalCost({ from: deployer })
      tweCost.toString().should.equal(expectedPrice.toString())
    })
  })

  describe('proposing a tweet', async () => {
    beforeEach(async () => {
      let linkSuppliedAmount = 4 * WAD
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })
    })

    it('submits a proposal for 1 day burns 1/denominator TWE', async () => {
      let oracleCostResult = await tweether.oracleCost()
      let { 0: priceReturned, 1: decimalsReturned } = oracleCostResult
      let expectedPrice = priceReturned / (denominator / WAD)

      let oneDayTweet = 'This is a 1 day tweet.'
      let proposalReturn = await tweether.proposeTweet(1, oneDayTweet)
      let eventLog = proposalReturn.logs[0]
      eventLog.args.value.toString().should.equal(expectedPrice.toString())
    })

    it('submits a proposal for 1 day and sets the correct expiry date', async () => {
      let oneDayTweet = 'This is a 1 day tweet.'
      let tomorrow = Math.floor(Date.now() / 1000) + 24 * 60 * 60
      let lowerDateLimit = tomorrow - 120
      let upperDateLimit = tomorrow + 120
      let proposalReturn = await tweether.proposeTweet(1, oneDayTweet)
      let eventLog = proposalReturn.logs[1]
      parseInt(eventLog.args.expiryDate).should.be.gt(lowerDateLimit)
      parseInt(eventLog.args.expiryDate).should.be.lt(upperDateLimit)
    })

    it('submits a proposal for 5 day burns 5/denominator TWE', async () => {
      let oracleCostResult = await tweether.oracleCost()
      let { 0: priceReturned, 1: decimalsReturned } = oracleCostResult
      let expectedPrice = (priceReturned * 5) / (denominator / WAD)

      let oneDayTweet = 'This is a 1 day tweet.'
      let proposalReturn = await tweether.proposeTweet(5, oneDayTweet)
      let eventLog = proposalReturn.logs[0]
      eventLog.args.value.toString().should.equal(expectedPrice.toString())
    })

    it('submits a proposal for 5 day and sets the correct expiry date', async () => {
      let fiveDayTweet = 'This is a 5 day tweet.'
      let tomorrow = Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60
      let lowerDateLimit = tomorrow - 120
      let upperDateLimit = tomorrow + 120
      let proposalReturn = await tweether.proposeTweet(5, fiveDayTweet)
      let eventLog = proposalReturn.logs[1]
      parseInt(eventLog.args.expiryDate).should.be.gt(lowerDateLimit)
      parseInt(eventLog.args.expiryDate).should.be.lt(upperDateLimit)
    })

    it('creates a proposal', async () => {
      let oneDayTweet = 'This is a 1 day tweet.'
      let proposalReturn = await tweether.proposeTweet(1, oneDayTweet)
      let proposalId = proposalReturn.logs[1].args.proposalId
      let prop = await tweether.getTweetProposal(proposalId.toString())
      prop[0].toString().should.equal(deployer.toString())
      prop[2].toString().should.equal(oneDayTweet)
      prop[3].toString().should.equal('0')
      prop[4].should.equal(false)
    })
  })

  describe('voting on proposals', async () => {
    let proposalReturn, proposalId, linkSuppliedAmount
    beforeEach(async () => {
      let oneDayTweet = 'This is a 1 day tweet.'
      linkSuppliedAmount = 10 * WAD
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })
      proposalReturn = await tweether.proposeTweet(1, oneDayTweet)
      proposalId = proposalReturn.logs[1].args.proposalId
    })

    it('should require the correct amount of votes to pass', async () => {
      let tSupply = await tweether.totalSupply()
      let expected = wadDiv(tSupply, denominator)
      let votesRequired = await tweether.votesRequired()
      votesRequired.toString().should.equal(expected.toString())
    })

    it('1 owner votes small amount', async () => {
      let response = await tweether.vote(proposalId.toString(), WAD.toString())
      let proposalDetails = await tweether.getTweetProposal(proposalId.toString())
      proposalDetails[3].toString().should.equal(WAD.toString())
      let lockedVotes = await tweether.lockedVotes(deployer)
      lockedVotes.toString().should.equal(WAD.toString())
      // TODO change this to voteAmounts check
      // let voteLocations = await tweether.voteLocations(deployer, proposalId.toString())
      // voteLocations.should.equal(true)
    })

    it('1 owner votes enough to accept', async () => {
      let tweBalance = await tweether.balanceOf(deployer)
      let lockedVotes = await tweether.lockedVotes(deployer)
      let votesLeft = tweBalance - lockedVotes
      let votes = votesLeft / 2
      // Make sure that votes is supposed to be greater than votes required first
      let votesRequired = await tweether.votesRequired()
      parseInt(votes).should.be.gt(parseInt(votesRequired))

      let response = await tweether.vote(proposalId.toString(), votes.toString())
      let eventLog = response.logs[1]
      eventLog.event.toString().should.equal('TweetAccepted')
    })

    it('2nd voter votes enough to accept', async () => {
      await link.transfer(user1, linkSuppliedAmount.toString(), { from: deployer })
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: user1 })
      await tweether.mint(linkSuppliedAmount.toString(), { from: user1 })

      let votes = (await tweether.votesRequired()) / 2

      let response = await tweether.vote(proposalId.toString(), votes.toString())
      response.logs.length.should.equal(1)

      response = await tweether.vote(proposalId.toString(), votes.toString())
      eventLog = response.logs[1]
      eventLog.event.toString().should.equal('TweetAccepted')
    })

    // TODO: check all state changes:
    //  - Tweet.votes
    //  - Tweet.voters
    //  - voteAmounts
    //  - lockedVotes
  })

  describe('unvoting on proposals', async () => {
    let proposalReturn, proposalId, linkSuppliedAmount, votes
    beforeEach(async () => {
      let oneDayTweet = 'This is a 1 day tweet.'
      linkSuppliedAmount = 10 * WAD
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })
      proposalReturn = await tweether.proposeTweet(1, oneDayTweet)
      proposalId = proposalReturn.logs[1].args.proposalId
      votes = WAD * 2
      await tweether.vote(proposalId.toString(), votes.toString())
    })

    it('unvotes', async () => {
      let votesLocked = await tweether.lockedVotes(deployer)
      votesLocked.toString().should.equal(votes.toString())
      // TODO: change this to voteAmounts check
      // let voteLocations = await tweether.voteLocations(deployer, proposalId.toString())
      // voteLocations.should.equal(true)

      let unvotes = votes / 2
      await tweether.unvote(proposalId.toString(), unvotes.toString(), { from: deployer })
      votesLocked = await tweether.lockedVotes(deployer)
      votesLocked.toString().should.equal(unvotes.toString())
      // TODO: change this to voteAmounts check
      // voteLocations = await tweether.voteLocations(deployer, proposalId.toString())
      // voteLocations.should.equal(true)
    })

    // TODO: check all state changes:
    //  - Tweet.votes
    //  - Tweet.voters
    //  - voteAmounts
    //  - lockedVotes
  })
})
